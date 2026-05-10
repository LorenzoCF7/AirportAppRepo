package com.galacticos.AirportApp.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiResponse {
    private String message;
    private List<FlightRecommendation> recommendations;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FlightRecommendation {
        private String origin;
        private String destination;
        private String originCity;
        private String destinationCity;
        private String reason;
    }
}
