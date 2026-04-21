package com.soumenprogramming.onlinelearning.place2prepare.dashboard;

import com.soumenprogramming.onlinelearning.place2prepare.course.Course;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(
        name = "live_sessions",
        indexes = {
                @Index(name = "idx_live_sessions_scheduled", columnList = "scheduledAt"),
                @Index(name = "idx_live_sessions_course", columnList = "course_id")
        }
)
public class LiveSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(length = 200)
    private String instructorName;

    @Column(length = 500)
    private String joinUrl;

    @Column(nullable = false)
    private int durationMinutes;

    @Column(nullable = false)
    private Instant scheduledAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LiveSessionStatus status;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    protected LiveSession() {
    }

    public LiveSession(String title, Instant scheduledAt) {
        this(null, title, null, null, null, 60, scheduledAt, LiveSessionStatus.SCHEDULED);
    }

    public LiveSession(Course course,
                       String title,
                       String description,
                       String instructorName,
                       String joinUrl,
                       int durationMinutes,
                       Instant scheduledAt,
                       LiveSessionStatus status) {
        this.course = course;
        this.title = title;
        this.description = description;
        this.instructorName = instructorName;
        this.joinUrl = joinUrl;
        this.durationMinutes = Math.max(5, durationMinutes);
        this.scheduledAt = scheduledAt;
        this.status = status == null ? LiveSessionStatus.SCHEDULED : status;
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    public Long getId() {
        return id;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getInstructorName() {
        return instructorName;
    }

    public void setInstructorName(String instructorName) {
        this.instructorName = instructorName;
    }

    public String getJoinUrl() {
        return joinUrl;
    }

    public void setJoinUrl(String joinUrl) {
        this.joinUrl = joinUrl;
    }

    public int getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(int durationMinutes) {
        this.durationMinutes = Math.max(5, durationMinutes);
    }

    public Instant getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(Instant scheduledAt) {
        this.scheduledAt = scheduledAt;
    }

    public LiveSessionStatus getStatus() {
        return status;
    }

    public void setStatus(LiveSessionStatus status) {
        if (status != null) this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void touch() {
        this.updatedAt = Instant.now();
    }
}
