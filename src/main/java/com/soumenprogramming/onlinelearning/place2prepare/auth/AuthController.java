package com.soumenprogramming.onlinelearning.place2prepare.auth;

import com.soumenprogramming.onlinelearning.place2prepare.auth.dto.AuthResponse;
import com.soumenprogramming.onlinelearning.place2prepare.auth.dto.AdminRegisterRequest;
import com.soumenprogramming.onlinelearning.place2prepare.auth.dto.LoginRequest;
import com.soumenprogramming.onlinelearning.place2prepare.auth.dto.PasswordResetConfirmDto;
import com.soumenprogramming.onlinelearning.place2prepare.auth.dto.PasswordResetRequestDto;
import com.soumenprogramming.onlinelearning.place2prepare.auth.dto.RegisterRequest;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    public AuthController(AuthService authService,
                          PasswordResetService passwordResetService) {
        this.authService = authService;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/admin/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse registerAdmin(@Valid @RequestBody AdminRegisterRequest request) {
        return authService.registerAdmin(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/password/reset-request")
    public Map<String, String> requestPasswordReset(@Valid @RequestBody PasswordResetRequestDto request) {
        passwordResetService.requestReset(request);
        return Map.of(
                "message",
                "If an account exists for that email, a reset link has been sent."
        );
    }

    @PostMapping("/password/reset-confirm")
    public Map<String, String> confirmPasswordReset(@Valid @RequestBody PasswordResetConfirmDto request) {
        passwordResetService.confirmReset(request);
        return Map.of("message", "Your password has been updated. Please sign in again.");
    }

    @PostMapping("/logout")
    public Map<String, String> logout(Authentication authentication,
                                      @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        if (authentication != null) {
            String token = null;
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7).trim();
            }
            authService.logout(authentication.getName(), token);
        }
        return Map.of("message", "Logged out successfully");
    }
}
