package com.soumenprogramming.onlinelearning.place2prepare.auth;

import com.soumenprogramming.onlinelearning.place2prepare.auth.dto.PasswordResetConfirmDto;
import com.soumenprogramming.onlinelearning.place2prepare.auth.dto.PasswordResetRequestDto;
import com.soumenprogramming.onlinelearning.place2prepare.auth.session.UserSessionService;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.ActivityLog;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.ActivityLogRepository;
import com.soumenprogramming.onlinelearning.place2prepare.notify.NotificationService;
import com.soumenprogramming.onlinelearning.place2prepare.user.User;
import com.soumenprogramming.onlinelearning.place2prepare.user.UserRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
public class PasswordResetService {

    private static final Duration TOKEN_TTL = Duration.ofMinutes(30);
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;
    private final ActivityLogRepository activityLogRepository;
    private final UserSessionService userSessionService;
    private final String frontendBaseUrl;

    public PasswordResetService(UserRepository userRepository,
                                PasswordResetTokenRepository tokenRepository,
                                PasswordEncoder passwordEncoder,
                                NotificationService notificationService,
                                ActivityLogRepository activityLogRepository,
                                UserSessionService userSessionService,
                                @Value("${app.frontend.base-url:http://localhost:3000}") String frontendBaseUrl) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.notificationService = notificationService;
        this.activityLogRepository = activityLogRepository;
        this.userSessionService = userSessionService;
        this.frontendBaseUrl = frontendBaseUrl;
    }

    /**
     * Always returns successfully to avoid leaking which email addresses exist. If the email
     * is known, a token is persisted and a notification dispatched.
     */
    @Transactional
    public void requestReset(PasswordResetRequestDto request) {
        Optional<User> userOpt = userRepository.findByEmail(request.email().toLowerCase());
        if (userOpt.isEmpty()) return;
        User user = userOpt.get();

        String rawToken = generateRawToken();
        String hashed = hash(rawToken);
        Instant expiresAt = Instant.now().plus(TOKEN_TTL);
        tokenRepository.save(new PasswordResetToken(user, hashed, expiresAt));

        String resetLink = frontendBaseUrl + "/reset-password?token=" + rawToken;
        notificationService.notifyPasswordResetRequested(user, resetLink);
        activityLogRepository.save(new ActivityLog(user, "Password reset requested", "SYSTEM"));
    }

    @Transactional
    public void confirmReset(PasswordResetConfirmDto request) {
        String hashed = hash(request.token());
        PasswordResetToken token = tokenRepository.findByTokenHash(hashed)
                .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Invalid or expired reset link"));
        Instant now = Instant.now();
        if (!token.isUsable(now)) {
            throw new ResponseStatusException(BAD_REQUEST, "Invalid or expired reset link");
        }
        User user = token.getUser();
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        token.markUsed();
        tokenRepository.save(token);

        userSessionService.removeSessionByUserId(user.getId());
        activityLogRepository.save(new ActivityLog(user, "Password was reset successfully", "SYSTEM"));
    }

    private String generateRawToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] out = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(out);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 unavailable", ex);
        }
    }
}
