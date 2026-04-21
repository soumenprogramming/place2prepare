package com.soumenprogramming.onlinelearning.place2prepare.course;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
    Optional<Subject> findBySlug(String slug);

    boolean existsBySlug(String slug);
}
