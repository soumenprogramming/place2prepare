package com.soumenprogramming.onlinelearning.place2prepare.learn;

import com.soumenprogramming.onlinelearning.place2prepare.learn.dto.AdminLessonRequest;
import com.soumenprogramming.onlinelearning.place2prepare.learn.dto.AdminLessonResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/courses/{courseId}/lessons")
@PreAuthorize("hasRole('ADMIN')")
public class LessonAdminController {

    private final LessonAdminService lessonAdminService;

    public LessonAdminController(LessonAdminService lessonAdminService) {
        this.lessonAdminService = lessonAdminService;
    }

    @GetMapping
    public List<AdminLessonResponse> list(@PathVariable Long courseId) {
        return lessonAdminService.list(courseId);
    }

    @PostMapping
    public AdminLessonResponse create(@PathVariable Long courseId,
                                      @Valid @RequestBody AdminLessonRequest request,
                                      Authentication authentication) {
        return lessonAdminService.create(courseId, request, authentication.getName());
    }

    @PutMapping("/{lessonId}")
    public AdminLessonResponse update(@PathVariable Long courseId,
                                      @PathVariable Long lessonId,
                                      @Valid @RequestBody AdminLessonRequest request,
                                      Authentication authentication) {
        return lessonAdminService.update(courseId, lessonId, request, authentication.getName());
    }

    @DeleteMapping("/{lessonId}")
    public Map<String, String> delete(@PathVariable Long courseId,
                                      @PathVariable Long lessonId,
                                      Authentication authentication) {
        lessonAdminService.delete(courseId, lessonId, authentication.getName());
        return Map.of("message", "Lesson deleted successfully");
    }
}
