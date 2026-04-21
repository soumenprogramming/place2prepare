package com.soumenprogramming.onlinelearning.place2prepare.practice;

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

@Entity
@Table(
        name = "quiz_attempt_answers",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_attempt_answers_attempt_question",
                columnNames = {"attempt_id", "question_id"}
        ),
        indexes = @Index(name = "idx_attempt_answers_attempt", columnList = "attempt_id")
)
public class AttemptAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "attempt_id")
    private QuizAttempt attempt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id")
    private Question question;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "selected_option_id")
    private QuestionOption selectedOption;

    @Column(nullable = false)
    private boolean correct;

    protected AttemptAnswer() {
    }

    public AttemptAnswer(QuizAttempt attempt, Question question, QuestionOption selectedOption, boolean correct) {
        this.attempt = attempt;
        this.question = question;
        this.selectedOption = selectedOption;
        this.correct = correct;
    }

    public Long getId() {
        return id;
    }

    public QuizAttempt getAttempt() {
        return attempt;
    }

    public Question getQuestion() {
        return question;
    }

    public QuestionOption getSelectedOption() {
        return selectedOption;
    }

    public boolean isCorrect() {
        return correct;
    }
}
