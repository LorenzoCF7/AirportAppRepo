package com.galacticos.AirportApp.service;

import com.galacticos.AirportApp.dto.request.CreateTicketRequest;
import com.galacticos.AirportApp.dto.request.UpdateTicketRequest;
import com.galacticos.AirportApp.dto.response.TicketResponse;

import java.util.List;

public interface TicketService {

    TicketResponse createTicket(CreateTicketRequest request);

    TicketResponse getTicketById(Long id);

    TicketResponse getTicketByBookingReference(String bookingReference);

    List<TicketResponse> getTicketsByUser(String ownerUserId);

    List<TicketResponse> getTicketsByUserAndStatus(String ownerUserId, String status);

    List<TicketResponse> getTicketsByFlight(String flightIATA);

    List<TicketResponse> getTicketsByUserAndFlight(String ownerUserId, String flightIATA);

    TicketResponse updateTicket(Long id, UpdateTicketRequest request);

    TicketResponse cancelTicket(Long id);

    void deleteTicket(Long id);
}
