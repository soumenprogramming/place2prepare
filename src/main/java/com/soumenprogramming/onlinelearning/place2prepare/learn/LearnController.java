package com.soumenprogramming.onlinelearning.place2prepare.learn;

import com.soumenprogramming.onlinelearning.place2prepare.learn.dto.CourseAccessResponse;
import com.soumenprogramming.onlinelearning.place2prepare.learn.dto.LessonCompletionRequest;
import com.soumenprogramming.onlinelearning.place2prepare.learn.dto.LessonCompletionResponse;
import com.soumenprogramming.onlinelearning.place2prepare.learn.dto.LessonDetailResponse;
import com.soumenprogramming.onlinelearning.place2prepare.learn.dto.LessonListResponse;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/learn")
public class LearnController {

    private final EnrollmentAccessService enrollmentAccessService;
    private final LessonService lessonService;

    public LearnController(EnrollmentAccessService enrollmentAccessService,
                           LessonService lessonService) {
        this.enrollmentAccessService = enrollmentAccessService;
        this.lessonService = lessonService;
    }

    @GetMapping("/courses/{courseId}")
    public CourseAccessResponse courseAccess(@PathVariable Long courseId,
                                             Authentication authentication) {
        return enrollmentAccessService.evaluate(authentication.getName(), courseId);
    }

    @GetMapping("/courses/{courseId}/lessons")
    public LessonListResponse lessons(@PathVariable Long courseId,
                                      Authentication authentication) {
        return lessonService.listForStudent(authentication.getName(), courseId);
    }

    @GetMapping("/courses/{courseId}/lessons/{lessonId}")
    public LessonDetailResponse lesson(@PathVariable Long courseId,
                                       @PathVariable Long lessonId,
                                       Authentication authentication) {
        return lessonService.getForStudent(authentication.getName(), courseId, lessonId);
    }

    @PostMapping("/courses/{courseId}/lessons/{lessonId}/complete")
    public LessonCompletionResponse markLesson(@PathVariable Long courseId,
                                               @PathVariable Long lessonId,
                                               @RequestBody(required = false) LessonCompletionRequest request,
                                               Authentication authentication) {
        boolean completed = request == null || request.completed() == null || request.completed();
        return lessonService.markComplete(authentication.getName(), courseId, lessonId, completed);
    }
}
