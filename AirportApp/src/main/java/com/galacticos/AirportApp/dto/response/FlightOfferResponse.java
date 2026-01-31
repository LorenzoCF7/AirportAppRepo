package com.galacticos.AirportApp.dto.response;

import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlightOfferResponse {

    private List<Map<String, Object>> offers;
    private String origin;
    private String destination;
    private String departureDate;
    private int totalOffers;
    private String source;
}
