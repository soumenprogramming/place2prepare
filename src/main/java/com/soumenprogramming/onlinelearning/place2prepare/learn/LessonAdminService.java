package com.soumenprogramming.onlinelearning.place2prepare.learn;

import com.soumenprogramming.onlinelearning.place2prepare.course.Course;
import com.soumenprogramming.onlinelearning.place2prepare.course.CourseRepository;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.ActivityLog;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.ActivityLogRepository;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.Enrollment;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.EnrollmentRepository;
import com.soumenprogramming.onlinelearning.place2prepare.learn.dto.AdminLessonRequest;
import com.soumenprogramming.onlinelearning.place2prepare.learn.dto.AdminLessonResponse;
import com.soumenprogramming.onlinelearning.place2prepare.user.User;
import com.soumenprogramming.onlinelearning.place2prepare.user.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class LessonAdminService {

    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LessonService lessonService;
    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;

    public LessonAdminService(CourseRepository courseRepository,
                              LessonRepository lessonRepository,
                              LessonProgressRepository lessonProgressRepository,
                              EnrollmentRepository enrollmentRepository,
                              LessonService lessonService,
                              ActivityLogRepository activityLogRepository,
                              UserRepository userRepository) {
        this.courseRepository = courseRepository;
        this.lessonRepository = lessonRepository;
        this.lessonProgressRepository = lessonProgressRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.lessonService = lessonService;
        this.activityLogRepository = activityLogRepository;
        this.userRepository = userRepository;
    }

    public List<AdminLessonResponse> list(Long courseId) {
        requireCourse(courseId);
        return lessonRepository.findByCourseIdOrderByPositionAsc(courseId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AdminLessonResponse create(Long courseId, AdminLessonRequest request, String adminEmail) {
        Course course = requireCourse(courseId);
        String slug = normalizeSlug(request.slug());
        if (lessonRepository.existsByCourseIdAndSlug(courseId, slug)) {
            throw new ResponseStatusException(BAD_REQUEST, "Lesson slug already exists in this course");
        }

        int position = resolvePosition(courseId, request.position());
        Lesson lesson = new Lesson(
                course,
                request.title().trim(),
                slug,
                position,
                request.contentMarkdown(),
                trimToNull(request.videoUrl()),
                request.durationMinutes()
        );
        Lesson saved = lessonRepository.save(lesson);
        recomputeAllEnrollments(courseId);
        logAction(adminEmail, "Created lesson: " + saved.getTitle() + " for course " + course.getTitle());
        return toResponse(saved);
    }

    @Transactional
    public AdminLessonResponse update(Long courseId, Long lessonId, AdminLessonRequest request, String adminEmail) {
        Course course = requireCourse(courseId);
        Lesson lesson = lessonRepository.findByIdAndCourseId(lessonId, courseId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Lesson not found"));

        String slug = normalizeSlug(request.slug());
        if (lessonRepository.existsByCourseIdAndSlugAndIdNot(courseId, slug, lessonId)) {
            throw new ResponseStatusException(BAD_REQUEST, "Lesson slug already exists in this course");
        }

        lesson.setTitle(request.title().trim());
        lesson.setSlug(slug);
        lesson.setContentMarkdown(request.contentMarkdown());
        lesson.setVideoUrl(trimToNull(request.videoUrl()));
        lesson.setDurationMinutes(request.durationMinutes());
        if (request.position() != null && request.position() > 0) {
            lesson.setPosition(request.position());
        }
        lesson.touch();
        Lesson saved = lessonRepository.save(lesson);
        logAction(adminEmail, "Updated lesson: " + saved.getTitle() + " (course " + course.getTitle() + ")");
        return toResponse(saved);
    }

    @Transactional
    public void delete(Long courseId, Long lessonId, String adminEmail) {
        Course course = requireCourse(courseId);
        Lesson lesson = lessonRepository.findByIdAndCourseId(lessonId, courseId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Lesson not found"));
        String title = lesson.getTitle();

        lessonProgressRepository.deleteByLessonId(lessonId);
        lessonRepository.delete(lesson);
        recomputeAllEnrollments(courseId);
        logAction(adminEmail, "Deleted lesson: " + title + " (course " + course.getTitle() + ")");
    }

    private Course requireCourse(Long courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Course not found"));
    }

    private int resolvePosition(Long courseId, Integer requested) {
        if (requested != null && requested > 0) {
            return requested;
        }
        return lessonRepository.findTopByCourseIdOrderByPositionDesc(courseId)
                .map(top -> top.getPosition() + 1)
                .orElse(1);
    }

    private void recomputeAllEnrollments(Long courseId) {
        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId);
        for (Enrollment enrollment : enrollments) {
            lessonService.recomputeEnrollmentProgress(enrollment);
        }
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

    private AdminLessonResponse toResponse(Lesson lesson) {
        return new AdminLessonResponse(
                lesson.getId(),
                lesson.getCourse().getId(),
                lesson.getTitle(),
                lesson.getSlug(),
                lesson.getPosition(),
                lesson.getDurationMinutes(),
                lesson.getContentMarkdown(),
                lesson.getVideoUrl(),
                lesson.getCreatedAt(),
                lesson.getUpdatedAt()
        );
    }
}
