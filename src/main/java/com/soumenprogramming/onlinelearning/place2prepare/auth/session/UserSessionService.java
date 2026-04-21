package com.soumenprogramming.onlinelearning.place2prepare.auth.session;

import com.soumenprogramming.onlinelearning.place2prepare.user.User;
import java.time.Instant;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserSessionService {

    private final UserSessionRepository userSessionRepository;

    public UserSessionService(UserSessionRepository userSessionRepository) {
        this.userSessionRepository = userSessionRepository;
    }

    @Transactional
    public boolean hasActiveSession(Long userId) {
        cleanupExpiredSessions();
        return userSessionRepository.findByUserId(userId)
                .map(session -> session.getExpiresAt().isAfter(Instant.now()))
                .orElse(false);
    }

    @Transactional
    public void createOrUpdateSession(User user, String token, Instant expiresAt) {
        cleanupExpiredSessions();
        userSessionRepository.findByUserId(user.getId())
                .ifPresentOrElse(
                        existing -> {
                            existing.update(token, expiresAt);
                            userSessionRepository.save(existing);
                        },
                        () -> userSessionRepository.save(new UserSession(user, token, expiresAt))
                );
    }

    @Transactional
    public boolean isTokenActive(String token) {
        cleanupExpiredSessions();
        return userSessionRepository.existsByTokenAndExpiresAtAfter(token, Instant.now());
    }

    @Transactional
    public void removeSessionByToken(String token) {
        userSessionRepository.findByToken(token).ifPresent(userSessionRepository::delete);
    }

    @Transactional
    public void removeSessionByUserId(Long userId) {
        userSessionRepository.deleteByUserId(userId);
    }

    private void cleanupExpiredSessions() {
        userSessionRepository.deleteByExpiresAtBefore(Instant.now());
    }
}
