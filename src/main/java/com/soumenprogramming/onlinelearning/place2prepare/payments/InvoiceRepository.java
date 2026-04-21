package com.soumenprogramming.onlinelearning.place2prepare.payments;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    List<Invoice> findByUserIdOrderByIssuedAtDesc(Long userId);

    Optional<Invoice> findByOrderId(Long orderId);

    Optional<Invoice> findByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);

    @Modifying
    @Transactional
    void deleteByUserId(Long userId);
}
