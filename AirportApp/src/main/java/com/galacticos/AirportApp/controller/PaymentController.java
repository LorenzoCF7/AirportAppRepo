package com.galacticos.AirportApp.controller;

import com.galacticos.AirportApp.entity.Payment;
import com.galacticos.AirportApp.service.PaymentService;
import com.stripe.exception.StripeException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:5174", "http://localhost:3000"})
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * Crea un PaymentIntent para iniciar el flujo de pago
     */
    @PostMapping("/create-payment-intent")
    public ResponseEntity<Map<String, Object>> createPaymentIntent(
            @RequestBody CreatePaymentRequest request) {
        try {
            log.info("📋 POST /create-payment-intent - Usuario: {}, Monto: {}{}", 
                    request.getUserId(), request.getAmount(), request.getCurrency());

            var paymentIntent = paymentService.createPaymentIntent(
                    request.getUserId(),
                    request.getTicketId(),
                    request.getAmount(),
                    request.getCurrency()
            );

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("clientSecret", paymentIntent.getClientSecret());
            response.put("paymentIntentId", paymentIntent.getId());

            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            log.error("❌ Error en Stripe: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", e.getMessage()));
        } catch (Exception e) {
            log.error("❌ Error creando PaymentIntent: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * Confirma un pago completado
     */
    @PostMapping("/confirm-payment")
    public ResponseEntity<Map<String, Object>> confirmPayment(
            @RequestBody ConfirmPaymentRequest request) {
        try {
            log.info("📋 POST /confirm-payment - PaymentIntent: {}", request.getPaymentIntentId());

            Payment payment = paymentService.confirmPayment(request.getPaymentIntentId());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("paymentStatus", payment.getStatus().toString());
            response.put("amount", payment.getAmount());
            response.put("ticketId", payment.getTicketId());

            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            log.error("❌ Error en Stripe: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", e.getMessage()));
        } catch (Exception e) {
            log.error("❌ Error confirmando pago: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * Obtiene el estado de un pago
     */
    @GetMapping("/status/{paymentIntentId}")
    public ResponseEntity<Map<String, Object>> getPaymentStatus(
            @PathVariable String paymentIntentId) {
        try {
            log.info("📋 GET /status/{} - Obteniendo estado", paymentIntentId);

            Payment payment = paymentService.getPaymentStatus(paymentIntentId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("paymentStatus", payment.getStatus().toString());
            response.put("amount", payment.getAmount());
            response.put("ticketId", payment.getTicketId());
            response.put("cardBrand", payment.getCardBrand());
            response.put("cardLastFour", payment.getCardLastFour());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error obteniendo estado de pago: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * Obtiene todos los pagos de un usuario
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> getUserPayments(@PathVariable Long userId) {
        try {
            log.info("📋 GET /user/{} - Obteniendo pagos", userId);

            List<Payment> payments = paymentService.getUserPayments(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", payments.size());
            response.put("payments", payments);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error obteniendo pagos del usuario: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * Cancela un pago
     */
    @PostMapping("/cancel/{paymentIntentId}")
    public ResponseEntity<Map<String, Object>> cancelPayment(
            @PathVariable String paymentIntentId) {
        try {
            log.info("📋 POST /cancel/{} - Cancelando pago", paymentIntentId);

            Payment payment = paymentService.cancelPayment(paymentIntentId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("paymentStatus", payment.getStatus().toString());

            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            log.error("❌ Error en Stripe: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", e.getMessage()));
        } catch (Exception e) {
            log.error("❌ Error cancelando pago: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    // ========== DTOs ==========

    public static class CreatePaymentRequest {
        private Long userId;
        private String ticketId;
        private Double amount;
        private String currency;

        public CreatePaymentRequest() {}

        public CreatePaymentRequest(Long userId, String ticketId, Double amount, String currency) {
            this.userId = userId;
            this.ticketId = ticketId;
            this.amount = amount;
            this.currency = currency;
        }

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }

        public String getTicketId() { return ticketId; }
        public void setTicketId(String ticketId) { this.ticketId = ticketId; }

        public Double getAmount() { return amount; }
        public void setAmount(Double amount) { this.amount = amount; }

        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }
    }

    public static class ConfirmPaymentRequest {
        private String paymentIntentId;

        public ConfirmPaymentRequest() {}

        public ConfirmPaymentRequest(String paymentIntentId) {
            this.paymentIntentId = paymentIntentId;
        }

        public String getPaymentIntentId() { return paymentIntentId; }
        public void setPaymentIntentId(String paymentIntentId) { this.paymentIntentId = paymentIntentId; }
    }
}
