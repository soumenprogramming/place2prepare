package com.soumenprogramming.onlinelearning.place2prepare.learn;

import com.soumenprogramming.onlinelearning.place2prepare.dashboard.Enrollment;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.EnrollmentRepository;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.EnrollmentStatus;
import com.soumenprogramming.onlinelearning.place2prepare.learn.dto.LessonCompletionResponse;
import com.soumenprogramming.onlinelearning.place2prepare.learn.dto.LessonDetailResponse;
import com.soumenprogramming.onlinelearning.place2prepare.learn.dto.LessonListResponse;
import com.soumenprogramming.onlinelearning.place2prepare.learn.dto.LessonSummary;
import com.soumenprogramming.onlinelearning.place2prepare.user.User;
import com.soumenprogramming.onlinelearning.place2prepare.user.UserRepository;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class LessonService {

    private final EnrollmentAccessService enrollmentAccessService;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;

    public LessonService(EnrollmentAccessService enrollmentAccessService,
                         LessonRepository lessonRepository,
                         LessonProgressRepository lessonProgressRepository,
                         EnrollmentRepository enrollmentRepository,
                         UserRepository userRepository) {
        this.enrollmentAccessService = enrollmentAccessService;
        this.lessonRepository = lessonRepository;
        this.lessonProgressRepository = lessonProgressRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.userRepository = userRepository;
    }

    public LessonListResponse listForStudent(String email, Long courseId) {
        Enrollment enrollment = enrollmentAccessService.requireAccess(email, courseId);
        List<Lesson> lessons = lessonRepository.findByCourseIdOrderByPositionAsc(courseId);
        Set<Long> completedIds = lessonProgressRepository
                .findByUserIdAndLessonCourseId(enrollment.getUser().getId(), courseId).stream()
                .map(progress -> progress.getLesson().getId())
                .collect(Collectors.toSet());

        List<LessonSummary> summaries = lessons.stream()
                .map(lesson -> new LessonSummary(
                        lesson.getId(),
                        lesson.getTitle(),
                        lesson.getSlug(),
                        lesson.getPosition(),
                        lesson.getDurationMinutes(),
                        completedIds.contains(lesson.getId())
                ))
                .toList();

        int total = summaries.size();
        int completed = (int) summaries.stream().filter(LessonSummary::completed).count();
        int progress = total == 0 ? 0 : Math.min(100, (int) Math.round((completed * 100.0) / total));

        return new LessonListResponse(
                enrollment.getCourse().getId(),
                enrollment.getCourse().getTitle(),
                total,
                completed,
                progress,
                summaries
        );
    }

    public LessonDetailResponse getForStudent(String email, Long courseId, Long lessonId) {
        Enrollment enrollment = enrollmentAccessService.requireAccess(email, courseId);
        Lesson lesson = lessonRepository.findByIdAndCourseId(lessonId, courseId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Lesson not found"));

        List<Lesson> siblings = lessonRepository.findByCourseIdOrderByPositionAsc(courseId);
        Long previousId = null;
        Long nextId = null;
        for (int i = 0; i < siblings.size(); i++) {
            if (siblings.get(i).getId().equals(lesson.getId())) {
                if (i > 0) previousId = siblings.get(i - 1).getId();
                if (i < siblings.size() - 1) nextId = siblings.get(i + 1).getId();
                break;
            }
        }

        boolean completed = lessonProgressRepository
                .existsByUserIdAndLessonId(enrollment.getUser().getId(), lesson.getId());

        return new LessonDetailResponse(
                lesson.getId(),
                enrollment.getCourse().getId(),
                enrollment.getCourse().getTitle(),
                lesson.getTitle(),
                lesson.getSlug(),
                lesson.getPosition(),
                lesson.getDurationMinutes(),
                lesson.getContentMarkdown(),
                lesson.getVideoUrl(),
                completed,
                previousId,
                nextId
        );
    }

    @Transactional
    public LessonCompletionResponse markComplete(String email, Long courseId, Long lessonId, boolean completed) {
        Enrollment enrollment = enrollmentAccessService.requireAccess(email, courseId);
        Lesson lesson = lessonRepository.findByIdAndCourseId(lessonId, courseId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Lesson not found"));
        User user = userRepository.findById(enrollment.getUser().getId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));

        boolean exists = lessonProgressRepository.existsByUserIdAndLessonId(user.getId(), lesson.getId());
        if (completed && !exists) {
            lessonProgressRepository.save(new LessonProgress(user, lesson));
        } else if (!completed && exists) {
            lessonProgressRepository.deleteByUserIdAndLessonId(user.getId(), lesson.getId());
        }

        LessonCompletionResponse summary = recomputeEnrollmentProgress(enrollment);
        return new LessonCompletionResponse(
                lesson.getId(),
                completed,
                summary.completedLessons(),
                summary.totalLessons(),
                summary.progressPercentage(),
                summary.lessonsLeft(),
                summary.enrollmentStatus()
        );

    }

    /**
     * Recomputes progress % and lessons-left for the given enrollment based on completed lessons.
     * Called internally after completion toggles and by admin operations that change lesson totals.
     */
    @Transactional
    public LessonCompletionResponse recomputeEnrollmentProgress(Enrollment enrollment) {
        long total = lessonRepository.countByCourseId(enrollment.getCourse().getId());
        long completedCount = lessonProgressRepository
                .countByUserIdAndLessonCourseId(enrollment.getUser().getId(), enrollment.getCourse().getId());

        if (completedCount > total) {
            completedCount = total;
        }

        int progress = total == 0 ? 0 : (int) Math.round((completedCount * 100.0) / total);
        int lessonsLeft = (int) Math.max(0, total - completedCount);

        enrollment.setProgressPercentage(progress);
        enrollment.setLessonsLeft(lessonsLeft);
        if (total > 0 && completedCount == total && enrollment.getStatus() == EnrollmentStatus.ACTIVE) {
            enrollment.setStatus(EnrollmentStatus.COMPLETED);
        } else if (completedCount < total && enrollment.getStatus() == EnrollmentStatus.COMPLETED) {
            enrollment.setStatus(EnrollmentStatus.ACTIVE);
        }
        enrollmentRepository.save(enrollment);

        return new LessonCompletionResponse(
                null,
                false,
                (int) completedCount,
                (int) total,
                progress,
                lessonsLeft,
                enrollment.getStatus().name()
        );
    }
}
