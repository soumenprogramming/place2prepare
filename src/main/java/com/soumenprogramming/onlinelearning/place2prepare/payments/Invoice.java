package com.soumenprogramming.onlinelearning.place2prepare.payments;

import com.soumenprogramming.onlinelearning.place2prepare.course.Course;
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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(
        name = "invoices",
        indexes = {
                @Index(name = "idx_invoices_user", columnList = "user_id"),
                @Index(name = "idx_invoices_number", columnList = "invoiceNumber", unique = true)
        }
)
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id")
    private Course course;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", unique = true)
    private PaymentOrder order;

    @Column(nullable = false, unique = true, length = 40)
    private String invoiceNumber;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 8)
    private String currency;

    @Column(nullable = false, length = 30)
    private String planType;

    @Column(nullable = false)
    private Instant issuedAt;

    protected Invoice() {
    }

    public Invoice(User user,
                   Course course,
                   PaymentOrder order,
                   String invoiceNumber,
                   BigDecimal amount,
                   String currency,
                   String planType) {
        this.user = user;
        this.course = course;
        this.order = order;
        this.invoiceNumber = invoiceNumber;
        this.amount = amount;
        this.currency = currency;
        this.planType = planType;
        this.issuedAt = Instant.now();
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

    public PaymentOrder getOrder() {
        return order;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getCurrency() {
        return currency;
    }

    public String getPlanType() {
        return planType;
    }

    public Instant getIssuedAt() {
        return issuedAt;
    }
}
