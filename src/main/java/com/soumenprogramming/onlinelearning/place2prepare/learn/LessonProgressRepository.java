package com.soumenprogramming.onlinelearning.place2prepare.learn;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {

    boolean existsByUserIdAndLessonId(Long userId, Long lessonId);

    Optional<LessonProgress> findByUserIdAndLessonId(Long userId, Long lessonId);

    long countByUserIdAndLessonCourseId(Long userId, Long courseId);

    List<LessonProgress> findByUserIdAndLessonCourseId(Long userId, Long courseId);

    void deleteByUserIdAndLessonCourseId(Long userId, Long courseId);

    void deleteByUserId(Long userId);

    void deleteByLessonId(Long lessonId);

    void deleteByLessonCourseId(Long courseId);

    void deleteByUserIdAndLessonId(Long userId, Long lessonId);
}
