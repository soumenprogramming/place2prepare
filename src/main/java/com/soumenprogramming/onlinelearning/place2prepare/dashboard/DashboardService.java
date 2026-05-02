package com.soumenprogramming.onlinelearning.place2prepare.dashboard;

import com.soumenprogramming.onlinelearning.place2prepare.dashboard.dto.DashboardOverviewResponse;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.dto.DashboardStatsDto;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.dto.EnrolledCourseDto;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.dto.ScheduleItemDto;
import com.soumenprogramming.onlinelearning.place2prepare.live.LiveSessionService;
import com.soumenprogramming.onlinelearning.place2prepare.live.dto.LiveSessionResponse;
import com.soumenprogramming.onlinelearning.place2prepare.user.User;
import com.soumenprogramming.onlinelearning.place2prepare.user.UserRepository;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class DashboardService {

    private static final DateTimeFormatter TIME_FORMATTER =
            DateTimeFormatter.ofPattern("EEE, h:mm a").withZone(ZoneId.systemDefault());

    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ActivityLogRepository activityLogRepository;
    private final LiveSessionService liveSessionService;

    public DashboardService(UserRepository userRepository,
                            EnrollmentRepository enrollmentRepository,
                            ActivityLogRepository activityLogRepository,
                            LiveSessionService liveSessionService) {
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.activityLogRepository = activityLogRepository;
        this.liveSessionService = liveSessionService;
    }

    public DashboardOverviewResponse getOverview(String email) {
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));

        List<Enrollment> enrollments = enrollmentRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        List<EnrolledCourseDto> activeCourses = enrollments.stream()
                .map(enrollment -> new EnrolledCourseDto(
                        enrollment.getId(),
                        enrollment.getCourse().getId(),
                        enrollment.getCourse().getTitle(),
                        enrollment.getProgressPercentage(),
                        enrollment.getLessonsLeft(),
                        enrollment.getPlanType(),
                        enrollment.getStatus().name()
                ))
                .toList();

        List<ScheduleItemDto> upcoming = liveSessionService.upcomingForStudent(email, 5).stream()
                .map(this::toScheduleItem)
                .toList();

        List<String> activity = activityLogRepository.findTop5ByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(ActivityLog::getMessage)
                .toList();

        DashboardStatsDto stats = new DashboardStatsDto(
                7,
                enrollmentRepository.countByUserId(user.getId()),
                (int) upcoming.size(),
                "9h 40m"
        );

        return new DashboardOverviewResponse(
                user.getFullName(),
                stats,
                activeCourses,
                upcoming,
                activity
        );
    }

    private ScheduleItemDto toScheduleItem(LiveSessionResponse session) {
        return new ScheduleItemDto(
                session.id(),
                session.title(),
                TIME_FORMATTER.format(session.scheduledAt()),
                session.scheduledAt(),
                session.durationMinutes(),
                session.status(),
                session.courseId(),
                session.courseTitle(),
                session.joinUrl(),
                session.joinable()
        );
    }
}
