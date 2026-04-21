package com.soumenprogramming.onlinelearning.place2prepare.practice;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizRepository extends JpaRepository<Quiz, Long> {

    List<Quiz> findByCourseIdOrderByCreatedAtAsc(Long courseId);

    List<Quiz> findByCourseIdAndPublishedTrueOrderByCreatedAtAsc(Long courseId);

    Optional<Quiz> findByIdAndCourseId(Long id, Long courseId);

    boolean existsByCourseIdAndSlug(Long courseId, String slug);

    boolean existsByCourseIdAndSlugAndIdNot(Long courseId, String slug, Long id);

    void deleteByCourseId(Long courseId);
}
