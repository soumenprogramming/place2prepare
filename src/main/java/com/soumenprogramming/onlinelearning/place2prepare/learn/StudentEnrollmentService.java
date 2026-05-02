package com.soumenprogramming.onlinelearning.place2prepare.learn;

import com.soumenprogramming.onlinelearning.place2prepare.course.Course;
import com.soumenprogramming.onlinelearning.place2prepare.course.CourseRepository;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.ActivityLog;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.ActivityLogRepository;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.Enrollment;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.EnrollmentRepository;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.EnrollmentStatus;
import com.soumenprogramming.onlinelearning.place2prepare.learn.dto.CourseAccessResponse;
import com.soumenprogramming.onlinelearning.place2prepare.user.User;
import com.soumenprogramming.onlinelearning.place2prepare.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class StudentEnrollmentService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LessonRepository lessonRepository;
    private final ActivityLogRepository activityLogRepository;
    private final EnrollmentAccessService enrollmentAccessService;

    public StudentEnrollmentService(UserRepository userRepository,
                                    CourseRepository courseRepository,
                                    EnrollmentRepository enrollmentRepository,
                                    LessonRepository lessonRepository,
                                    ActivityLogRepository activityLogRepository,
                                    EnrollmentAccessService enrollmentAccessService) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.lessonRepository = lessonRepository;
        this.activityLogRepository = activityLogRepository;
        this.enrollmentAccessService = enrollmentAccessService;
    }

    /**
     * Self-enroll: non-premium courses (Computer Networks, DBMS) for any student; premium courses only
     * after {@link User#isAccountPremium()} is set (first successful Premium checkout).
     */
    @Transactional
    public CourseAccessResponse selfEnroll(String email, Long courseId) {
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Course not found"));
        if (!course.isActive()) {
            throw new ResponseStatusException(BAD_REQUEST, "This course is not open for enrollment.");
        }
        if (course.isPremium() && !user.isAccountPremium()) {
            throw new ResponseStatusException(
                    FORBIDDEN,
                    "Premium courses unlock after you purchase Premium once (Upgrade / Billing). "
                            + "Computer Networks and DBMS can be enrolled anytime without that purchase."
            );
        }
        if (enrollmentRepository.findByUserIdAndCourseId(user.getId(), courseId).isPresent()) {
            throw new ResponseStatusException(CONFLICT, "You're already enrolled in this course.");
        }

        int totalLessons = (int) Math.min(Integer.MAX_VALUE, lessonRepository.countByCourseId(courseId));
        int lessonsLeft = Math.max(0, totalLessons);
        Enrollment enrollment = course.isPremium()
                ? new Enrollment(
                        user,
                        course,
                        0,
                        lessonsLeft,
                        EnrollmentAccessService.PLAN_PREMIUM,
                        EnrollmentStatus.ACTIVE)
                : new Enrollment(user, course, 0, lessonsLeft, EnrollmentStatus.ACTIVE);
        enrollmentRepository.save(enrollment);

        activityLogRepository.save(new ActivityLog(
                user,
                "Enrolled in " + course.getTitle(),
                "SYSTEM"
        ));

        return enrollmentAccessService.evaluate(email, courseId);
    }
}
