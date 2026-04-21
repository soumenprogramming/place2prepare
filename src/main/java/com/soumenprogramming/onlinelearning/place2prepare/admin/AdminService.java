package com.soumenprogramming.onlinelearning.place2prepare.admin;

import com.soumenprogramming.onlinelearning.place2prepare.admin.dto.AdminOverviewResponse;
import com.soumenprogramming.onlinelearning.place2prepare.admin.dto.AdminStudentProfileResponse;
import com.soumenprogramming.onlinelearning.place2prepare.admin.dto.AdminStudentResponse;
import com.soumenprogramming.onlinelearning.place2prepare.admin.dto.AssignCourseRequest;
import com.soumenprogramming.onlinelearning.place2prepare.admin.dto.CreateCourseRequest;
import com.soumenprogramming.onlinelearning.place2prepare.admin.dto.CreateSubjectRequest;
import com.soumenprogramming.onlinelearning.place2prepare.admin.dto.StudentEnrollmentResponse;
import com.soumenprogramming.onlinelearning.place2prepare.auth.session.UserSessionService;
import com.soumenprogramming.onlinelearning.place2prepare.course.Course;
import com.soumenprogramming.onlinelearning.place2prepare.course.CourseRepository;
import com.soumenprogramming.onlinelearning.place2prepare.course.Subject;
import com.soumenprogramming.onlinelearning.place2prepare.course.SubjectRepository;
import com.soumenprogramming.onlinelearning.place2prepare.course.dto.CourseResponse;
import com.soumenprogramming.onlinelearning.place2prepare.course.dto.SubjectResponse;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.ActivityLog;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.ActivityLogRepository;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.Enrollment;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.EnrollmentRepository;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.EnrollmentStatus;
import com.soumenprogramming.onlinelearning.place2prepare.learn.LessonProgressRepository;
import com.soumenprogramming.onlinelearning.place2prepare.learn.LessonRepository;
import com.soumenprogramming.onlinelearning.place2prepare.notify.NotificationRepository;
import com.soumenprogramming.onlinelearning.place2prepare.notify.NotificationService;
import com.soumenprogramming.onlinelearning.place2prepare.payments.InvoiceRepository;
import com.soumenprogramming.onlinelearning.place2prepare.payments.PaymentOrderRepository;
import com.soumenprogramming.onlinelearning.place2prepare.practice.QuizAttemptRepository;
import com.soumenprogramming.onlinelearning.place2prepare.user.Role;
import com.soumenprogramming.onlinelearning.place2prepare.user.User;
import com.soumenprogramming.onlinelearning.place2prepare.user.UserRepository;
import java.util.List;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class AdminService {

    private static final Set<String> SUPPORTED_PLAN_TYPES = Set.of("BASIC", "PREMIUM");

    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ActivityLogRepository activityLogRepository;
    private final UserSessionService userSessionService;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;
    private final PaymentOrderRepository paymentOrderRepository;
    private final InvoiceRepository invoiceRepository;
    private final int maxCoursesPerStudent;

    public AdminService(UserRepository userRepository,
                        SubjectRepository subjectRepository,
                        CourseRepository courseRepository,
                        EnrollmentRepository enrollmentRepository,
                        ActivityLogRepository activityLogRepository,
                        UserSessionService userSessionService,
                        LessonRepository lessonRepository,
                        LessonProgressRepository lessonProgressRepository,
                        QuizAttemptRepository quizAttemptRepository,
                        NotificationService notificationService,
                        NotificationRepository notificationRepository,
                        PaymentOrderRepository paymentOrderRepository,
                        InvoiceRepository invoiceRepository,
                        @Value("${app.enrollment.max-courses-per-student:10}") int maxCoursesPerStudent) {
        this.userRepository = userRepository;
        this.subjectRepository = subjectRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.activityLogRepository = activityLogRepository;
        this.userSessionService = userSessionService;
        this.lessonRepository = lessonRepository;
        this.lessonProgressRepository = lessonProgressRepository;
        this.quizAttemptRepository = quizAttemptRepository;
        this.notificationService = notificationService;
        this.notificationRepository = notificationRepository;
        this.paymentOrderRepository = paymentOrderRepository;
        this.invoiceRepository = invoiceRepository;
        this.maxCoursesPerStudent = Math.max(1, maxCoursesPerStudent);
    }

    public AdminOverviewResponse getOverview() {
        return new AdminOverviewResponse(
                userRepository.countByRole(Role.STUDENT),
                userRepository.countByRole(Role.ADMIN),
                subjectRepository.count(),
                courseRepository.count(),
                enrollmentRepository.count()
        );
    }

    public List<AdminStudentResponse> getStudents() {
        return userRepository.findByRoleOrderByCreatedAtDesc(Role.STUDENT).stream()
                .map(user -> new AdminStudentResponse(
                        user.getId(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getRole().name()
                ))
                .toList();
    }

    public AdminStudentProfileResponse getStudentProfile(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Student not found"));

        List<StudentEnrollmentResponse> enrolledCourses = enrollmentRepository
                .findByUserIdOrderByCreatedAtDesc(studentId)
                .stream()
                .map(this::mapEnrollment)
                .toList();

        return new AdminStudentProfileResponse(
                student.getId(),
                student.getFullName(),
                student.getEmail(),
                student.getRole().name(),
                enrolledCourses.size(),
                enrolledCourses
        );
    }

    public AdminStudentProfileResponse assignCourseToStudent(Long studentId, AssignCourseRequest request, String adminEmail) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Student not found"));
        if (student.getRole() != Role.STUDENT) {
            throw new ResponseStatusException(BAD_REQUEST, "Courses can only be assigned to student accounts");
        }
        Course course = courseRepository.findById(request.courseId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Course not found"));

        if (enrollmentRepository.existsByUserIdAndCourseId(studentId, request.courseId())) {
            throw new ResponseStatusException(BAD_REQUEST, "Student already enrolled in this course");
        }

        long currentCount = enrollmentRepository.countByUserId(studentId);
        if (currentCount >= maxCoursesPerStudent) {
            throw new ResponseStatusException(
                    BAD_REQUEST,
                    "Student has reached the enrollment limit of " + maxCoursesPerStudent + " courses"
            );
        }

        String planType = request.planType() == null
                ? "BASIC"
                : request.planType().trim().toUpperCase();
        if (!SUPPORTED_PLAN_TYPES.contains(planType)) {
            throw new ResponseStatusException(
                    BAD_REQUEST,
                    "Plan type must be BASIC or PREMIUM"
            );
        }
        if (course.isPremium() && !"PREMIUM".equals(planType)) {
            throw new ResponseStatusException(
                    BAD_REQUEST,
                    "This course requires a PREMIUM plan"
            );
        }

        int totalLessons = (int) lessonRepository.countByCourseId(course.getId());
        Enrollment enrollment = new Enrollment(
                student,
                course,
                0,
                totalLessons,
                planType,
                EnrollmentStatus.ACTIVE
        );
        enrollmentRepository.save(enrollment);
        activityLogRepository.save(new ActivityLog(
                student,
                "Course assigned: " + course.getTitle() + " (" + planType + ")",
                adminEmail
        ));
        notificationService.notifyCourseAssigned(student, course, planType);
        return getStudentProfile(studentId);
    }

    @Transactional
    public AdminStudentProfileResponse removeCourseFromStudent(Long studentId, Long enrollmentId, String adminEmail) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Student not found"));
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Enrollment not found"));
        if (!enrollment.getUser().getId().equals(studentId)) {
            throw new ResponseStatusException(NOT_FOUND, "Enrollment not found for student");
        }
        Course course = enrollment.getCourse();
        String courseTitle = course.getTitle();
        Long courseId = course.getId();
        lessonProgressRepository.deleteByUserIdAndLessonCourseId(studentId, courseId);
        enrollmentRepository.deleteByIdAndUserId(enrollmentId, studentId);
        activityLogRepository.save(new ActivityLog(student, "Course removed: " + courseTitle, adminEmail));
        notificationService.notifyCourseRemoved(student, course);
        return getStudentProfile(studentId);
    }

    @Transactional
    public void deleteStudent(Long studentId, String adminEmail) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Student not found"));
        if (student.getRole() != Role.STUDENT) {
            throw new ResponseStatusException(BAD_REQUEST, "Only student account can be deleted");
        }
        User admin = userRepository.findByEmail(adminEmail.toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Admin not found"));
        activityLogRepository.save(new ActivityLog(
                admin,
                "Deleted student account: " + student.getFullName() + " (" + student.getEmail() + ")",
                adminEmail
        ));
        lessonProgressRepository.deleteByUserId(studentId);
        quizAttemptRepository.deleteByUserId(studentId);
        invoiceRepository.deleteByUserId(studentId);
        paymentOrderRepository.deleteByUserId(studentId);
        enrollmentRepository.deleteByUserId(studentId);
        notificationRepository.deleteByUserId(studentId);
        activityLogRepository.deleteByUserId(studentId);
        userSessionService.removeSessionByUserId(studentId);
        userRepository.deleteById(studentId);
    }

    public List<SubjectResponse> getSubjects() {
        return subjectRepository.findAll().stream()
                .map(subject -> new SubjectResponse(
                        subject.getId(),
                        subject.getName(),
                        subject.getSlug(),
                        subject.getDescription()
                ))
                .toList();
    }

    public SubjectResponse createSubject(CreateSubjectRequest request, String adminEmail) {
        if (subjectRepository.existsBySlug(request.slug().trim().toLowerCase())) {
            throw new ResponseStatusException(BAD_REQUEST, "Subject slug already exists");
        }
        Subject subject = new Subject(
                request.name().trim(),
                request.slug().trim().toLowerCase(),
                request.description().trim()
        );
        Subject saved = subjectRepository.save(subject);
        logAdminAction(adminEmail, "Created subject: " + saved.getName());
        return new SubjectResponse(saved.getId(), saved.getName(), saved.getSlug(), saved.getDescription());
    }

    public List<CourseResponse> getCourses() {
        return courseRepository.findAll().stream()
                .map(course -> new CourseResponse(
                        course.getId(),
                        course.getTitle(),
                        course.getSlug(),
                        course.getDescription(),
                        course.getDifficulty(),
                        course.getDurationHours(),
                        course.getSubject().getName(),
                        course.isPremium()
                ))
                .toList();
    }

    public CourseResponse createCourse(CreateCourseRequest request, String adminEmail) {
        Subject subject = subjectRepository.findById(request.subjectId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Subject not found"));
        if (courseRepository.existsBySlug(request.slug().trim().toLowerCase())) {
            throw new ResponseStatusException(BAD_REQUEST, "Course slug already exists");
        }
        Course course = new Course(
                request.title().trim(),
                request.slug().trim().toLowerCase(),
                request.description().trim(),
                request.difficulty().trim().toUpperCase(),
                request.durationHours(),
                true,
                Boolean.TRUE.equals(request.premium()),
                subject
        );
        Course saved = courseRepository.save(course);
        logAdminAction(adminEmail, "Created course: " + saved.getTitle() + " under " + subject.getName());
        return new CourseResponse(
                saved.getId(),
                saved.getTitle(),
                saved.getSlug(),
                saved.getDescription(),
                saved.getDifficulty(),
                saved.getDurationHours(),
                saved.getSubject().getName(),
                saved.isPremium()
        );
    }

    private void logAdminAction(String adminEmail, String message) {
        User admin = userRepository.findByEmail(adminEmail.toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Admin not found"));
        activityLogRepository.save(new ActivityLog(admin, message, adminEmail));
    }

    private StudentEnrollmentResponse mapEnrollment(Enrollment enrollment) {
        return new StudentEnrollmentResponse(
                enrollment.getId(),
                enrollment.getCourse().getId(),
                enrollment.getCourse().getTitle(),
                enrollment.getCourse().getSubject().getName(),
                enrollment.getProgressPercentage(),
                enrollment.getLessonsLeft(),
                enrollment.getPlanType(),
                enrollment.getStatus().name()
        );
    }
}
