package com.soumenprogramming.onlinelearning.place2prepare.practice;

import com.soumenprogramming.onlinelearning.place2prepare.practice.dto.AdminQuestionRequest;
import com.soumenprogramming.onlinelearning.place2prepare.practice.dto.AdminQuestionResponse;
import com.soumenprogramming.onlinelearning.place2prepare.practice.dto.AdminQuizRequest;
import com.soumenprogramming.onlinelearning.place2prepare.practice.dto.AdminQuizResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
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
@RequestMapping("/api/v1/admin/courses/{courseId}/quizzes")
@PreAuthorize("hasRole('ADMIN')")
public class QuizAdminController {

    private final QuizAdminService quizAdminService;

    public QuizAdminController(QuizAdminService quizAdminService) {
        this.quizAdminService = quizAdminService;
    }

    @GetMapping
    public List<AdminQuizResponse> list(@PathVariable Long courseId) {
        return quizAdminService.list(courseId);
    }

    @GetMapping("/{quizId}")
    public AdminQuizResponse get(@PathVariable Long courseId, @PathVariable Long quizId) {
        return quizAdminService.get(courseId, quizId);
    }

    @PostMapping
    public AdminQuizResponse create(@PathVariable Long courseId,
                                    @Valid @RequestBody AdminQuizRequest request,
                                    Authentication authentication) {
        return quizAdminService.create(courseId, request, authentication.getName());
    }

    @PutMapping("/{quizId}")
    public AdminQuizResponse update(@PathVariable Long courseId,
                                    @PathVariable Long quizId,
                                    @Valid @RequestBody AdminQuizRequest request,
                                    Authentication authentication) {
        return quizAdminService.update(courseId, quizId, request, authentication.getName());
    }

    @DeleteMapping("/{quizId}")
    public ResponseEntity<Void> delete(@PathVariable Long courseId,
                                       @PathVariable Long quizId,
                                       Authentication authentication) {
        quizAdminService.delete(courseId, quizId, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{quizId}/questions")
    public AdminQuestionResponse addQuestion(@PathVariable Long courseId,
                                             @PathVariable Long quizId,
                                             @Valid @RequestBody AdminQuestionRequest request,
                                             Authentication authentication) {
        return quizAdminService.addQuestion(courseId, quizId, request, authentication.getName());
    }

    @PutMapping("/{quizId}/questions/{questionId}")
    public AdminQuestionResponse updateQuestion(@PathVariable Long courseId,
                                                @PathVariable Long quizId,
                                                @PathVariable Long questionId,
                                                @Valid @RequestBody AdminQuestionRequest request,
                                                Authentication authentication) {
        return quizAdminService.updateQuestion(courseId, quizId, questionId, request, authentication.getName());
    }

    @DeleteMapping("/{quizId}/questions/{questionId}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long courseId,
                                               @PathVariable Long quizId,
                                               @PathVariable Long questionId,
                                               Authentication authentication) {
        quizAdminService.deleteQuestion(courseId, quizId, questionId, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
