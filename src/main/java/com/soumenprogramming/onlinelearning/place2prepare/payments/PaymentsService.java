package com.soumenprogramming.onlinelearning.place2prepare.payments;

import com.soumenprogramming.onlinelearning.place2prepare.course.Course;
import com.soumenprogramming.onlinelearning.place2prepare.course.CourseRepository;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.ActivityLog;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.ActivityLogRepository;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.Enrollment;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.EnrollmentRepository;
import com.soumenprogramming.onlinelearning.place2prepare.notify.NotificationService;
import com.soumenprogramming.onlinelearning.place2prepare.notify.NotificationType;
import com.soumenprogramming.onlinelearning.place2prepare.payments.dto.BillingSummaryResponse;
import com.soumenprogramming.onlinelearning.place2prepare.payments.dto.CheckoutResponse;
import com.soumenprogramming.onlinelearning.place2prepare.payments.dto.InvoiceResponse;
import com.soumenprogramming.onlinelearning.place2prepare.payments.dto.PaymentOrderResponse;
import com.soumenprogramming.onlinelearning.place2prepare.user.User;
import com.soumenprogramming.onlinelearning.place2prepare.user.UserRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class PaymentsService {

    private static final String PREMIUM = "PREMIUM";
    private static final DateTimeFormatter INVOICE_FMT =
            DateTimeFormatter.ofPattern("yyyyMM").withZone(ZoneOffset.UTC);

    private static final Logger log = LoggerFactory.getLogger(PaymentsService.class);

    private final PaymentOrderRepository orderRepository;
    private final InvoiceRepository invoiceRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final ActivityLogRepository activityLogRepository;
    private final NotificationService notificationService;
    private final PaymentGateway gateway;
    private final boolean enabled;
    private final BigDecimal premiumPrice;
    private final String currency;
    private final String frontendBaseUrl;

    public PaymentsService(PaymentOrderRepository orderRepository,
                           InvoiceRepository invoiceRepository,
                           EnrollmentRepository enrollmentRepository,
                           UserRepository userRepository,
                           CourseRepository courseRepository,
                           ActivityLogRepository activityLogRepository,
                           NotificationService notificationService,
                           PaymentGateway gateway,
                           @Value("${app.payments.enabled:true}") boolean enabled,
                           @Value("${app.payments.premium.price-inr:999}") BigDecimal premiumPrice,
                           @Value("${app.payments.premium.currency:INR}") String currency,
                           @Value("${app.frontend.base-url:http://localhost:3000}") String frontendBaseUrl) {
        this.orderRepository = orderRepository;
        this.invoiceRepository = invoiceRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.activityLogRepository = activityLogRepository;
        this.notificationService = notificationService;
        this.gateway = gateway;
        this.enabled = enabled;
        this.premiumPrice = premiumPrice;
        this.currency = currency;
        this.frontendBaseUrl = frontendBaseUrl;
    }

    @Transactional
    public CheckoutResponse createCheckout(String email, Long courseId) {
        requireEnabled();
        User user = resolveUser(email);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Course not found"));
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(user.getId(), courseId)
                .orElseThrow(() -> new ResponseStatusException(
                        BAD_REQUEST,
                        "Enroll in this course first before upgrading to Premium."
                ));
        if (PREMIUM.equalsIgnoreCase(enrollment.getPlanType())) {
            throw new ResponseStatusException(BAD_REQUEST, "You're already on the Premium plan for this course.");
        }
        if (orderRepository.existsByUserIdAndCourseIdAndStatus(user.getId(), courseId, PaymentStatus.PENDING)) {
            throw new ResponseStatusException(
                    BAD_REQUEST,
                    "A payment for this course is already in progress. Check your billing page."
            );
        }

        PaymentOrder order = new PaymentOrder(
                user,
                course,
                PREMIUM,
                premiumPrice,
                currency,
                gateway.provider()
        );
        order = orderRepository.save(order);

        String successUrl = frontendBaseUrl + "/payments/complete?orderId=" + order.getId();
        String cancelUrl = frontendBaseUrl + "/billing?cancelled=1";

        PaymentGateway.CheckoutSession session;
        try {
            session = gateway.createCheckout(order, successUrl, cancelUrl);
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Gateway {} failed to create checkout: {}", gateway.provider(), ex.getMessage());
            throw new ResponseStatusException(
                    BAD_REQUEST,
                    "The payment provider rejected this request. Please try again later."
            );
        }
        order.setProviderOrderId(session.providerOrderId());
        order.setCheckoutUrl(session.redirectUrl());
        order.touch();
        orderRepository.save(order);

        activityLogRepository.save(new ActivityLog(
                user,
                "Started Premium checkout for " + course.getTitle(),
                "SYSTEM"
        ));

        return new CheckoutResponse(
                order.getId(),
                gateway.provider(),
                session.providerOrderId(),
                session.redirectUrl(),
                order.getAmount(),
                order.getCurrency(),
                course.getTitle(),
                PREMIUM
        );
    }

    @Transactional
    public PaymentOrderResponse confirmMockOrder(String email, Long orderId) {
        requireEnabled();
        if (!MockPaymentGateway.PROVIDER.equals(gateway.provider())) {
            throw new ResponseStatusException(
                    BAD_REQUEST,
                    "Mock confirmation is only available on the mock gateway."
            );
        }
        User user = resolveUser(email);
        PaymentOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Order not found"));
        if (!order.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(FORBIDDEN, "You don't own this order");
        }
        completeOrder(order);
        return toOrderResponse(order);
    }

    @Transactional
    public void handleWebhook(String providerId, String payload, String signatureHeader) {
        requireEnabled();
        if (!gateway.provider().equals(providerId)) {
            // Ignore webhooks for a provider that isn't currently active.
            log.info("Ignoring webhook for inactive provider: {}", providerId);
            return;
        }
        PaymentGateway.WebhookEvent event = gateway.parseWebhook(payload, signatureHeader);
        if (event == null) return;

        PaymentOrder order = null;
        if (event.orderId() != null) {
            order = orderRepository.findById(event.orderId()).orElse(null);
        }
        if (order == null && event.providerOrderId() != null) {
            order = orderRepository.findByProviderOrderId(event.providerOrderId()).orElse(null);
        }
        if (order == null) {
            log.warn("Webhook referenced unknown order: orderId={} providerOrderId={}",
                    event.orderId(), event.providerOrderId());
            return;
        }

        if (event.resolvedStatus() == PaymentStatus.COMPLETED) {
            completeOrder(order);
        } else if (event.resolvedStatus() == PaymentStatus.FAILED
                || event.resolvedStatus() == PaymentStatus.CANCELLED) {
            failOrder(order, "Payment " + event.resolvedStatus().name().toLowerCase());
        }
    }

    private void completeOrder(PaymentOrder order) {
        if (order.getStatus() == PaymentStatus.COMPLETED) return; // idempotent
        if (order.getStatus() == PaymentStatus.CANCELLED) {
            throw new ResponseStatusException(BAD_REQUEST, "This order was cancelled");
        }
        order.setStatus(PaymentStatus.COMPLETED);
        order.setCompletedAt(Instant.now());
        order.touch();
        orderRepository.save(order);

        // Upgrade enrollment plan to PREMIUM.
        enrollmentRepository.findByUserIdAndCourseId(order.getUser().getId(), order.getCourse().getId())
                .ifPresent(enrollment -> {
                    enrollment.setPlanType(PREMIUM);
                    enrollmentRepository.save(enrollment);
                });

        // Issue an invoice if we haven't already.
        if (invoiceRepository.findByOrderId(order.getId()).isEmpty()) {
            invoiceRepository.save(new Invoice(
                    order.getUser(),
                    order.getCourse(),
                    order,
                    buildInvoiceNumber(order),
                    order.getAmount(),
                    order.getCurrency(),
                    order.getPlanType()
            ));
        }

        activityLogRepository.save(new ActivityLog(
                order.getUser(),
                "Premium activated for " + order.getCourse().getTitle(),
                "SYSTEM"
        ));
        notificationService.notify(
                order.getUser(),
                NotificationType.COURSE_ASSIGNED,
                "Premium unlocked: " + order.getCourse().getTitle(),
                "Your payment of " + order.getCurrency() + " " + order.getAmount()
                        + " was successful and Premium has been activated.",
                "/billing"
        );
    }

    @Transactional
    public void failOrder(PaymentOrder order, String reason) {
        if (order.getStatus() == PaymentStatus.COMPLETED) return;
        order.setStatus(PaymentStatus.FAILED);
        order.setFailureReason(reason);
        order.touch();
        orderRepository.save(order);
        activityLogRepository.save(new ActivityLog(
                order.getUser(),
                "Payment failed for " + order.getCourse().getTitle() + ": " + reason,
                "SYSTEM"
        ));
    }

    @Transactional
    public PaymentOrderResponse cancelPendingOrder(String email, Long orderId) {
        User user = resolveUser(email);
        PaymentOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Order not found"));
        if (!order.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(FORBIDDEN, "You don't own this order");
        }
        if (order.getStatus() != PaymentStatus.PENDING) {
            throw new ResponseStatusException(BAD_REQUEST, "Only pending orders can be cancelled.");
        }
        order.setStatus(PaymentStatus.CANCELLED);
        order.setFailureReason("Cancelled by user");
        order.touch();
        orderRepository.save(order);
        return toOrderResponse(order);
    }

    @Transactional
    public PaymentOrderResponse downgradeEnrollment(String email, Long courseId) {
        User user = resolveUser(email);
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(user.getId(), courseId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Enrollment not found"));
        if (!PREMIUM.equalsIgnoreCase(enrollment.getPlanType())) {
            throw new ResponseStatusException(BAD_REQUEST, "This course is already on the Basic plan.");
        }
        if (enrollment.getCourse().isPremium()) {
            throw new ResponseStatusException(
                    BAD_REQUEST,
                    "Premium-only courses cannot be downgraded. Contact support to cancel access instead."
            );
        }
        enrollment.setPlanType("BASIC");
        enrollmentRepository.save(enrollment);
        activityLogRepository.save(new ActivityLog(
                user,
                "Downgraded " + enrollment.getCourse().getTitle() + " to Basic",
                "SYSTEM"
        ));
        notificationService.notify(
                user,
                NotificationType.SYSTEM,
                "Plan downgraded to Basic",
                "You are now on the Basic plan for " + enrollment.getCourse().getTitle() + ".",
                "/billing"
        );
        // A downgrade doesn't refund past payments; return the most recent completed order.
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .filter(o -> o.getCourse().getId().equals(courseId))
                .findFirst()
                .map(this::toOrderResponse)
                .orElse(null);
    }

    public BillingSummaryResponse summaryFor(String email) {
        User user = resolveUser(email);
        List<PaymentOrderResponse> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toOrderResponse)
                .toList();
        List<InvoiceResponse> invoices = invoiceRepository.findByUserIdOrderByIssuedAtDesc(user.getId()).stream()
                .map(this::toInvoiceResponse)
                .toList();
        return new BillingSummaryResponse(
                gateway.provider(),
                enabled,
                premiumPrice,
                currency,
                orders,
                invoices
        );
    }

    public InvoiceResponse getInvoice(String email, Long invoiceId) {
        User user = resolveUser(email);
        Invoice invoice = invoiceRepository.findByIdAndUserId(invoiceId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Invoice not found"));
        return toInvoiceResponse(invoice);
    }

    public boolean isEnabled() {
        return enabled;
    }

    private void requireEnabled() {
        if (!enabled) {
            throw new ResponseStatusException(
                    BAD_REQUEST,
                    "Self-serve payments are currently disabled on this instance."
            );
        }
    }

    private User resolveUser(String email) {
        if (email == null) throw new ResponseStatusException(NOT_FOUND, "User not found");
        return userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));
    }

    private String buildInvoiceNumber(PaymentOrder order) {
        String prefix = "INV-" + INVOICE_FMT.format(Instant.now());
        return prefix + "-" + order.getId() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }

    private PaymentOrderResponse toOrderResponse(PaymentOrder order) {
        return new PaymentOrderResponse(
                order.getId(),
                order.getCourse().getId(),
                order.getCourse().getTitle(),
                order.getPlanType(),
                order.getAmount(),
                order.getCurrency(),
                order.getStatus().name(),
                order.getProvider(),
                order.getProviderOrderId(),
                order.getCheckoutUrl(),
                order.getFailureReason(),
                order.getCreatedAt(),
                order.getCompletedAt()
        );
    }

    private InvoiceResponse toInvoiceResponse(Invoice invoice) {
        return new InvoiceResponse(
                invoice.getId(),
                invoice.getInvoiceNumber(),
                invoice.getCourse().getId(),
                invoice.getCourse().getTitle(),
                invoice.getPlanType(),
                invoice.getAmount(),
                invoice.getCurrency(),
                invoice.getIssuedAt(),
                invoice.getOrder().getId()
        );
    }
}
