package com.soumenprogramming.onlinelearning.place2prepare.dashboard;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByUserIdOrderByCreatedAtDesc(Long userId);

    long countByUserId(Long userId);

    boolean existsByUserIdAndCourseId(Long userId, Long courseId);

    Optional<Enrollment> findByUserIdAndCourseId(Long userId, Long courseId);

    List<Enrollment> findByCourseId(Long courseId);

    void deleteByUserId(Long userId);

    void deleteByIdAndUserId(Long enrollmentId, Long userId);
}
