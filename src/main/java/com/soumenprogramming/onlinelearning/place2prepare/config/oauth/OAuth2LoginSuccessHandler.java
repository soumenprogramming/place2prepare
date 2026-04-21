package com.soumenprogramming.onlinelearning.place2prepare.config.oauth;

import com.soumenprogramming.onlinelearning.place2prepare.auth.session.UserSessionService;
import com.soumenprogramming.onlinelearning.place2prepare.config.JwtService;
import com.soumenprogramming.onlinelearning.place2prepare.user.Role;
import com.soumenprogramming.onlinelearning.place2prepare.user.User;
import com.soumenprogramming.onlinelearning.place2prepare.user.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserSessionService userSessionService;
    private final String frontendLoginUrl;

    public OAuth2LoginSuccessHandler(UserRepository userRepository,
                                     JwtService jwtService,
                                     UserSessionService userSessionService,
                                     @Value("${app.oauth2.frontend-login-url:http://localhost:3000/login}") String frontendLoginUrl) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
        this.jwtService = jwtService;
        this.userSessionService = userSessionService;
        this.frontendLoginUrl = frontendLoginUrl;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        String email = extractEmail(oauthUser);
        if (email == null || email.isBlank()) {
            getRedirectStrategy().sendRedirect(request, response, frontendLoginUrl + "?error=social_email_missing");
            return;
        }

        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseGet(() -> userRepository.save(new User(
                        extractName(oauthUser),
                        email.toLowerCase(),
                        passwordEncoder.encode(UUID.randomUUID().toString()),
                        Role.STUDENT
                )));

        if (userSessionService.hasActiveSession(user.getId())) {
            getRedirectStrategy().sendRedirect(request, response, frontendLoginUrl + "?error=already_logged_in");
            return;
        }

        UserDetails springUser = new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                List.of(() -> "ROLE_" + user.getRole().name())
        );
        String token = jwtService.generateToken(
                springUser,
                Map.of("userId", user.getId(), "role", user.getRole().name())
        );
        userSessionService.createOrUpdateSession(user, token, jwtService.extractExpiration(token));

        String redirectUrl = frontendLoginUrl
                + "?token=" + URLEncoder.encode(token, StandardCharsets.UTF_8)
                + "&role=" + URLEncoder.encode(user.getRole().name(), StandardCharsets.UTF_8);
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }

    private String extractEmail(OAuth2User oauthUser) {
        Object email = oauthUser.getAttributes().get("email");
        if (email != null) {
            return email.toString();
        }
        Object login = oauthUser.getAttributes().get("login");
        if (login != null) {
            return login.toString() + "@github.local";
        }
        return null;
    }

    private String extractName(OAuth2User oauthUser) {
        Object name = oauthUser.getAttributes().get("name");
        if (name != null && !name.toString().isBlank()) {
            return name.toString();
        }
        Object login = oauthUser.getAttributes().get("login");
        if (login != null) {
            return login.toString();
        }
        return "OAuth User";
    }
}
