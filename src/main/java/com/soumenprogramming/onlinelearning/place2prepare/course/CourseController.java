package com.soumenprogramming.onlinelearning.place2prepare.course;

import com.soumenprogramming.onlinelearning.place2prepare.course.dto.CourseResponse;
import com.soumenprogramming.onlinelearning.place2prepare.course.dto.LandingResponse;
import com.soumenprogramming.onlinelearning.place2prepare.course.dto.SubjectResponse;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping("/landing")
    public LandingResponse landingStats() {
        return courseService.getLandingStats();
    }

    @GetMapping("/subjects")
    public List<SubjectResponse> subjects() {
        return courseService.getSubjects();
    }

    @GetMapping("/courses")
    public List<CourseResponse> courses(@RequestParam(required = false) String subject,
                                        @RequestParam(required = false) String q,
                                        @RequestParam(required = false) Boolean premium) {
        return courseService.getCourses(subject, q, premium);
    }
}
