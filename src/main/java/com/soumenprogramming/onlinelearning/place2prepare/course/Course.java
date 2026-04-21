package com.soumenprogramming.onlinelearning.place2prepare.course;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "courses")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(nullable = false)
    private String difficulty;

    @Column(nullable = false)
    private int durationHours;

    @Column(nullable = false)
    private boolean active;

    @Column(name = "is_premium")
    private Boolean premium;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subject_id")
    private Subject subject;

    protected Course() {
    }

    public Course(String title,
                  String slug,
                  String description,
                  String difficulty,
                  int durationHours,
                  boolean active,
                  Subject subject) {
        this(title, slug, description, difficulty, durationHours, active, false, subject);
    }

    public Course(String title,
                  String slug,
                  String description,
                  String difficulty,
                  int durationHours,
                  boolean active,
                  boolean premium,
                  Subject subject) {
        this.title = title;
        this.slug = slug;
        this.description = description;
        this.difficulty = difficulty;
        this.durationHours = durationHours;
        this.active = active;
        this.premium = premium;
        this.subject = subject;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getSlug() {
        return slug;
    }

    public String getDescription() {
        return description;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public int getDurationHours() {
        return durationHours;
    }

    public boolean isActive() {
        return active;
    }

    public boolean isPremium() {
        return premium != null && premium;
    }

    public Subject getSubject() {
        return subject;
    }
}
