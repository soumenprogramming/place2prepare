package com.soumenprogramming.onlinelearning.place2prepare.dashboard;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LiveSessionRepository extends JpaRepository<LiveSession, Long> {

    List<LiveSession> findTop5ByScheduledAtAfterOrderByScheduledAtAsc(Instant now);

    List<LiveSession> findByCourseIdOrderByScheduledAtAsc(Long courseId);

    List<LiveSession> findAllByOrderByScheduledAtDesc();

    @Query("select ls from LiveSession ls " +
            "where ls.scheduledAt >= :from " +
            "and (ls.course is null or ls.course.id in :courseIds) " +
            "order by ls.scheduledAt asc")
    List<LiveSession> findUpcomingForStudent(
            @Param("from") Instant from,
            @Param("courseIds") Collection<Long> courseIds
    );

    @Query("select ls from LiveSession ls " +
            "where (ls.course is null or ls.course.id in :courseIds) " +
            "order by ls.scheduledAt desc")
    List<LiveSession> findAllForStudent(@Param("courseIds") Collection<Long> courseIds);

    void deleteByCourseId(Long courseId);
}
