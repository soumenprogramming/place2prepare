package com.soumenprogramming.onlinelearning.place2prepare.dashboard;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findTop5ByUserIdOrderByCreatedAtDesc(Long userId);

    void deleteByUserId(Long userId);
}
