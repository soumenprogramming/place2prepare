package com.soumenprogramming.onlinelearning.place2prepare.practice;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {

    List<QuizAttempt> findByUserIdAndQuizIdOrderByStartedAtDesc(Long userId, Long quizId);

    List<QuizAttempt> findByUserIdOrderByStartedAtDesc(Long userId);

    Optional<QuizAttempt> findTopByUserIdAndQuizIdAndStatusOrderByStartedAtDesc(
            Long userId, Long quizId, AttemptStatus status
    );

    Optional<QuizAttempt> findTopByUserIdAndQuizIdAndStatusOrderByScorePercentDesc(
            Long userId, Long quizId, AttemptStatus status
    );

    long countByUserIdAndQuizIdAndStatus(Long userId, Long quizId, AttemptStatus status);

    List<QuizAttempt> findByQuizId(Long quizId);

    void deleteByUserId(Long userId);

    void deleteByQuizId(Long quizId);
}
