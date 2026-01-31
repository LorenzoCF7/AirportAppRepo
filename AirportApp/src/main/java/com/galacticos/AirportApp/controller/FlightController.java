package com.galacticos.AirportApp.controller;

import com.galacticos.AirportApp.dto.response.ApiResponse;
import com.galacticos.AirportApp.dto.response.FlightResponse;
import com.galacticos.AirportApp.service.FlightService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/flights")
@RequiredArgsConstructor
@Slf4j
public class FlightController {

    private final FlightService flightService;

    @GetMapping
    public ResponseEntity<ApiResponse<FlightResponse>> getAllFlights(
            @RequestParam(defaultValue = "false") boolean forceRefresh) {
        log.info("GET /api/flights - Obtener todos los vuelos. ForceRefresh: {}", forceRefresh);
        FlightResponse flights = flightService.getAllFlights(forceRefresh);
        return ResponseEntity.ok(ApiResponse.success(flights));
    }

    @GetMapping("/refresh")
    public ResponseEntity<ApiResponse<FlightResponse>> refreshFlights() {
        log.info("GET /api/flights/refresh - Forzar actualización de vuelos");
        FlightResponse flights = flightService.getAllFlights(true);
        return ResponseEntity.ok(ApiResponse.success("Vuelos actualizados", flights));
    }

    @GetMapping("/offers")
    public ResponseEntity<ApiResponse<FlightResponse>> searchFlightOffers(
            @RequestParam String origin,
            @RequestParam String destination,
            @RequestParam String departureDate,
            @RequestParam(defaultValue = "1") int adults,
            @RequestParam(defaultValue = "ECONOMY") String cabinClass) {
        log.info("GET /api/flights/offers - Buscar ofertas: {} -> {} en {}", origin, destination, departureDate);
        FlightResponse offers = flightService.searchFlightOffers(origin, destination, departureDate, adults, cabinClass);
        return ResponseEntity.ok(ApiResponse.success(offers));
    }
}
