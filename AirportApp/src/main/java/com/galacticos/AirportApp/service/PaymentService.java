package com.galacticos.AirportApp.service;

import com.galacticos.AirportApp.entity.Payment;
import com.galacticos.AirportApp.repository.PaymentRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;

    @Value("${stripe.api-key}")
    private String stripeApiKey;

    @PostConstruct
    private void initStripe() {
        Stripe.apiKey = stripeApiKey;
    }

    /**
     * Crea un PaymentIntent en Stripe para procesar un pago
     */
    public PaymentIntent createPaymentIntent(Long userId, String ticketId, Double amount, String currency) 
            throws StripeException {
        
        log.info("🔄 Creando PaymentIntent: Usuario {}, Monto {}{}", userId, amount, currency);

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount((long) (amount * 100)) // Stripe maneja importes en centavos
                .setCurrency(currency.toLowerCase())
                .setDescription("Billete de vuelo #" + ticketId)
                .putMetadata("userId", String.valueOf(userId))
                .putMetadata("ticketId", ticketId)
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .build()
                )
                .build();

        PaymentIntent paymentIntent = PaymentIntent.create(params);
        
        // Guardar el registro inicial de pago
        Payment payment = Payment.builder()
                .stripePaymentIntentId(paymentIntent.getId())
                .userId(userId)
                .ticketId(ticketId)
                .amount(amount)
                .currency(currency.toUpperCase())
                .status(Payment.PaymentStatus.PENDING)
                .cardBrand("unknown")
                .cardLastFour("0000")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        paymentRepository.save(payment);
        log.info("✅ PaymentIntent creado: {}", paymentIntent.getId());

        return paymentIntent;
    }

    /**
     * Confirma un pago que ya ha sido procesado por el cliente
     */
    public Payment confirmPayment(String paymentIntentId) throws StripeException {
        log.info("🔄 Confirmando pago: {}", paymentIntentId);

        PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);

        Optional<Payment> existingPayment = paymentRepository.findByStripePaymentIntentId(paymentIntentId);
        Payment payment = existingPayment.orElseThrow(() -> 
            new RuntimeException("Pago no encontrado: " + paymentIntentId)
        );

        if ("succeeded".equals(paymentIntent.getStatus())) {
            payment.setStatus(Payment.PaymentStatus.SUCCEEDED);
            payment.setUpdatedAt(LocalDateTime.now());
            
            // Extraer información de la tarjeta desde el payment method
            String paymentMethodId = paymentIntent.getPaymentMethod();
            if (paymentMethodId != null) {
                try {
                    com.stripe.model.PaymentMethod paymentMethod = com.stripe.model.PaymentMethod.retrieve(paymentMethodId);
                    if (paymentMethod.getCard() != null) {
                        payment.setCardBrand(paymentMethod.getCard().getBrand());
                        payment.setCardLastFour(paymentMethod.getCard().getLast4());
                    }
                } catch (Exception e) {
                    log.warn("No se pudo obtener detalles de la tarjeta: {}", e.getMessage());
                    payment.setCardBrand("unknown");
                    payment.setCardLastFour("0000");
                }
            }
            
            log.info("✅ Pago confirmado exitosamente: {}", paymentIntentId);
        } else if ("processing".equals(paymentIntent.getStatus())) {
            payment.setStatus(Payment.PaymentStatus.PENDING);
            log.info("⏳ Pago en procesamiento: {}", paymentIntentId);
        } else if ("requires_action".equals(paymentIntent.getStatus()) || 
                   "requires_payment_method".equals(paymentIntent.getStatus())) {
            payment.setStatus(Payment.PaymentStatus.PENDING);
            log.info("⚠️ Pago requiere acción adicional: {}", paymentIntentId);
        } else {
            payment.setStatus(Payment.PaymentStatus.FAILED);
            payment.setErrorMessage("Estado del pago: " + paymentIntent.getStatus());
            log.error("❌ Pago fallido: {}", paymentIntentId);
        }

        return paymentRepository.save(payment);
    }

    /**
     * Obtiene el estado de un pago
     */
    public Payment getPaymentStatus(String paymentIntentId) {
        return paymentRepository.findByStripePaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new RuntimeException("Pago no encontrado: " + paymentIntentId));
    }

    /**
     * Obtiene todos los pagos de un usuario
     */
    public List<Payment> getUserPayments(Long userId) {
        return paymentRepository.findByUserId(userId);
    }

    /**
     * Obtiene todos los pagos de un billete
     */
    public List<Payment> getTicketPayments(String ticketId) {
        return paymentRepository.findByTicketId(ticketId);
    }

    /**
     * Cancela un pago
     */
    public Payment cancelPayment(String paymentIntentId) throws StripeException {
        log.info("🔄 Cancelando pago: {}", paymentIntentId);

        PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
        PaymentIntent cancelledIntent = paymentIntent.cancel();

        Optional<Payment> existingPayment = paymentRepository.findByStripePaymentIntentId(paymentIntentId);
        Payment payment = existingPayment.orElseThrow(() -> 
            new RuntimeException("Pago no encontrado: " + paymentIntentId)
        );

        payment.setStatus(Payment.PaymentStatus.CANCELLED);
        payment.setUpdatedAt(LocalDateTime.now());

        log.info("✅ Pago cancelado: {}", paymentIntentId);
        return paymentRepository.save(payment);
    }
}
