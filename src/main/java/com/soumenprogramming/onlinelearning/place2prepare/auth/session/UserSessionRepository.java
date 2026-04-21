package com.soumenprogramming.onlinelearning.place2prepare.auth.session;

import java.time.Instant;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserSessionRepository extends JpaRepository<UserSession, Long> {
    Optional<UserSession> findByUserId(Long userId);

    Optional<UserSession> findByToken(String token);

    boolean existsByTokenAndExpiresAtAfter(String token, Instant now);

    void deleteByUserId(Long userId);

    void deleteByExpiresAtBefore(Instant now);
}
