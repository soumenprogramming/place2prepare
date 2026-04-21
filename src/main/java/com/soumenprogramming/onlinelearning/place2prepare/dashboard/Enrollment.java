package com.soumenprogramming.onlinelearning.place2prepare.dashboard;

import com.soumenprogramming.onlinelearning.place2prepare.course.Course;
import com.soumenprogramming.onlinelearning.place2prepare.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "enrollments")
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id")
    private Course course;

    @Column(nullable = false)
    private int progressPercentage;

    @Column(nullable = false)
    private int lessonsLeft;

    @Column(nullable = false, length = 30)
    private String planType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EnrollmentStatus status;

    @Column(nullable = false)
    private Instant createdAt;

    protected Enrollment() {
    }

    public Enrollment(User user, Course course, int progressPercentage, int lessonsLeft, EnrollmentStatus status) {
        this(user, course, progressPercentage, lessonsLeft, "BASIC", status);
    }

    public Enrollment(User user,
                      Course course,
                      int progressPercentage,
                      int lessonsLeft,
                      String planType,
                      EnrollmentStatus status) {
        this.user = user;
        this.course = course;
        this.progressPercentage = progressPercentage;
        this.lessonsLeft = lessonsLeft;
        this.planType = planType;
        this.status = status;
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public Course getCourse() {
        return course;
    }

    public int getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(int progressPercentage) {
        this.progressPercentage = Math.min(100, Math.max(0, progressPercentage));
    }

    public int getLessonsLeft() {
        return lessonsLeft;
    }

    public void setLessonsLeft(int lessonsLeft) {
        this.lessonsLeft = Math.max(0, lessonsLeft);
    }

    public String getPlanType() {
        return planType;
    }

    public void setPlanType(String planType) {
        this.planType = planType;
    }

    public EnrollmentStatus getStatus() {
        return status;
    }

    public void setStatus(EnrollmentStatus status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
