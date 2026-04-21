package com.soumenprogramming.onlinelearning.place2prepare.practice;

import com.soumenprogramming.onlinelearning.place2prepare.course.Course;
import com.soumenprogramming.onlinelearning.place2prepare.course.CourseRepository;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.ActivityLog;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.ActivityLogRepository;
import com.soumenprogramming.onlinelearning.place2prepare.practice.dto.AdminQuestionRequest;
import com.soumenprogramming.onlinelearning.place2prepare.practice.dto.AdminQuestionResponse;
import com.soumenprogramming.onlinelearning.place2prepare.practice.dto.AdminQuizRequest;
import com.soumenprogramming.onlinelearning.place2prepare.practice.dto.AdminQuizResponse;
import com.soumenprogramming.onlinelearning.place2prepare.user.User;
import com.soumenprogramming.onlinelearning.place2prepare.user.UserRepository;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class QuizAdminService {

    private final CourseRepository courseRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;

    public QuizAdminService(CourseRepository courseRepository,
                            QuizRepository quizRepository,
                            QuestionRepository questionRepository,
                            QuizAttemptRepository quizAttemptRepository,
                            ActivityLogRepository activityLogRepository,
                            UserRepository userRepository) {
        this.courseRepository = courseRepository;
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.quizAttemptRepository = quizAttemptRepository;
        this.activityLogRepository = activityLogRepository;
        this.userRepository = userRepository;
    }

    public List<AdminQuizResponse> list(Long courseId) {
        requireCourse(courseId);
        return quizRepository.findByCourseIdOrderByCreatedAtAsc(courseId).stream()
                .map(this::toResponse)
                .toList();
    }

    public AdminQuizResponse get(Long courseId, Long quizId) {
        requireCourse(courseId);
        Quiz quiz = quizRepository.findByIdAndCourseId(quizId, courseId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Quiz not found"));
        return toResponse(quiz);
    }

    @Transactional
    public AdminQuizResponse create(Long courseId, AdminQuizRequest request, String adminEmail) {
        Course course = requireCourse(courseId);
        String slug = normalizeSlug(request.slug());
        if (quizRepository.existsByCourseIdAndSlug(courseId, slug)) {
            throw new ResponseStatusException(BAD_REQUEST, "Quiz slug already exists in this course");
        }
        Quiz quiz = new Quiz(
                course,
                request.title().trim(),
                slug,
                request.description().trim(),
                request.timeLimitMinutes(),
                request.passingScorePercent(),
                Boolean.TRUE.equals(request.published())
        );
        Quiz saved = quizRepository.save(quiz);
        logAction(adminEmail, "Created quiz: " + saved.getTitle() + " for course " + course.getTitle());
        return toResponse(saved);
    }

    @Transactional
    public AdminQuizResponse update(Long courseId, Long quizId, AdminQuizRequest request, String adminEmail) {
        Course course = requireCourse(courseId);
        Quiz quiz = quizRepository.findByIdAndCourseId(quizId, courseId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Quiz not found"));
        String slug = normalizeSlug(request.slug());
        if (quizRepository.existsByCourseIdAndSlugAndIdNot(courseId, slug, quizId)) {
            throw new ResponseStatusException(BAD_REQUEST, "Quiz slug already exists in this course");
        }
        quiz.setTitle(request.title().trim());
        quiz.setSlug(slug);
        quiz.setDescription(request.description().trim());
        quiz.setTimeLimitMinutes(request.timeLimitMinutes());
        quiz.setPassingScorePercent(request.passingScorePercent());
        quiz.setPublished(Boolean.TRUE.equals(request.published()));
        quiz.touch();
        Quiz saved = quizRepository.save(quiz);
        logAction(adminEmail, "Updated quiz: " + saved.getTitle() + " (course " + course.getTitle() + ")");
        return toResponse(saved);
    }

    @Transactional
    public void delete(Long courseId, Long quizId, String adminEmail) {
        Course course = requireCourse(courseId);
        Quiz quiz = quizRepository.findByIdAndCourseId(quizId, courseId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Quiz not found"));
        String title = quiz.getTitle();
        quizAttemptRepository.deleteByQuizId(quizId);
        quizRepository.delete(quiz);
        logAction(adminEmail, "Deleted quiz: " + title + " (course " + course.getTitle() + ")");
    }

    @Transactional
    public AdminQuestionResponse addQuestion(Long courseId, Long quizId, AdminQuestionRequest request, String adminEmail) {
        Course course = requireCourse(courseId);
        Quiz quiz = quizRepository.findByIdAndCourseId(quizId, courseId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Quiz not found"));
        validateOptions(request.options());

        int position = request.position() != null && request.position() > 0
                ? request.position()
                : nextQuestionPosition(quizId);

        Question question = new Question(
                quiz,
                request.prompt().trim(),
                trimToNull(request.explanation()),
                position
        );
        writeOptions(question, request.options());
        Question saved = questionRepository.save(question);
        quiz.touch();
        quizRepository.save(quiz);
        logAction(adminEmail, "Added question to quiz: " + quiz.getTitle() + " (course " + course.getTitle() + ")");
        return toQuestionResponse(saved);
    }

    @Transactional
    public AdminQuestionResponse updateQuestion(Long courseId, Long quizId, Long questionId,
                                                AdminQuestionRequest request, String adminEmail) {
        Course course = requireCourse(courseId);
        Quiz quiz = quizRepository.findByIdAndCourseId(quizId, courseId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Quiz not found"));
        Question question = questionRepository.findByIdAndQuizId(questionId, quizId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Question not found"));
        validateOptions(request.options());

        question.setPrompt(request.prompt().trim());
        question.setExplanation(trimToNull(request.explanation()));
        if (request.position() != null && request.position() > 0) {
            question.setPosition(request.position());
        }
        question.clearOptions();
        writeOptions(question, request.options());
        Question saved = questionRepository.save(question);
        quiz.touch();
        quizRepository.save(quiz);
        logAction(adminEmail, "Updated question in quiz: " + quiz.getTitle() + " (course " + course.getTitle() + ")");
        return toQuestionResponse(saved);
    }

    @Transactional
    public void deleteQuestion(Long courseId, Long quizId, Long questionId, String adminEmail) {
        Course course = requireCourse(courseId);
        Quiz quiz = quizRepository.findByIdAndCourseId(quizId, courseId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Quiz not found"));
        Question question = questionRepository.findByIdAndQuizId(questionId, quizId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Question not found"));
        questionRepository.delete(question);
        quiz.touch();
        quizRepository.save(quiz);
        logAction(adminEmail, "Deleted question from quiz: " + quiz.getTitle() + " (course " + course.getTitle() + ")");
    }

    private Course requireCourse(Long courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Course not found"));
    }

    private void validateOptions(List<AdminQuestionRequest.AdminOptionRequest> options) {
        if (options == null || options.size() < 2) {
            throw new ResponseStatusException(BAD_REQUEST, "Each question needs at least 2 options");
        }
        long correctCount = options.stream().filter(AdminQuestionRequest.AdminOptionRequest::correct).count();
        if (correctCount != 1) {
            throw new ResponseStatusException(BAD_REQUEST, "Exactly one option must be marked correct");
        }
    }

    private void writeOptions(Question question, List<AdminQuestionRequest.AdminOptionRequest> options) {
        int idx = 1;
        for (AdminQuestionRequest.AdminOptionRequest payload : options) {
            int position = payload.position() != null && payload.position() > 0 ? payload.position() : idx;
            question.addOption(new QuestionOption(
                    question,
                    payload.text().trim(),
                    payload.correct(),
                    position
            ));
            idx++;
        }
    }

    private int nextQuestionPosition(Long quizId) {
        return questionRepository.findByQuizIdOrderByPositionAsc(quizId).stream()
                .mapToInt(Question::getPosition)
                .max()
                .orElse(0) + 1;
    }

    private String normalizeSlug(String slug) {
        return slug.trim().toLowerCase();
    }

    private String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private void logAction(String adminEmail, String message) {
        User admin = userRepository.findByEmail(adminEmail.toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Admin not found"));
        activityLogRepository.save(new ActivityLog(admin, message, adminEmail));
    }

    private AdminQuizResponse toResponse(Quiz quiz) {
        List<AdminQuestionResponse> questions = quiz.getQuestions().stream()
                .sorted(Comparator.comparingInt(Question::getPosition))
                .map(this::toQuestionResponse)
                .toList();
        return new AdminQuizResponse(
                quiz.getId(),
                quiz.getCourse().getId(),
                quiz.getCourse().getTitle(),
                quiz.getTitle(),
                quiz.getSlug(),
                quiz.getDescription(),
                quiz.getTimeLimitMinutes(),
                quiz.getPassingScorePercent(),
                quiz.isPublished(),
                questions.size(),
                quiz.getCreatedAt(),
                quiz.getUpdatedAt(),
                questions
        );
    }

    private AdminQuestionResponse toQuestionResponse(Question question) {
        List<AdminQuestionResponse.AdminOptionResponse> options = question.getOptions().stream()
                .sorted(Comparator.comparingInt(QuestionOption::getPosition))
                .map(option -> new AdminQuestionResponse.AdminOptionResponse(
                        option.getId(),
                        option.getText(),
                        option.isCorrect(),
                        option.getPosition()
                ))
                .toList();
        return new AdminQuestionResponse(
                question.getId(),
                question.getQuiz().getId(),
                question.getPrompt(),
                question.getExplanation(),
                question.getPosition(),
                options
        );
    }
}
