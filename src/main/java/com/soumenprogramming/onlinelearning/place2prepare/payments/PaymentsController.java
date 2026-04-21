package com.soumenprogramming.onlinelearning.place2prepare.payments;

import com.soumenprogramming.onlinelearning.place2prepare.payments.dto.BillingSummaryResponse;
import com.soumenprogramming.onlinelearning.place2prepare.payments.dto.CheckoutRequest;
import com.soumenprogramming.onlinelearning.place2prepare.payments.dto.CheckoutResponse;
import com.soumenprogramming.onlinelearning.place2prepare.payments.dto.InvoiceResponse;
import com.soumenprogramming.onlinelearning.place2prepare.payments.dto.PaymentOrderResponse;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentsController {

    private final PaymentsService paymentsService;

    public PaymentsController(PaymentsService paymentsService) {
        this.paymentsService = paymentsService;
    }

    @GetMapping("/summary")
    public BillingSummaryResponse summary(Authentication authentication) {
        return paymentsService.summaryFor(authentication.getName());
    }

    @PostMapping("/checkout")
    public CheckoutResponse checkout(@Valid @RequestBody CheckoutRequest request,
                                     Authentication authentication) {
        return paymentsService.createCheckout(authentication.getName(), request.courseId());
    }

    @PostMapping("/orders/{orderId}/mock-confirm")
    public PaymentOrderResponse mockConfirm(@PathVariable Long orderId,
                                            Authentication authentication) {
        return paymentsService.confirmMockOrder(authentication.getName(), orderId);
    }

    @PostMapping("/orders/{orderId}/cancel")
    public PaymentOrderResponse cancel(@PathVariable Long orderId,
                                       Authentication authentication) {
        return paymentsService.cancelPendingOrder(authentication.getName(), orderId);
    }

    @PostMapping("/courses/{courseId}/downgrade")
    public Map<String, Object> downgrade(@PathVariable Long courseId,
                                         Authentication authentication) {
        paymentsService.downgradeEnrollment(authentication.getName(), courseId);
        return Map.of(
                "message",
                "You've been moved back to the Basic plan for this course."
        );
    }

    @GetMapping("/invoices/{id}")
    public InvoiceResponse getInvoice(@PathVariable Long id, Authentication authentication) {
        return paymentsService.getInvoice(authentication.getName(), id);
    }
}
