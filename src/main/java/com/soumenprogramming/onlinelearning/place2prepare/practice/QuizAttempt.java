package com.soumenprogramming.onlinelearning.place2prepare.practice;

import com.soumenprogramming.onlinelearning.place2prepare.user.User;
import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "quiz_attempts",
        indexes = {
                @Index(name = "idx_quiz_attempts_user_quiz", columnList = "user_id, quiz_id"),
                @Index(name = "idx_quiz_attempts_quiz", columnList = "quiz_id")
        }
)
public class QuizAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quiz_id")
    private Quiz quiz;

    @Column(nullable = false)
    private Instant startedAt;

    @Column
    private Instant submittedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AttemptStatus status;

    @Column(nullable = false)
    private int totalQuestions;

    @Column(nullable = false)
    private int correctAnswers;

    @Column(nullable = false)
    private int scorePercent;

    @Column(nullable = false)
    private int timeLimitMinutesSnapshot;

    @OneToMany(mappedBy = "attempt", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<AttemptAnswer> answers = new ArrayList<>();

    protected QuizAttempt() {
    }

    public QuizAttempt(User user, Quiz quiz, int totalQuestions) {
        this.user = user;
        this.quiz = quiz;
        this.startedAt = Instant.now();
        this.status = AttemptStatus.IN_PROGRESS;
        this.totalQuestions = totalQuestions;
        this.correctAnswers = 0;
        this.scorePercent = 0;
        this.timeLimitMinutesSnapshot = quiz.getTimeLimitMinutes();
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public Quiz getQuiz() {
        return quiz;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public Instant getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(Instant submittedAt) {
        this.submittedAt = submittedAt;
    }

    public AttemptStatus getStatus() {
        return status;
    }

    public void setStatus(AttemptStatus status) {
        this.status = status;
    }

    public int getTotalQuestions() {
        return totalQuestions;
    }

    public int getCorrectAnswers() {
        return correctAnswers;
    }

    public void setCorrectAnswers(int correctAnswers) {
        this.correctAnswers = correctAnswers;
    }

    public int getScorePercent() {
        return scorePercent;
    }

    public void setScorePercent(int scorePercent) {
        this.scorePercent = Math.min(100, Math.max(0, scorePercent));
    }

    public int getTimeLimitMinutesSnapshot() {
        return timeLimitMinutesSnapshot;
    }

    public List<AttemptAnswer> getAnswers() {
        return answers;
    }
}
