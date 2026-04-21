package com.soumenprogramming.onlinelearning.place2prepare.notify;

import com.soumenprogramming.onlinelearning.place2prepare.notify.dto.NotificationFeedResponse;
import com.soumenprogramming.onlinelearning.place2prepare.notify.dto.NotificationResponse;
import com.soumenprogramming.onlinelearning.place2prepare.user.User;
import com.soumenprogramming.onlinelearning.place2prepare.user.UserRepository;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(NotificationService notificationService,
                                  UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public NotificationFeedResponse list(Authentication authentication,
                                         @RequestParam(name = "limit", defaultValue = "20") int limit) {
        User user = resolveUser(authentication);
        List<NotificationResponse> items = notificationService.recent(user.getId(), limit).stream()
                .map(this::toResponse)
                .toList();
        long unread = notificationService.unreadCount(user.getId());
        return new NotificationFeedResponse(unread, items);
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount(Authentication authentication) {
        User user = resolveUser(authentication);
        return Map.of("unreadCount", notificationService.unreadCount(user.getId()));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long id, Authentication authentication) {
        User user = resolveUser(authentication);
        boolean updated = notificationService.markRead(user.getId(), id);
        if (!updated) {
            throw new ResponseStatusException(NOT_FOUND, "Notification not found");
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/read-all")
    public Map<String, Integer> markAllRead(Authentication authentication) {
        User user = resolveUser(authentication);
        int updated = notificationService.markAllRead(user.getId());
        return Map.of("updated", updated);
    }

    private User resolveUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getType().name(),
                n.getTitle(),
                n.getMessage(),
                n.getLink(),
                n.isRead(),
                n.getCreatedAt()
        );
    }
}
