package com.galacticos.AirportApp.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String ownerUserId;

    // Flight information
    @Column(nullable = false)
    private String flightNumber;

    @Column(nullable = false, length = 10)
    private String flightIATA;

    @Column(nullable = false)
    private String airlineName;

    @Column(nullable = false, length = 5)
    private String airlineIATA;

    // Departure information
    @Column(nullable = false)
    private String departureAirport;

    @Column(nullable = false, length = 5)
    private String departureIATA;

    @Column(nullable = false)
    private String departureCity;

    @Column(nullable = false)
    private LocalDate departureDate;

    @Column(nullable = false)
    private LocalTime departureTime;

    // Arrival information
    @Column(nullable = false)
    private String arrivalAirport;

    @Column(nullable = false, length = 5)
    private String arrivalIATA;

    @Column(nullable = false)
    private String arrivalCity;

    @Column(nullable = false)
    private LocalDate arrivalDate;

    @Column(nullable = false)
    private LocalTime arrivalTime;

    // Passenger information
    @Column(nullable = false)
    private String passengerName;

    @Column(nullable = false)
    private String passengerDocument;

    @Column(nullable = false, length = 5)
    private String seatNumber;

    // Ticket details
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketClass ticketClass;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false, length = 3)
    @Builder.Default
    private String currency = "EUR";

    @Column(nullable = false, unique = true, length = 6)
    private String bookingReference;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TicketStatus ticketStatus = TicketStatus.CONFIRMED;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime purchaseDate;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
