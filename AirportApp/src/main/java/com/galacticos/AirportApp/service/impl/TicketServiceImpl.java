package com.galacticos.AirportApp.service.impl;

import com.galacticos.AirportApp.dto.request.CreateTicketRequest;
import com.galacticos.AirportApp.dto.request.UpdateTicketRequest;
import com.galacticos.AirportApp.dto.response.TicketResponse;
import com.galacticos.AirportApp.entity.Ticket;
import com.galacticos.AirportApp.entity.TicketStatus;
import com.galacticos.AirportApp.exception.ResourceNotFoundException;
import com.galacticos.AirportApp.repository.TicketRepository;
import com.galacticos.AirportApp.service.TicketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private static final String BOOKING_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final SecureRandom random = new SecureRandom();

    @Override
    public TicketResponse createTicket(CreateTicketRequest request) {
        log.info("Creando ticket para vuelo: {}", request.getFlightIATA());

        Ticket ticket = Ticket.builder()
                .ownerUserId(request.getOwnerUserId())
                .flightNumber(request.getFlightNumber())
                .flightIATA(request.getFlightIATA())
                .airlineName(request.getAirlineName())
                .airlineIATA(request.getAirlineIATA())
                .departureAirport(request.getDepartureAirport())
                .departureIATA(request.getDepartureIATA())
                .departureCity(request.getDepartureCity())
                .departureDate(LocalDate.parse(request.getDepartureDate()))
                .departureTime(LocalTime.parse(request.getDepartureTime()))
                .arrivalAirport(request.getArrivalAirport())
                .arrivalIATA(request.getArrivalIATA())
                .arrivalCity(request.getArrivalCity())
                .arrivalDate(LocalDate.parse(request.getArrivalDate()))
                .arrivalTime(LocalTime.parse(request.getArrivalTime()))
                .passengerName(request.getPassengerName())
                .passengerDocument(request.getPassengerDocument())
                .seatNumber(request.getSeatNumber())
                .ticketClass(request.getTicketClass())
                .price(request.getPrice())
                .currency(request.getCurrency() != null ? request.getCurrency() : "EUR")
                .bookingReference(generateUniqueBookingReference())
                .ticketStatus(TicketStatus.CONFIRMED)
                .build();

        Ticket savedTicket = ticketRepository.save(ticket);
        log.info("Ticket creado con referencia: {}", savedTicket.getBookingReference());

        return TicketResponse.fromEntity(savedTicket);
    }

    @Override
    @Transactional(readOnly = true)
    public TicketResponse getTicketById(Long id) {
        Ticket ticket = findTicketById(id);
        return TicketResponse.fromEntity(ticket);
    }

    @Override
    @Transactional(readOnly = true)
    public TicketResponse getTicketByBookingReference(String bookingReference) {
        Ticket ticket = ticketRepository.findByBookingReference(bookingReference)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket no encontrado con referencia: " + bookingReference));
        return TicketResponse.fromEntity(ticket);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> getTicketsByUser(String ownerUserId) {
        log.info("Obteniendo tickets del usuario: {}", ownerUserId);
        return ticketRepository.findByOwnerUserIdOrderByPurchaseDateDesc(ownerUserId)
                .stream()
                .map(TicketResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> getTicketsByUserAndStatus(String ownerUserId, String status) {
        TicketStatus ticketStatus = TicketStatus.valueOf(status.toUpperCase());
        return ticketRepository.findByOwnerUserIdAndTicketStatusOrderByPurchaseDateDesc(ownerUserId, ticketStatus)
                .stream()
                .map(TicketResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> getTicketsByFlight(String flightIATA) {
        return ticketRepository.findByFlightIATAOrderByPurchaseDateDesc(flightIATA)
                .stream()
                .map(TicketResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> getTicketsByUserAndFlight(String ownerUserId, String flightIATA) {
        return ticketRepository.findByOwnerUserIdAndFlightIATAOrderByPurchaseDateDesc(ownerUserId, flightIATA)
                .stream()
                .map(TicketResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public TicketResponse updateTicket(Long id, UpdateTicketRequest request) {
        log.info("Actualizando ticket con ID: {}", id);
        Ticket ticket = findTicketById(id);

        if (request.getSeatNumber() != null) {
            ticket.setSeatNumber(request.getSeatNumber());
        }
        if (request.getTicketStatus() != null) {
            ticket.setTicketStatus(request.getTicketStatus());
        }

        Ticket updatedTicket = ticketRepository.save(ticket);
        log.info("Ticket actualizado: {}", updatedTicket.getBookingReference());

        return TicketResponse.fromEntity(updatedTicket);
    }

    @Override
    public TicketResponse cancelTicket(Long id) {
        log.info("Cancelando ticket con ID: {}", id);
        Ticket ticket = findTicketById(id);
        ticket.setTicketStatus(TicketStatus.CANCELLED);
        
        Ticket cancelledTicket = ticketRepository.save(ticket);
        log.info("Ticket cancelado: {}", cancelledTicket.getBookingReference());

        return TicketResponse.fromEntity(cancelledTicket);
    }

    @Override
    public void deleteTicket(Long id) {
        log.info("Eliminando ticket con ID: {}", id);
        Ticket ticket = findTicketById(id);
        ticketRepository.delete(ticket);
        log.info("Ticket eliminado: {}", ticket.getBookingReference());
    }

    private Ticket findTicketById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket no encontrado con ID: " + id));
    }

    private String generateUniqueBookingReference() {
        String reference;
        do {
            reference = generateBookingReference();
        } while (ticketRepository.existsByBookingReference(reference));
        return reference;
    }

    private String generateBookingReference() {
        StringBuilder sb = new StringBuilder(6);
        for (int i = 0; i < 6; i++) {
            sb.append(BOOKING_CHARS.charAt(random.nextInt(BOOKING_CHARS.length())));
        }
        return sb.toString();
    }
}
