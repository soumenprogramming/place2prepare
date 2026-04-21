package com.soumenprogramming.onlinelearning.place2prepare.user;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByRole(Role role);

    java.util.List<User> findByRoleOrderByCreatedAtDesc(Role role);
}
