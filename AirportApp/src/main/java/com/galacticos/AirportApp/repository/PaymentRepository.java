package com.galacticos.AirportApp.repository;

import com.galacticos.AirportApp.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByStripePaymentIntentId(String stripePaymentIntentId);

    List<Payment> findByUserId(Long userId);

    List<Payment> findByTicketId(String ticketId);

    List<Payment> findByStatus(Payment.PaymentStatus status);
}
