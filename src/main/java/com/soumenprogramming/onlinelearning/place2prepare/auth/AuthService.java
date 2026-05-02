package com.soumenprogramming.onlinelearning.place2prepare.auth;

import com.soumenprogramming.onlinelearning.place2prepare.auth.dto.AuthResponse;
import com.soumenprogramming.onlinelearning.place2prepare.auth.dto.AdminRegisterRequest;
import com.soumenprogramming.onlinelearning.place2prepare.auth.dto.LoginRequest;
import com.soumenprogramming.onlinelearning.place2prepare.auth.dto.RegisterRequest;
import com.soumenprogramming.onlinelearning.place2prepare.auth.session.UserSessionService;
import com.soumenprogramming.onlinelearning.place2prepare.auth.token.TokenRevocationService;
import com.soumenprogramming.onlinelearning.place2prepare.config.JwtService;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.ActivityLog;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.ActivityLogRepository;
import com.soumenprogramming.onlinelearning.place2prepare.user.Role;
import com.soumenprogramming.onlinelearning.place2prepare.user.User;
import com.soumenprogramming.onlinelearning.place2prepare.user.UserRepository;
import java.time.Instant;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final ActivityLogRepository activityLogRepository;
    private final TokenRevocationService tokenRevocationService;
    private final UserSessionService userSessionService;
    private final String adminSetupKey;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager,
                       ActivityLogRepository activityLogRepository,
                       TokenRevocationService tokenRevocationService,
                       UserSessionService userSessionService,
                       @Value("${app.admin.setup-key}") String adminSetupKey) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.activityLogRepository = activityLogRepository;
        this.tokenRevocationService = tokenRevocationService;
        this.userSessionService = userSessionService;
        this.adminSetupKey = adminSetupKey;
    }

    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        String rawPassword = request.password().trim();
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(BAD_REQUEST, "Email is already registered");
        }

        User user = new User(
                request.fullName().trim(),
                email,
                passwordEncoder.encode(rawPassword),
                Role.STUDENT
        );
        User savedUser = userRepository.save(user);
        activityLogRepository.save(new ActivityLog(savedUser, "Account created successfully", "SYSTEM"));
        // Do not bind a server session here: the UI sends users to /login after register,
        // and an orphan session would block the first password login (hasActiveSession).
        return buildAuthResponse(savedUser, false);
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        String password = request.password().trim();
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );
        } catch (Exception exception) {
            throw new ResponseStatusException(UNAUTHORIZED, "Invalid email or password");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Invalid email or password"));
        // Always (re)bind the server session on password login. createOrUpdateSession replaces any
        // existing row for this user — important after register-without-session, OAuth, or stale DB rows.
        return buildAuthResponse(user, true);
    }

    public AuthResponse registerAdmin(AdminRegisterRequest request) {
        if (!adminSetupKey.equals(request.setupKey())) {
            throw new ResponseStatusException(UNAUTHORIZED, "Invalid admin setup key");
        }

        if (userRepository.existsByEmail(request.email().toLowerCase())) {
            throw new ResponseStatusException(BAD_REQUEST, "Email is already registered");
        }

        User admin = new User(
                request.fullName(),
                request.email().toLowerCase(),
                passwordEncoder.encode(request.password()),
                Role.ADMIN
        );
        User savedAdmin = userRepository.save(admin);
        activityLogRepository.save(new ActivityLog(savedAdmin, "Admin account created successfully", savedAdmin.getEmail()));
        return buildAuthResponse(savedAdmin, true);
    }

    public void logout(String email, String token) {
        if (email == null || email.isBlank()) {
            return;
        }
        userRepository.findByEmail(email.toLowerCase())
                .ifPresent(user -> activityLogRepository.save(new ActivityLog(user, "User logged out", user.getEmail())));
        if (token != null && !token.isBlank()) {
            try {
                tokenRevocationService.revoke(token, jwtService.extractExpiration(token));
                userSessionService.removeSessionByToken(token);
            } catch (Exception ignored) {
                // Ignore malformed/expired token revocation attempts.
            }
        } else {
            userRepository.findByEmail(email.toLowerCase())
                    .ifPresent(user -> userSessionService.removeSessionByUserId(user.getId()));
        }
    }

    /**
     * @param bindServerSession when true, persists the JWT as the active session (login / admin register).
     *                          Student {@link #register} passes false so the first password login is not blocked.
     */
    private AuthResponse buildAuthResponse(User user, boolean bindServerSession) {
        org.springframework.security.core.userdetails.User springUser =
                new org.springframework.security.core.userdetails.User(
                        user.getEmail(),
                        user.getPassword(),
                        java.util.List.of(() -> "ROLE_" + user.getRole().name())
                );

        String token = jwtService.generateToken(
                springUser,
                Map.of("userId", user.getId(), "role", user.getRole().name())
        );
        Instant expiresAt = jwtService.extractExpiration(token);
        if (bindServerSession) {
            userSessionService.createOrUpdateSession(user, token, expiresAt);
        }

        return new AuthResponse(
                token,
                "Bearer",
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name()
        );
    }
}
