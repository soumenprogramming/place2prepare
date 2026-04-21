package com.soumenprogramming.onlinelearning.place2prepare.live;

import com.soumenprogramming.onlinelearning.place2prepare.live.dto.LiveSessionCalendarResponse;
import com.soumenprogramming.onlinelearning.place2prepare.live.dto.LiveSessionResponse;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/learn")
public class LiveSessionController {

    private final LiveSessionService liveSessionService;

    public LiveSessionController(LiveSessionService liveSessionService) {
        this.liveSessionService = liveSessionService;
    }

    @GetMapping("/live-sessions")
    public LiveSessionCalendarResponse calendar(Authentication authentication) {
        return liveSessionService.calendarForStudent(authentication.getName());
    }

    @GetMapping("/courses/{courseId}/live-sessions")
    public List<LiveSessionResponse> forCourse(@PathVariable Long courseId,
                                               Authentication authentication) {
        return liveSessionService.forCourse(authentication.getName(), courseId);
    }
}
