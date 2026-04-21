package com.soumenprogramming.onlinelearning.place2prepare.dashboard.dto;

import java.util.List;

public record DashboardOverviewResponse(
        String fullName,
        DashboardStatsDto stats,
        List<EnrolledCourseDto> activeCourses,
        List<ScheduleItemDto> upcomingSchedule,
        List<String> recentActivity
) {
}
