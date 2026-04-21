package com.soumenprogramming.onlinelearning.place2prepare.auth.token;

import java.time.Instant;
import org.springframework.stereotype.Service;

@Service
public class TokenRevocationService {

    private final RevokedTokenRepository revokedTokenRepository;

    public TokenRevocationService(RevokedTokenRepository revokedTokenRepository) {
        this.revokedTokenRepository = revokedTokenRepository;
    }

    public boolean isRevoked(String token) {
        return revokedTokenRepository.existsByToken(token);
    }

    public void revoke(String token, Instant expiresAt) {
        if (token == null || token.isBlank() || expiresAt == null || expiresAt.isBefore(Instant.now())) {
            return;
        }
        if (!revokedTokenRepository.existsByToken(token)) {
            revokedTokenRepository.save(new RevokedToken(token, expiresAt));
        }
        revokedTokenRepository.deleteByExpiresAtBefore(Instant.now());
    }
}
