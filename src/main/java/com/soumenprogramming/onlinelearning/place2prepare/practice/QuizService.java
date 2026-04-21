package com.soumenprogramming.onlinelearning.place2prepare.practice;

import com.soumenprogramming.onlinelearning.place2prepare.dashboard.Enrollment;
import com.soumenprogramming.onlinelearning.place2prepare.learn.EnrollmentAccessService;
import com.soumenprogramming.onlinelearning.place2prepare.practice.dto.AttemptHistoryItem;
import com.soumenprogramming.onlinelearning.place2prepare.practice.dto.AttemptOptionView;
import com.soumenprogramming.onlinelearning.place2prepare.practice.dto.AttemptQuestionView;
import com.soumenprogramming.onlinelearning.place2prepare.practice.dto.AttemptResponse;
import com.soumenprogramming.onlinelearning.place2prepare.practice.dto.QuizListResponse;
import com.soumenprogramming.onlinelearning.place2prepare.practice.dto.QuizSummary;
import com.soumenprogramming.onlinelearning.place2prepare.practice.dto.SubmitAttemptRequest;
import com.soumenprogramming.onlinelearning.place2prepare.user.User;
import com.soumenprogramming.onlinelearning.place2prepare.user.UserRepository;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class QuizService {

    private static final int SUBMIT_GRACE_SECONDS = 30;

    private final EnrollmentAccessService enrollmentAccessService;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final UserRepository userRepository;

    public QuizService(EnrollmentAccessService enrollmentAccessService,
                       QuizRepository quizRepository,
                       QuestionRepository questionRepository,
                       QuizAttemptRepository quizAttemptRepository,
                       UserRepository userRepository) {
        this.enrollmentAccessService = enrollmentAccessService;
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.quizAttemptRepository = quizAttemptRepository;
        this.userRepository = userRepository;
    }

    public QuizListResponse listForStudent(String email, Long courseId) {
        Enrollment enrollment = enrollmentAccessService.requireAccess(email, courseId);
        List<Quiz> quizzes = quizRepository.findByCourseIdAndPublishedTrueOrderByCreatedAtAsc(courseId);
        Long userId = enrollment.getUser().getId();

        List<QuizSummary> summaries = quizzes.stream()
                .map(quiz -> buildSummary(userId, quiz))
                .toList();

        return new QuizListResponse(
                enrollment.getCourse().getId(),
                enrollment.getCourse().getTitle(),
                summaries.size(),
                summaries
        );
    }

    @Transactional
    public AttemptResponse startAttempt(String email, Long courseId, Long quizId) {
        Enrollment enrollment = enrollmentAccessService.requireAccess(email, courseId);
        Quiz quiz = requirePublishedQuiz(courseId, quizId);
        User user = userRepository.findById(enrollment.getUser().getId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));

        Optional<QuizAttempt> inProgress = quizAttemptRepository
                .findTopByUserIdAndQuizIdAndStatusOrderByStartedAtDesc(user.getId(), quiz.getId(), AttemptStatus.IN_PROGRESS);
        if (inProgress.isPresent()) {
            return toAttemptResponse(inProgress.get());
        }

        int total = quiz.getQuestions().size();
        if (total == 0) {
            throw new ResponseStatusException(BAD_REQUEST, "This quiz has no questions yet");
        }

        QuizAttempt attempt = new QuizAttempt(user, quiz, total);
        QuizAttempt saved = quizAttemptRepository.save(attempt);
        return toAttemptResponse(saved);
    }

    public AttemptResponse getAttempt(String email, Long attemptId) {
        QuizAttempt attempt = loadOwnedAttempt(email, attemptId);
        return toAttemptResponse(attempt);
    }

    @Transactional
    public AttemptResponse submitAttempt(String email, Long attemptId, SubmitAttemptRequest request) {
        QuizAttempt attempt = loadOwnedAttempt(email, attemptId);
        if (attempt.getStatus() == AttemptStatus.SUBMITTED) {
            return toAttemptResponse(attempt);
        }
        if (attempt.getStatus() == AttemptStatus.ABANDONED) {
            throw new ResponseStatusException(BAD_REQUEST, "This attempt has been abandoned");
        }

        enrollmentAccessService.requireAccess(email, attempt.getQuiz().getCourse().getId());

        long elapsedSeconds = Instant.now().getEpochSecond() - attempt.getStartedAt().getEpochSecond();
        long limitSeconds = (long) attempt.getTimeLimitMinutesSnapshot() * 60L + SUBMIT_GRACE_SECONDS;
        boolean timedOut = elapsedSeconds > limitSeconds;

        Map<Long, Long> selectionByQuestion = new HashMap<>();
        if (request != null && request.answers() != null) {
            for (SubmitAttemptRequest.AnswerPayload payload : request.answers()) {
                if (payload == null || payload.questionId() == null) continue;
                selectionByQuestion.put(payload.questionId(), payload.optionId());
            }
        }

        List<Question> questions = attempt.getQuiz().getQuestions();
        attempt.getAnswers().clear();
        int correct = 0;
        for (Question question : questions) {
            Long chosenOptionId = selectionByQuestion.get(question.getId());
            QuestionOption chosenOption = null;
            boolean isCorrect = false;
            if (chosenOptionId != null) {
                chosenOption = question.getOptions().stream()
                        .filter(opt -> opt.getId().equals(chosenOptionId))
                        .findFirst()
                        .orElse(null);
                if (chosenOption != null) {
                    isCorrect = chosenOption.isCorrect();
                    if (isCorrect) correct++;
                }
            }
            attempt.getAnswers().add(new AttemptAnswer(attempt, question, chosenOption, isCorrect));
        }

        int total = questions.size();
        int scorePercent = total == 0 ? 0 : (int) Math.round((correct * 100.0) / total);
        attempt.setCorrectAnswers(correct);
        attempt.setScorePercent(scorePercent);
        attempt.setStatus(timedOut ? AttemptStatus.SUBMITTED : AttemptStatus.SUBMITTED);
        attempt.setSubmittedAt(Instant.now());
        QuizAttempt saved = quizAttemptRepository.save(attempt);
        return toAttemptResponse(saved);
    }

    public List<AttemptHistoryItem> history(String email, Long courseId, Long quizId) {
        Enrollment enrollment = enrollmentAccessService.requireAccess(email, courseId);
        Quiz quiz = requirePublishedQuiz(courseId, quizId);
        return quizAttemptRepository
                .findByUserIdAndQuizIdOrderByStartedAtDesc(enrollment.getUser().getId(), quiz.getId())
                .stream()
                .map(this::toHistoryItem)
                .toList();
    }

    private AttemptHistoryItem toHistoryItem(QuizAttempt attempt) {
        boolean passed = attempt.getStatus() == AttemptStatus.SUBMITTED
                && attempt.getScorePercent() >= attempt.getQuiz().getPassingScorePercent();
        return new AttemptHistoryItem(
                attempt.getId(),
                attempt.getStatus().name(),
                attempt.getStartedAt(),
                attempt.getSubmittedAt(),
                attempt.getTotalQuestions(),
                attempt.getCorrectAnswers(),
                attempt.getScorePercent(),
                passed
        );
    }

    private QuizAttempt loadOwnedAttempt(String email, Long attemptId) {
        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Attempt not found"));
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));
        if (!attempt.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(FORBIDDEN, "You do not have access to this attempt");
        }
        return attempt;
    }

    private Quiz requirePublishedQuiz(Long courseId, Long quizId) {
        Quiz quiz = quizRepository.findByIdAndCourseId(quizId, courseId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Quiz not found"));
        if (!quiz.isPublished()) {
            throw new ResponseStatusException(NOT_FOUND, "Quiz not found");
        }
        return quiz;
    }

    private QuizSummary buildSummary(Long userId, Quiz quiz) {
        int questionCount = quiz.getQuestions().size();
        List<QuizAttempt> attempts = quizAttemptRepository
                .findByUserIdAndQuizIdOrderByStartedAtDesc(userId, quiz.getId());

        int submittedCount = 0;
        Integer best = null;
        Integer lastScore = null;
        String lastStatus = null;
        Long inProgressAttemptId = null;
        for (QuizAttempt attempt : attempts) {
            if (attempt.getStatus() == AttemptStatus.IN_PROGRESS) {
                inProgressAttemptId = attempt.getId();
                if (lastStatus == null) lastStatus = attempt.getStatus().name();
                continue;
            }
            if (attempt.getStatus() == AttemptStatus.SUBMITTED) {
                submittedCount++;
                if (best == null || attempt.getScorePercent() > best) {
                    best = attempt.getScorePercent();
                }
                if (lastScore == null) {
                    lastScore = attempt.getScorePercent();
                    lastStatus = attempt.getStatus().name();
                }
            }
        }

        return new QuizSummary(
                quiz.getId(),
                quiz.getTitle(),
                quiz.getSlug(),
                quiz.getDescription(),
                quiz.getTimeLimitMinutes(),
                quiz.getPassingScorePercent(),
                questionCount,
                submittedCount,
                best,
                lastScore,
                lastStatus,
                inProgressAttemptId
        );
    }

    AttemptResponse toAttemptResponse(QuizAttempt attempt) {
        boolean isSubmitted = attempt.getStatus() == AttemptStatus.SUBMITTED;

        Map<Long, AttemptAnswer> answersByQuestion = new HashMap<>();
        for (AttemptAnswer answer : attempt.getAnswers()) {
            answersByQuestion.put(answer.getQuestion().getId(), answer);
        }

        List<Question> questions = new ArrayList<>(attempt.getQuiz().getQuestions());
        questions.sort(Comparator.comparingInt(Question::getPosition));

        List<AttemptQuestionView> questionViews = new ArrayList<>();
        for (Question question : questions) {
            AttemptAnswer answer = answersByQuestion.get(question.getId());
            Long selectedOptionId = answer == null || answer.getSelectedOption() == null
                    ? null
                    : answer.getSelectedOption().getId();

            List<AttemptOptionView> optionViews = question.getOptions().stream()
                    .sorted(Comparator.comparingInt(QuestionOption::getPosition))
                    .map(option -> new AttemptOptionView(
                            option.getId(),
                            option.getText(),
                            option.getPosition(),
                            isSubmitted ? option.isCorrect() : null,
                            selectedOptionId != null && selectedOptionId.equals(option.getId())
                    ))
                    .toList();

            questionViews.add(new AttemptQuestionView(
                    question.getId(),
                    question.getPrompt(),
                    question.getPosition(),
                    isSubmitted ? question.getExplanation() : null,
                    isSubmitted && answer != null ? answer.isCorrect() : null,
                    optionViews
            ));
        }

        boolean passed = isSubmitted
                && attempt.getScorePercent() >= attempt.getQuiz().getPassingScorePercent();

        return new AttemptResponse(
                attempt.getId(),
                attempt.getQuiz().getId(),
                attempt.getQuiz().getTitle(),
                attempt.getQuiz().getCourse().getId(),
                attempt.getQuiz().getCourse().getTitle(),
                attempt.getStatus().name(),
                attempt.getStartedAt(),
                attempt.getSubmittedAt(),
                attempt.getTimeLimitMinutesSnapshot(),
                attempt.getTotalQuestions(),
                attempt.getCorrectAnswers(),
                attempt.getScorePercent(),
                attempt.getQuiz().getPassingScorePercent(),
                passed,
                questionViews
        );
    }
}
