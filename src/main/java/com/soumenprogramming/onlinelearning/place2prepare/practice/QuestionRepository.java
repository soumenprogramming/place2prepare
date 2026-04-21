package com.soumenprogramming.onlinelearning.place2prepare.practice;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findByQuizIdOrderByPositionAsc(Long quizId);

    Optional<Question> findByIdAndQuizId(Long id, Long quizId);

    long countByQuizId(Long quizId);
}
