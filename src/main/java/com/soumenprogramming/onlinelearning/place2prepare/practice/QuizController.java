package com.soumenprogramming.onlinelearning.place2prepare.practice;

import com.soumenprogramming.onlinelearning.place2prepare.practice.dto.AttemptHistoryItem;
import com.soumenprogramming.onlinelearning.place2prepare.practice.dto.AttemptResponse;
import com.soumenprogramming.onlinelearning.place2prepare.practice.dto.QuizListResponse;
import com.soumenprogramming.onlinelearning.place2prepare.practice.dto.SubmitAttemptRequest;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/learn")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @GetMapping("/courses/{courseId}/quizzes")
    public QuizListResponse list(@PathVariable Long courseId, Authentication authentication) {
        return quizService.listForStudent(authentication.getName(), courseId);
    }

    @PostMapping("/courses/{courseId}/quizzes/{quizId}/attempts")
    public AttemptResponse start(@PathVariable Long courseId,
                                 @PathVariable Long quizId,
                                 Authentication authentication) {
        return quizService.startAttempt(authentication.getName(), courseId, quizId);
    }

    @GetMapping("/attempts/{attemptId}")
    public AttemptResponse attempt(@PathVariable Long attemptId, Authentication authentication) {
        return quizService.getAttempt(authentication.getName(), attemptId);
    }

    @PostMapping("/attempts/{attemptId}/submit")
    public AttemptResponse submit(@PathVariable Long attemptId,
                                  @RequestBody(required = false) SubmitAttemptRequest request,
                                  Authentication authentication) {
        return quizService.submitAttempt(authentication.getName(), attemptId, request);
    }

    @GetMapping("/courses/{courseId}/quizzes/{quizId}/history")
    public List<AttemptHistoryItem> history(@PathVariable Long courseId,
                                            @PathVariable Long quizId,
                                            Authentication authentication) {
        return quizService.history(authentication.getName(), courseId, quizId);
    }
}
