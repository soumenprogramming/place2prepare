package com.soumenprogramming.onlinelearning.place2prepare.practice;

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
@Table(name = "quiz_question_options")
public class QuestionOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id")
    private Question question;

    @Column(nullable = false, length = 1000)
    private String text;

    @Column(nullable = false)
    private boolean correct;

    @Column(nullable = false)
    private int position;

    protected QuestionOption() {
    }

    public QuestionOption(Question question, String text, boolean correct, int position) {
        this.question = question;
        this.text = text;
        this.correct = correct;
        this.position = position;
    }

    public Long getId() {
        return id;
    }

    public Question getQuestion() {
        return question;
    }

    public String getText() {
        return text;
    }

    public boolean isCorrect() {
        return correct;
    }

    public int getPosition() {
        return position;
    }
}
