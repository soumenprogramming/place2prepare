package com.soumenprogramming.onlinelearning.place2prepare.live;

import com.soumenprogramming.onlinelearning.place2prepare.live.dto.AdminLiveSessionRequest;
import com.soumenprogramming.onlinelearning.place2prepare.live.dto.LiveSessionResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/live-sessions")
@PreAuthorize("hasRole('ADMIN')")
public class LiveSessionAdminController {

    private final LiveSessionAdminService liveSessionAdminService;

    public LiveSessionAdminController(LiveSessionAdminService liveSessionAdminService) {
        this.liveSessionAdminService = liveSessionAdminService;
    }

    @GetMapping
    public List<LiveSessionResponse> list() {
        return liveSessionAdminService.list();
    }

    @GetMapping("/{id}")
    public LiveSessionResponse get(@PathVariable Long id) {
        return liveSessionAdminService.get(id);
    }

    @PostMapping
    public LiveSessionResponse create(@Valid @RequestBody AdminLiveSessionRequest request,
                                      Authentication authentication) {
        return liveSessionAdminService.create(request, authentication.getName());
    }

    @PutMapping("/{id}")
    public LiveSessionResponse update(@PathVariable Long id,
                                      @Valid @RequestBody AdminLiveSessionRequest request,
                                      Authentication authentication) {
        return liveSessionAdminService.update(id, request, authentication.getName());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        liveSessionAdminService.delete(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
