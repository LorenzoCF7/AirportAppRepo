package com.galacticos.AirportApp.dto.request;

import com.galacticos.AirportApp.entity.TicketStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateTicketRequest {

    private String seatNumber;
    
    private TicketStatus ticketStatus;
}
