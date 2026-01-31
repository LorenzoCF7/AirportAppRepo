package com.galacticos.AirportApp.dto.response;

import com.galacticos.AirportApp.entity.Ticket;
import lombok.*;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketResponse {

    private Long id;
    private String ownerUserId;
    
    // Flight information
    private String flightNumber;
    private String flightIATA;
    private String airlineName;
    private String airlineIATA;
    
    // Departure information
    private String departureAirport;
    private String departureIATA;
    private String departureCity;
    private String departureDate;
    private String departureTime;
    
    // Arrival information
    private String arrivalAirport;
    private String arrivalIATA;
    private String arrivalCity;
    private String arrivalDate;
    private String arrivalTime;
    
    // Passenger information
    private String passengerName;
    private String passengerDocument;
    private String seatNumber;
    
    // Ticket details
    private String ticketClass;
    private BigDecimal price;
    private String currency;
    private String bookingReference;
    private String ticketStatus;
    private String purchaseDate;

    public static TicketResponse fromEntity(Ticket ticket) {
        return TicketResponse.builder()
                .id(ticket.getId())
                .ownerUserId(ticket.getOwnerUserId())
                .flightNumber(ticket.getFlightNumber())
                .flightIATA(ticket.getFlightIATA())
                .airlineName(ticket.getAirlineName())
                .airlineIATA(ticket.getAirlineIATA())
                .departureAirport(ticket.getDepartureAirport())
                .departureIATA(ticket.getDepartureIATA())
                .departureCity(ticket.getDepartureCity())
                .departureDate(ticket.getDepartureDate().toString())
                .departureTime(ticket.getDepartureTime().format(DateTimeFormatter.ofPattern("HH:mm")))
                .arrivalAirport(ticket.getArrivalAirport())
                .arrivalIATA(ticket.getArrivalIATA())
                .arrivalCity(ticket.getArrivalCity())
                .arrivalDate(ticket.getArrivalDate().toString())
                .arrivalTime(ticket.getArrivalTime().format(DateTimeFormatter.ofPattern("HH:mm")))
                .passengerName(ticket.getPassengerName())
                .passengerDocument(ticket.getPassengerDocument())
                .seatNumber(ticket.getSeatNumber())
                .ticketClass(ticket.getTicketClass().name().toLowerCase())
                .price(ticket.getPrice())
                .currency(ticket.getCurrency())
                .bookingReference(ticket.getBookingReference())
                .ticketStatus(ticket.getTicketStatus().name().toLowerCase())
                .purchaseDate(ticket.getPurchaseDate().toString())
                .build();
    }
}
