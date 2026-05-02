package com.soumenprogramming.onlinelearning.place2prepare.learn;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LessonRepository extends JpaRepository<Lesson, Long> {

    long countByCourseId(Long courseId);

    List<Lesson> findByCourseIdOrderByPositionAsc(Long courseId);

    Optional<Lesson> findByIdAndCourseId(Long id, Long courseId);

    boolean existsByCourseIdAndSlug(Long courseId, String slug);

    boolean existsByCourseIdAndSlugAndIdNot(Long courseId, String slug, Long id);

    Optional<Lesson> findTopByCourseIdOrderByPositionDesc(Long courseId);

    void deleteByCourseId(Long courseId);
}
