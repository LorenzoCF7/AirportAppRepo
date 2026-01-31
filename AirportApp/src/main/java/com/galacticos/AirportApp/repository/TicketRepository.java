package com.galacticos.AirportApp.repository;

import com.galacticos.AirportApp.entity.Ticket;
import com.galacticos.AirportApp.entity.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByOwnerUserIdOrderByPurchaseDateDesc(String ownerUserId);

    List<Ticket> findByOwnerUserIdAndTicketStatusOrderByPurchaseDateDesc(String ownerUserId, TicketStatus status);

    List<Ticket> findByFlightIATAOrderByPurchaseDateDesc(String flightIATA);

    List<Ticket> findByOwnerUserIdAndFlightIATAOrderByPurchaseDateDesc(String ownerUserId, String flightIATA);

    Optional<Ticket> findByBookingReference(String bookingReference);

    boolean existsByBookingReference(String bookingReference);
}
