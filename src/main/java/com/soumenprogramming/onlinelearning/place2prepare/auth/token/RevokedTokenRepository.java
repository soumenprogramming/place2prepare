package com.soumenprogramming.onlinelearning.place2prepare.auth.token;

import java.time.Instant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RevokedTokenRepository extends JpaRepository<RevokedToken, Long> {
    boolean existsByToken(String token);

    void deleteByExpiresAtBefore(Instant now);
}
