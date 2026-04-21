package com.soumenprogramming.onlinelearning.place2prepare.course;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByActiveTrueOrderByIdAsc();

    List<Course> findByActiveTrueAndSubjectSlugOrderByIdAsc(String subjectSlug);

    boolean existsBySlug(String slug);

    Optional<Course> findBySlug(String slug);
}
