package com.soumenprogramming.onlinelearning.place2prepare.practice;

import com.soumenprogramming.onlinelearning.place2prepare.course.Course;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "quizzes",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_quizzes_course_slug",
                columnNames = {"course_id", "slug"}
        )
)
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id")
    private Course course;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 200)
    private String slug;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(nullable = false)
    private int timeLimitMinutes;

    @Column(nullable = false)
    private int passingScorePercent;

    @Column(nullable = false)
    private boolean published;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("position ASC")
    private List<Question> questions = new ArrayList<>();

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    protected Quiz() {
    }

    public Quiz(Course course,
                String title,
                String slug,
                String description,
                int timeLimitMinutes,
                int passingScorePercent,
                boolean published) {
        this.course = course;
        this.title = title;
        this.slug = slug;
        this.description = description;
        this.timeLimitMinutes = timeLimitMinutes;
        this.passingScorePercent = passingScorePercent;
        this.published = published;
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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getTimeLimitMinutes() {
        return timeLimitMinutes;
    }

    public void setTimeLimitMinutes(int timeLimitMinutes) {
        this.timeLimitMinutes = timeLimitMinutes;
    }

    public int getPassingScorePercent() {
        return passingScorePercent;
    }

    public void setPassingScorePercent(int passingScorePercent) {
        this.passingScorePercent = passingScorePercent;
    }

    public boolean isPublished() {
        return published;
    }

    public void setPublished(boolean published) {
        this.published = published;
    }

    public List<Question> getQuestions() {
        return questions;
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
