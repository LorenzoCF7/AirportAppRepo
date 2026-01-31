package com.galacticos.AirportApp.service;

import com.galacticos.AirportApp.dto.response.FlightResponse;

public interface FlightService {

    FlightResponse getAllFlights(boolean forceRefresh);

    FlightResponse searchFlightOffers(String origin, String destination, String departureDate, int adults, String cabinClass);
}
