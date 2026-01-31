package com.galacticos.AirportApp.controller;

import com.galacticos.AirportApp.dto.request.CreateTicketRequest;
import com.galacticos.AirportApp.dto.request.UpdateTicketRequest;
import com.galacticos.AirportApp.dto.response.ApiResponse;
import com.galacticos.AirportApp.dto.response.TicketResponse;
import com.galacticos.AirportApp.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@Slf4j
public class TicketController {

    private final TicketService ticketService;

    @PostMapping
    public ResponseEntity<ApiResponse<TicketResponse>> createTicket(
            @Valid @RequestBody CreateTicketRequest request) {
        log.info("POST /api/tickets - Crear ticket para vuelo: {}", request.getFlightIATA());
        TicketResponse ticket = ticketService.createTicket(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Ticket creado exitosamente", ticket));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketResponse>> getTicketById(@PathVariable Long id) {
        log.info("GET /api/tickets/{} - Obtener ticket por ID", id);
        TicketResponse ticket = ticketService.getTicketById(id);
        return ResponseEntity.ok(ApiResponse.success(ticket));
    }

    @GetMapping("/reference/{bookingReference}")
    public ResponseEntity<ApiResponse<TicketResponse>> getTicketByReference(
            @PathVariable String bookingReference) {
        log.info("GET /api/tickets/reference/{} - Obtener ticket por referencia", bookingReference);
        TicketResponse ticket = ticketService.getTicketByBookingReference(bookingReference);
        return ResponseEntity.ok(ApiResponse.success(ticket));
    }

    @GetMapping("/user/{ownerUserId}")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getTicketsByUser(
            @PathVariable String ownerUserId,
            @RequestParam(required = false) String status) {
        log.info("GET /api/tickets/user/{} - Obtener tickets del usuario", ownerUserId);
        
        List<TicketResponse> tickets;
        if (status != null && !status.isEmpty()) {
            tickets = ticketService.getTicketsByUserAndStatus(ownerUserId, status);
        } else {
            tickets = ticketService.getTicketsByUser(ownerUserId);
        }
        
        return ResponseEntity.ok(ApiResponse.success(tickets));
    }

    @GetMapping("/flight/{flightIATA}")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getTicketsByFlight(
            @PathVariable String flightIATA) {
        log.info("GET /api/tickets/flight/{} - Obtener tickets por vuelo", flightIATA);
        List<TicketResponse> tickets = ticketService.getTicketsByFlight(flightIATA);
        return ResponseEntity.ok(ApiResponse.success(tickets));
    }

    @GetMapping("/user/{ownerUserId}/flight/{flightIATA}")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getTicketsByUserAndFlight(
            @PathVariable String ownerUserId,
            @PathVariable String flightIATA) {
        log.info("GET /api/tickets/user/{}/flight/{} - Obtener tickets del usuario por vuelo", ownerUserId, flightIATA);
        List<TicketResponse> tickets = ticketService.getTicketsByUserAndFlight(ownerUserId, flightIATA);
        return ResponseEntity.ok(ApiResponse.success(tickets));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketResponse>> updateTicket(
            @PathVariable Long id,
            @RequestBody UpdateTicketRequest request) {
        log.info("PATCH /api/tickets/{} - Actualizar ticket", id);
        TicketResponse ticket = ticketService.updateTicket(id, request);
        return ResponseEntity.ok(ApiResponse.success("Ticket actualizado exitosamente", ticket));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<TicketResponse>> cancelTicket(@PathVariable Long id) {
        log.info("PATCH /api/tickets/{}/cancel - Cancelar ticket", id);
        TicketResponse ticket = ticketService.cancelTicket(id);
        return ResponseEntity.ok(ApiResponse.success("Ticket cancelado exitosamente", ticket));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTicket(@PathVariable Long id) {
        log.info("DELETE /api/tickets/{} - Eliminar ticket", id);
        ticketService.deleteTicket(id);
        return ResponseEntity.ok(ApiResponse.success("Ticket eliminado exitosamente", null));
    }
}
