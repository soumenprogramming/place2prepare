package com.soumenprogramming.onlinelearning.place2prepare.learn.dto;

import com.soumenprogramming.onlinelearning.place2prepare.course.dto.CourseResponse;

public record CourseAccessResponse(
        CourseResponse course,
        String accessState,
        String reason,
        String planType,
        Long enrollmentId,
        Integer progress,
        Integer lessonsLeft
) {
}
