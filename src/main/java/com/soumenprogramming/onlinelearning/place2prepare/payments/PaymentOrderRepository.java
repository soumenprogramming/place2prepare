package com.soumenprogramming.onlinelearning.place2prepare.payments;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

public interface PaymentOrderRepository extends JpaRepository<PaymentOrder, Long> {

    List<PaymentOrder> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<PaymentOrder> findByProviderOrderId(String providerOrderId);

    boolean existsByUserIdAndCourseIdAndStatus(Long userId, Long courseId, PaymentStatus status);

    @Modifying
    @Transactional
    void deleteByUserId(Long userId);
}
