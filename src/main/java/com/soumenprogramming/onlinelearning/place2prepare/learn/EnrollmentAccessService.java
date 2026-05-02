package com.soumenprogramming.onlinelearning.place2prepare.learn;

import com.soumenprogramming.onlinelearning.place2prepare.course.Course;
import com.soumenprogramming.onlinelearning.place2prepare.course.CourseRepository;
import com.soumenprogramming.onlinelearning.place2prepare.course.dto.CourseResponse;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.Enrollment;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.EnrollmentRepository;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.EnrollmentStatus;
import com.soumenprogramming.onlinelearning.place2prepare.learn.dto.CourseAccessResponse;
import com.soumenprogramming.onlinelearning.place2prepare.user.User;
import com.soumenprogramming.onlinelearning.place2prepare.user.UserRepository;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.NOT_FOUND;

/**
 * Single source of truth for "can this user access this course?".
 *
 * Any future content endpoint (lessons, quizzes, downloads) should call
 * {@link #requireAccess(String, Long)} before returning protected data.
 */
@Service
public class EnrollmentAccessService {

    static final String PLAN_PREMIUM = "PREMIUM";
    static final String PLAN_BASIC = "BASIC";

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    public EnrollmentAccessService(UserRepository userRepository,
                                   CourseRepository courseRepository,
                                   EnrollmentRepository enrollmentRepository) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    /**
     * Returns full access detail (locked or unlocked) without throwing. Useful for UIs that want
     * to render a "paywall" state rather than show an error page.
     */
    public CourseAccessResponse evaluate(String email, Long courseId) {
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Course not found"));

        CourseResponse courseDto = toCourseResponse(course);

        if (!course.isActive()) {
            return new CourseAccessResponse(
                    courseDto,
                    CourseAccessState.INACTIVE.name(),
                    "This course is currently not available.",
                    null,
                    null,
                    null,
                    null,
                    user.isAccountPremium()
            );
        }

        Optional<Enrollment> enrollmentOpt = enrollmentRepository
                .findByUserIdAndCourseId(user.getId(), course.getId());
        if (enrollmentOpt.isEmpty()) {
            String notEnrolledReason;
            if (!course.isPremium()) {
                notEnrolledReason = "You are not enrolled yet. Tap Enroll on this page to start (free on Basic).";
            } else if (user.isAccountPremium()) {
                notEnrolledReason = "You have Premium membership. Tap Enroll to add this course — Computer Networks and DBMS can be enrolled anytime without membership.";
            } else {
                notEnrolledReason = "This is a Premium course. Purchase Premium once from Upgrade or Billing (checkout enrolls you). After that you can self-enroll in other paid courses; Computer Networks and DBMS stay free to enroll anytime.";
            }
            return new CourseAccessResponse(
                    courseDto,
                    CourseAccessState.NOT_ENROLLED.name(),
                    notEnrolledReason,
                    null,
                    null,
                    null,
                    null,
                    user.isAccountPremium()
            );
        }

        Enrollment enrollment = enrollmentOpt.get();
        String plan = enrollment.getPlanType() == null
                ? PLAN_BASIC
                : enrollment.getPlanType().toUpperCase();

        if (course.isPremium() && !hasPremiumCourseAccess(plan, user)) {
            return new CourseAccessResponse(
                    courseDto,
                    CourseAccessState.PLAN_REQUIRED.name(),
                    "This course requires Premium. Use Upgrade / Billing to complete checkout and unlock lessons, quizzes, and live sessions.",
                    plan,
                    enrollment.getId(),
                    enrollment.getProgressPercentage(),
                    enrollment.getLessonsLeft(),
                    user.isAccountPremium()
            );
        }

        if (enrollment.getStatus() != EnrollmentStatus.ACTIVE) {
            return new CourseAccessResponse(
                    courseDto,
                    CourseAccessState.NOT_ENROLLED.name(),
                    "Your enrollment is " + enrollment.getStatus().name().toLowerCase()
                            + ". Reach out to an administrator to reactivate it.",
                    plan,
                    enrollment.getId(),
                    enrollment.getProgressPercentage(),
                    enrollment.getLessonsLeft(),
                    user.isAccountPremium()
            );
        }

        String displayPlan = (course.isPremium() && user.isAccountPremium()) ? PLAN_PREMIUM : plan;
        return new CourseAccessResponse(
                courseDto,
                CourseAccessState.ALLOWED.name(),
                null,
                displayPlan,
                enrollment.getId(),
                enrollment.getProgressPercentage(),
                enrollment.getLessonsLeft(),
                user.isAccountPremium()
        );
    }

    private static boolean hasPremiumCourseAccess(String plan, User user) {
        return PLAN_PREMIUM.equals(plan) || user.isAccountPremium();
    }

    /**
     * Same as {@link #evaluate(String, Long)} but throws a {@link ResponseStatusException} when
     * access is not allowed. Intended for content endpoints that must hard-fail unauthorized calls.
     */
    public Enrollment requireAccess(String email, Long courseId) {
        CourseAccessResponse decision = evaluate(email, courseId);
        CourseAccessState state = CourseAccessState.valueOf(decision.accessState());
        if (state == CourseAccessState.ALLOWED) {
            return enrollmentRepository.findById(decision.enrollmentId())
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Enrollment not found"));
        }
        throw new ResponseStatusException(
                org.springframework.http.HttpStatus.FORBIDDEN,
                decision.reason() == null ? "Access denied" : decision.reason()
        );
    }

    private CourseResponse toCourseResponse(Course course) {
        return new CourseResponse(
                course.getId(),
                course.getTitle(),
                course.getSlug(),
                course.getDescription(),
                course.getDifficulty(),
                course.getDurationHours(),
                course.getSubject().getName(),
                course.isPremium()
        );
    }
}
