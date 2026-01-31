package com.galacticos.AirportApp.dto.response;

import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlightResponse {

    private List<Map<String, Object>> data;
    private Pagination pagination;
    private String source;
    private boolean fromStorage;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Pagination {
        private int limit;
        private int offset;
        private int count;
        private int total;
    }
}
