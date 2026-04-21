package com.soumenprogramming.onlinelearning.place2prepare.learn;

import com.soumenprogramming.onlinelearning.place2prepare.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;

@Entity
@Table(
        name = "lesson_progress",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_lesson_progress_user_lesson",
                columnNames = {"user_id", "lesson_id"}
        ),
        indexes = {
                @Index(name = "idx_lesson_progress_user", columnList = "user_id"),
                @Index(name = "idx_lesson_progress_lesson", columnList = "lesson_id")
        }
)
public class LessonProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lesson_id")
    private Lesson lesson;

    @Column(nullable = false)
    private Instant completedAt;

    protected LessonProgress() {
    }

    public LessonProgress(User user, Lesson lesson) {
        this.user = user;
        this.lesson = lesson;
        this.completedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public Lesson getLesson() {
        return lesson;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }
}
