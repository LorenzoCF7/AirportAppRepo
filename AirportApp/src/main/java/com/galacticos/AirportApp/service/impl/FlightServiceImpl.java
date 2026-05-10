package com.galacticos.AirportApp.service.impl;

import com.galacticos.AirportApp.config.ApiProperties;
import com.galacticos.AirportApp.dto.response.FlightResponse;
import com.galacticos.AirportApp.service.FlightService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class FlightServiceImpl implements FlightService {

    private final RestTemplate restTemplate;
    private final ApiProperties apiProperties;

    // Cache en memoria para vuelos (simula sessionStorage del frontend)
    private final Map<String, CachedFlights> flightCache = new ConcurrentHashMap<>();
    private static final String CACHE_KEY = "flight_tracker_data";

    // Amadeus token cache
    private String amadeusAccessToken;
    private long amadeusTokenExpiry = 0;

    // Lista de aeropuertos europeos principales
    private static final List<String> EUROPEAN_AIRPORTS = Arrays.asList(
            "MAD", "BCN", "AGP", "PMI", "VLC", "SVQ", "BIO", "ALC", "TFS", "LPA",
            "LHR", "LGW", "MAN", "STN", "LTN", "EDI", "BHX", "GLA", "BRS",
            "CDG", "ORY", "NCE", "LYS", "MRS", "TLS", "BOD", "NTE",
            "FRA", "MUC", "TXL", "BER", "DUS", "HAM", "CGN", "STR", "LEJ",
            "FCO", "MXP", "LIN", "VCE", "NAP", "BGY", "CIA", "BLQ", "PSA", "CTA",
            "AMS", "RTM", "EIN", "BRU", "CRL", "ZRH", "GVA", "BSL", "VIE",
            "LIS", "OPO", "FAO", "CPH", "ARN", "OSL", "HEL", "BGO", "GOT",
            "WAW", "PRG", "BUD", "OTP", "SOF", "BEG", "ATH", "SKG", "HER", "RHO",
            "DUB", "ORK", "SNN", "ZAG", "LJU", "RIX", "TLL", "VNO", "KRK", "KTW", "GDN", "BTS"
    );

    @Override
    public FlightResponse getAllFlights(boolean forceRefresh) {
        log.info("Obteniendo vuelos. ForceRefresh: {}", forceRefresh);

        // Verificar cache
        if (!forceRefresh && flightCache.containsKey(CACHE_KEY)) {
            CachedFlights cached = flightCache.get(CACHE_KEY);
            if (!cached.isExpired()) {
                log.info("Retornando {} vuelos desde cache", cached.getFlights().size());
                List<Map<String, Object>> updatedFlights = updateFlightStates(cached.getFlights());
                return buildResponse(updatedFlights, true, "cache");
            }
        }

        // Detectar automáticamente si hay API key de AviationStack
        if (!apiProperties.hasValidAviationstackKey()) {
            log.info("⚠️ No hay API key de AviationStack configurada - Usando datos MOCK");
            List<Map<String, Object>> mockFlights = generateMockFlights();
            cacheFlights(mockFlights);
            return buildResponse(mockFlights, false, "mock-data");
        }

        // Obtener datos reales de AviationStack
        log.info("✅ API key de AviationStack detectada - Obteniendo vuelos reales");
        try {
            List<Map<String, Object>> flights = fetchFromAviationStack();
            cacheFlights(flights);
            return buildResponse(flights, false, "aviationstack-api");
        } catch (Exception e) {
            log.error("Error obteniendo vuelos de AviationStack: {}", e.getMessage());
            // Fallback a mock data
            List<Map<String, Object>> mockFlights = generateMockFlights();
            cacheFlights(mockFlights);
            return buildResponse(mockFlights, false, "mock-fallback");
        }
    }

    @Override
    public FlightResponse searchFlightOffers(String origin, String destination, String departureDate, int adults, String cabinClass) {
        log.info("Buscando ofertas: {} -> {} en {}", origin, destination, departureDate);

        // Detectar automáticamente si hay credenciales de Amadeus
        if (!apiProperties.hasValidAmadeusCredentials()) {
            log.info("⚠️ No hay credenciales de Amadeus configuradas - Usando ofertas MOCK");
            return buildResponse(generateMockOffers(origin, destination, departureDate), false, "mock-offers");
        }

        log.info("✅ Credenciales de Amadeus detectadas - Buscando ofertas reales");
        try {
            String token = getAmadeusAccessToken();
            return fetchFlightOffersFromAmadeus(token, origin, destination, departureDate, adults, cabinClass);
        } catch (Exception e) {
            log.error("Error buscando ofertas en Amadeus: {}", e.getMessage());
            return buildResponse(generateMockOffers(origin, destination, departureDate), false, "mock-fallback");
        }
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> fetchFromAviationStack() {
        List<Map<String, Object>> allFlights = new ArrayList<>();
        List<String> selectedHubs = selectRandomAirports(12);

        log.info("Consultando vuelos desde: {}", selectedHubs);

        for (String hub : selectedHubs) {
            if (allFlights.size() >= 80) break;

            try {
                String url = String.format("%s/flights?access_key=%s&dep_iata=%s&limit=20",
                        apiProperties.getAviationstack().getBaseUrl(),
                        apiProperties.getAviationstack().getApiKey(),
                        hub);

                ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);

                if (response.getBody() != null && response.getBody().containsKey("data")) {
                    List<Map<String, Object>> flights = (List<Map<String, Object>>) response.getBody().get("data");

                    // Filtrar vuelos europeos
                    flights.stream()
                            .filter(this::isValidEuropeanFlight)
                            .forEach(allFlights::add);

                    log.info("Obtenidos {} vuelos desde {}", flights.size(), hub);
                }
            } catch (Exception e) {
                log.warn("Error consultando {}: {}", hub, e.getMessage());
            }
        }

        return adaptFlightsToFuture(allFlights.stream().limit(80).toList());
    }

    private String getAmadeusAccessToken() {
        if (amadeusAccessToken != null && System.currentTimeMillis() < amadeusTokenExpiry) {
            return amadeusAccessToken;
        }

        log.info("Obteniendo token de Amadeus...");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "client_credentials");
        body.add("client_id", apiProperties.getAmadeus().getClientId());
        body.add("client_secret", apiProperties.getAmadeus().getClientSecret());

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(
                apiProperties.getAmadeus().getAuthUrl(),
                request,
                Map.class
        );

        if (response.getBody() != null) {
            amadeusAccessToken = (String) response.getBody().get("access_token");
            int expiresIn = (Integer) response.getBody().get("expires_in");
            amadeusTokenExpiry = System.currentTimeMillis() + (expiresIn - 300) * 1000L;
            log.info("Token de Amadeus obtenido");
        }

        return amadeusAccessToken;
    }

    @SuppressWarnings("unchecked")
    private FlightResponse fetchFlightOffersFromAmadeus(String token, String origin, String destination,
                                                         String departureDate, int adults, String cabinClass) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        String url = String.format("%s/shopping/flight-offers?originLocationCode=%s&destinationLocationCode=%s" +
                        "&departureDate=%s&adults=%d&travelClass=%s&max=10",
                apiProperties.getAmadeus().getBaseUrl(),
                origin, destination, departureDate, adults, cabinClass.toUpperCase());

        HttpEntity<?> request = new HttpEntity<>(headers);
        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, request, Map.class);

        if (response.getBody() != null && response.getBody().containsKey("data")) {
            List<Map<String, Object>> offers = (List<Map<String, Object>>) response.getBody().get("data");
            return buildResponse(offers, false, "amadeus-api");
        }

        return buildResponse(Collections.emptyList(), false, "amadeus-empty");
    }

    private List<Map<String, Object>> generateMockFlights() {
        List<Map<String, Object>> flights = new ArrayList<>();

        // Pair index: each "pair" = {outbound, reverse}
        // Outbound flights go on days +1 to +3; reverse (return) flights go on days +4 to +6
        // This guarantees valid round-trips are always available: pick outbound day 1-3, return day 4-6
        String[][] outboundRoutes = {
                {"MAD", "BCN", "Madrid-Barajas",    "Barcelona-El Prat",  "Iberia",           "IB"},
                {"MAD", "LHR", "Madrid-Barajas",    "London Heathrow",    "Iberia",           "IB"},
                {"MAD", "CDG", "Madrid-Barajas",    "Paris CDG",          "Iberia",           "IB"},
                {"MAD", "FRA", "Madrid-Barajas",    "Frankfurt",          "Iberia",           "IB"},
                {"MAD", "FCO", "Madrid-Barajas",    "Rome Fiumicino",     "Iberia",           "IB"},
                {"MAD", "AMS", "Madrid-Barajas",    "Amsterdam Schiphol", "Vueling",          "VY"},
                {"MAD", "LIS", "Madrid-Barajas",    "Lisbon",             "Iberia Express",   "I2"},
                {"BCN", "LHR", "Barcelona-El Prat", "London Heathrow",    "British Airways",  "BA"},
                {"BCN", "CDG", "Barcelona-El Prat", "Paris CDG",          "Air France",       "AF"},
                {"BCN", "FRA", "Barcelona-El Prat", "Frankfurt",          "Vueling",          "VY"},
                {"BCN", "AMS", "Barcelona-El Prat", "Amsterdam Schiphol", "KLM",              "KL"},
                {"BCN", "FCO", "Barcelona-El Prat", "Rome Fiumicino",     "Vueling",          "VY"},
                {"BCN", "LIS", "Barcelona-El Prat", "Lisbon",             "Vueling",          "VY"},
                {"SVQ", "CDG", "Sevilla",           "Paris CDG",          "Vueling",          "VY"},
                {"SVQ", "LHR", "Sevilla",           "London Heathrow",    "Ryanair",          "FR"},
                {"SVQ", "MAD", "Sevilla",           "Madrid-Barajas",     "Iberia Express",   "I2"},
                {"VLC", "CDG", "Valencia",          "Paris CDG",          "Air France",       "AF"},
                {"VLC", "LHR", "Valencia",          "London Heathrow",    "Ryanair",          "FR"},
                {"AGP", "LHR", "Málaga",            "London Heathrow",    "British Airways",  "BA"},
                {"PMI", "FRA", "Palma de Mallorca", "Frankfurt",          "Lufthansa",        "LH"},
                {"TFS", "MAD", "Tenerife Sur",      "Madrid-Barajas",     "Iberia",           "IB"},
                {"LPA", "MAD", "Gran Canaria",      "Madrid-Barajas",     "Iberia",           "IB"},
                {"LHR", "CDG", "London Heathrow",   "Paris CDG",          "British Airways",  "BA"},
                {"LHR", "AMS", "London Heathrow",   "Amsterdam Schiphol", "British Airways",  "BA"},
                {"LHR", "FCO", "London Heathrow",   "Rome Fiumicino",     "British Airways",  "BA"},
                {"CDG", "FCO", "Paris CDG",         "Rome Fiumicino",     "Air France",       "AF"},
                {"CDG", "AMS", "Paris CDG",         "Amsterdam Schiphol", "Air France",       "AF"},
                {"FRA", "AMS", "Frankfurt",         "Amsterdam Schiphol", "Lufthansa",        "LH"},
                {"MUC", "ZRH", "Munich",            "Zurich",             "Lufthansa",        "LH"},
                {"VIE", "PRG", "Vienna",            "Prague",             "Austrian",         "OS"},
                {"CPH", "ARN", "Copenhagen",        "Stockholm Arlanda",  "SAS",              "SK"},
                {"DUB", "LHR", "Dublin",            "London Heathrow",    "Aer Lingus",       "EI"},
                {"ATH", "FCO", "Athens",            "Rome Fiumicino",     "Aegean",           "A3"},
                {"WAW", "BER", "Warsaw",            "Berlin Brandenburg", "LOT",              "LO"},
                {"LIS", "CDG", "Lisbon",            "Paris CDG",          "TAP Portugal",     "TP"},
        };

        // Each outbound route has a matching reverse (return) route
        String[][] returnRoutes = {
                {"BCN", "MAD", "Barcelona-El Prat", "Madrid-Barajas",     "Vueling",          "VY"},
                {"LHR", "MAD", "London Heathrow",   "Madrid-Barajas",     "British Airways",  "BA"},
                {"CDG", "MAD", "Paris CDG",         "Madrid-Barajas",     "Air France",       "AF"},
                {"FRA", "MAD", "Frankfurt",         "Madrid-Barajas",     "Lufthansa",        "LH"},
                {"FCO", "MAD", "Rome Fiumicino",    "Madrid-Barajas",     "ITA Airways",      "AZ"},
                {"AMS", "MAD", "Amsterdam Schiphol","Madrid-Barajas",     "KLM",              "KL"},
                {"LIS", "MAD", "Lisbon",            "Madrid-Barajas",     "TAP Portugal",     "TP"},
                {"LHR", "BCN", "London Heathrow",   "Barcelona-El Prat",  "British Airways",  "BA"},
                {"CDG", "BCN", "Paris CDG",         "Barcelona-El Prat",  "Air France",       "AF"},
                {"FRA", "BCN", "Frankfurt",         "Barcelona-El Prat",  "Lufthansa",        "LH"},
                {"AMS", "BCN", "Amsterdam Schiphol","Barcelona-El Prat",  "KLM",              "KL"},
                {"FCO", "BCN", "Rome Fiumicino",    "Barcelona-El Prat",  "ITA Airways",      "AZ"},
                {"LIS", "BCN", "Lisbon",            "Barcelona-El Prat",  "TAP Portugal",     "TP"},
                {"CDG", "SVQ", "Paris CDG",         "Sevilla",            "Air France",       "AF"},
                {"LHR", "SVQ", "London Heathrow",   "Sevilla",            "British Airways",  "BA"},
                {"MAD", "SVQ", "Madrid-Barajas",    "Sevilla",            "Iberia",           "IB"},
                {"CDG", "VLC", "Paris CDG",         "Valencia",           "Air France",       "AF"},
                {"LHR", "VLC", "London Heathrow",   "Valencia",           "Ryanair",          "FR"},
                {"LHR", "AGP", "London Heathrow",   "Málaga",             "British Airways",  "BA"},
                {"FRA", "PMI", "Frankfurt",         "Palma de Mallorca",  "Lufthansa",        "LH"},
                {"MAD", "TFS", "Madrid-Barajas",    "Tenerife Sur",       "Iberia",           "IB"},
                {"MAD", "LPA", "Madrid-Barajas",    "Gran Canaria",       "Iberia",           "IB"},
                {"CDG", "LHR", "Paris CDG",         "London Heathrow",    "Air France",       "AF"},
                {"AMS", "LHR", "Amsterdam Schiphol","London Heathrow",    "KLM",              "KL"},
                {"FCO", "LHR", "Rome Fiumicino",    "London Heathrow",    "ITA Airways",      "AZ"},
                {"FCO", "CDG", "Rome Fiumicino",    "Paris CDG",          "ITA Airways",      "AZ"},
                {"AMS", "CDG", "Amsterdam Schiphol","Paris CDG",          "KLM",              "KL"},
                {"AMS", "FRA", "Amsterdam Schiphol","Frankfurt",          "KLM",              "KL"},
                {"ZRH", "MUC", "Zurich",            "Munich",             "Swiss",            "LX"},
                {"PRG", "VIE", "Prague",            "Vienna",             "Czech Airlines",   "OK"},
                {"ARN", "CPH", "Stockholm Arlanda", "Copenhagen",         "SAS",              "SK"},
                {"LHR", "DUB", "London Heathrow",   "Dublin",             "British Airways",  "BA"},
                {"FCO", "ATH", "Rome Fiumicino",    "Athens",             "ITA Airways",      "AZ"},
                {"BER", "WAW", "Berlin Brandenburg","Warsaw",             "Lufthansa",        "LH"},
                {"CDG", "LIS", "Paris CDG",         "Lisbon",             "Air France",       "AF"},
        };

        // Time slots for departures spread across the day
        int[] depHours   = {6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 7, 9, 11, 13};
        int[] depMinutes = {0, 30, 15, 45, 0, 20, 0, 35, 10, 0,  25, 5,  30, 0,  15, 45, 0, 0,  30, 0};

        LocalDate today = LocalDate.now();

        // Generate outbound flights on days +1 and +2
        for (int i = 0; i < outboundRoutes.length; i++) {
            String[] route = outboundRoutes[i];
            int dayOffset     = 1 + (i % 2);          // days +1 or +2
            int slot          = i % depHours.length;
            int durationHours = 1 + (i % 4);
            int durationMins  = (i % 2 == 0) ? 0 : 30;

            LocalDate flightDate = today.plusDays(dayOffset);
            LocalTime depTime    = LocalTime.of(depHours[slot], depMinutes[slot]);
            LocalTime arrTime    = depTime.plusHours(durationHours).plusMinutes(durationMins);

            String flightNum = route[5] + (1000 + i * 11);
            flights.add(buildMockFlight(route, flightDate, depTime, arrTime, flightNum, i));
        }

        // Generate return flights on days +4 and +5
        for (int i = 0; i < returnRoutes.length; i++) {
            String[] route = returnRoutes[i];
            int dayOffset     = 4 + (i % 2);          // days +4 or +5
            int slot          = (i + 5) % depHours.length;
            int durationHours = 1 + (i % 4);
            int durationMins  = (i % 2 == 0) ? 0 : 30;

            LocalDate flightDate = today.plusDays(dayOffset);
            LocalTime depTime    = LocalTime.of(depHours[slot], depMinutes[slot]);
            LocalTime arrTime    = depTime.plusHours(durationHours).plusMinutes(durationMins);

            String flightNum = route[5] + (2000 + i * 11);
            int idx = outboundRoutes.length + i;
            flights.add(buildMockFlight(route, flightDate, depTime, arrTime, flightNum, idx));
        }

        return flights;
    }

    private Map<String, Object> buildMockFlight(String[] route, LocalDate date, LocalTime depTime,
                                                 LocalTime arrTime, String flightNum, int idx) {
        Map<String, Object> flight = new LinkedHashMap<>();
        flight.put("flight_date",   date.toString());
        flight.put("flight_status", "scheduled");

        Map<String, Object> flightInfo = new LinkedHashMap<>();
        flightInfo.put("number", flightNum.replaceAll("[^0-9]", ""));
        flightInfo.put("iata",   flightNum);
        flight.put("flight", flightInfo);

        Map<String, Object> airline = new LinkedHashMap<>();
        airline.put("name", route[4]);
        airline.put("iata", route[5]);
        flight.put("airline", airline);

        Map<String, Object> departure = new LinkedHashMap<>();
        departure.put("airport",   route[2]);
        departure.put("iata",      route[0]);
        departure.put("scheduled", date + "T" + depTime.withSecond(0).withNano(0) + ":00");
        flight.put("departure", departure);

        Map<String, Object> arrival = new LinkedHashMap<>();
        arrival.put("airport",   route[3]);
        arrival.put("iata",      route[1]);
        arrival.put("scheduled", date + "T" + arrTime.withSecond(0).withNano(0) + ":00");
        flight.put("arrival", arrival);

        return flight;
    }

    private List<Map<String, Object>> generateMockOffers(String origin, String destination, String departureDate) {
        List<Map<String, Object>> offers = new ArrayList<>();
        Random random = new Random();

        String[] airlines = {"Iberia", "Vueling", "Ryanair", "Air Europa", "Lufthansa"};
        String[] airlineCodes = {"IB", "VY", "FR", "UX", "LH"};

        for (int i = 0; i < 5; i++) {
            Map<String, Object> offer = new LinkedHashMap<>();
            offer.put("id", String.valueOf(i + 1));

            Map<String, Object> price = new LinkedHashMap<>();
            price.put("total", String.format("%.2f", 50 + random.nextDouble() * 200));
            price.put("currency", "EUR");
            offer.put("price", price);

            List<Map<String, Object>> itineraries = new ArrayList<>();
            Map<String, Object> itinerary = new LinkedHashMap<>();

            List<Map<String, Object>> segments = new ArrayList<>();
            Map<String, Object> segment = new LinkedHashMap<>();

            Map<String, Object> dep = new LinkedHashMap<>();
            dep.put("iataCode", origin);
            dep.put("at", departureDate + "T" + String.format("%02d:%02d:00", 6 + i * 2, random.nextInt(60)));
            segment.put("departure", dep);

            Map<String, Object> arr = new LinkedHashMap<>();
            arr.put("iataCode", destination);
            arr.put("at", departureDate + "T" + String.format("%02d:%02d:00", 8 + i * 2 + random.nextInt(2), random.nextInt(60)));
            segment.put("arrival", arr);

            Map<String, Object> carrier = new LinkedHashMap<>();
            carrier.put("carrierCode", airlineCodes[i]);
            carrier.put("carrierName", airlines[i]);
            segment.put("operating", carrier);
            segment.put("number", String.valueOf(1000 + random.nextInt(9000)));

            segments.add(segment);
            itinerary.put("segments", segments);
            itineraries.add(itinerary);

            offer.put("itineraries", itineraries);
            offers.add(offer);
        }

        return offers;
    }

    private List<String> selectRandomAirports(int count) {
        List<String> shuffled = new ArrayList<>(EUROPEAN_AIRPORTS);
        Collections.shuffle(shuffled);
        return shuffled.subList(0, Math.min(count, shuffled.size()));
    }

    @SuppressWarnings("unchecked")
    private boolean isValidEuropeanFlight(Map<String, Object> flight) {
        try {
            Map<String, Object> departure = (Map<String, Object>) flight.get("departure");
            Map<String, Object> arrival = (Map<String, Object>) flight.get("arrival");
            Map<String, Object> flightInfo = (Map<String, Object>) flight.get("flight");

            return departure != null && arrival != null && flightInfo != null
                    && departure.get("iata") != null && arrival.get("iata") != null
                    && EUROPEAN_AIRPORTS.contains(arrival.get("iata").toString().toUpperCase());
        } catch (Exception e) {
            return false;
        }
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> adaptFlightsToFuture(List<Map<String, Object>> flights) {
        LocalDateTime now = LocalDateTime.now();
        List<Map<String, Object>> result = new ArrayList<>();

        for (int i = 0; i < flights.size(); i++) {
            Map<String, Object> flight = flights.get(i);
            try {
                Map<String, Object> rawDep = (Map<String, Object>) flight.get("departure");
                Map<String, Object> rawArr = (Map<String, Object>) flight.get("arrival");

                if (rawDep == null || rawArr == null) { result.add(flight); continue; }

                String depScheduled = (String) rawDep.get("scheduled");
                String arrScheduled = (String) rawArr.get("scheduled");

                if (depScheduled == null || arrScheduled == null) { result.add(flight); continue; }

                LocalDateTime depDt = LocalDateTime.parse(depScheduled.substring(0, 19));
                LocalDateTime arrDt = LocalDateTime.parse(arrScheduled.substring(0, 19));
                long durationMins = Math.max(Duration.between(depDt, arrDt).toMinutes(), 60);

                // Spread flights across next 7 days so the shop always has variety
                int dayOffset = i % 7;
                LocalDateTime newDep = LocalDateTime.of(LocalDate.now().plusDays(dayOffset), depDt.toLocalTime());
                // If the slot has already passed today or tomorrow, push one more day
                if (newDep.isBefore(now.plusHours(2))) {
                    newDep = newDep.plusDays(1);
                }
                LocalDateTime newArr = newDep.plusMinutes(durationMins);

                Map<String, Object> newDepMap = new LinkedHashMap<>(rawDep);
                Map<String, Object> newArrMap = new LinkedHashMap<>(rawArr);
                newDepMap.put("scheduled", newDep.toString());
                newArrMap.put("scheduled", newArr.toString());

                Map<String, Object> adapted = new LinkedHashMap<>(flight);
                adapted.put("departure", newDepMap);
                adapted.put("arrival", newArrMap);
                adapted.put("flight_date", newDep.toLocalDate().toString());
                result.add(adapted);
            } catch (Exception e) {
                log.warn("Error adaptando fechas del vuelo: {}", e.getMessage());
                result.add(flight);
            }
        }
        return result;
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> updateFlightStates(List<Map<String, Object>> flights) {
        LocalDateTime now = LocalDateTime.now();

        return flights.stream()
                .map(flight -> {
                    Map<String, Object> updated = new LinkedHashMap<>(flight);
                    try {
                        Map<String, Object> departure = (Map<String, Object>) flight.get("departure");
                        Map<String, Object> arrival = (Map<String, Object>) flight.get("arrival");

                        if (departure != null && arrival != null) {
                            String depScheduled = (String) departure.get("scheduled");
                            String arrScheduled = (String) arrival.get("scheduled");

                            if (depScheduled != null && arrScheduled != null) {
                                LocalDateTime depTime = LocalDateTime.parse(depScheduled.substring(0, 19));
                                LocalDateTime arrTime = LocalDateTime.parse(arrScheduled.substring(0, 19));

                                if (now.isBefore(depTime)) {
                                    updated.put("flight_status", "scheduled");
                                } else if (now.isAfter(arrTime)) {
                                    updated.put("flight_status", "landed");
                                } else {
                                    updated.put("flight_status", "active");
                                }
                            }
                        }
                    } catch (Exception e) {
                        log.warn("Error actualizando estado de vuelo: {}", e.getMessage());
                    }
                    return updated;
                })
                .toList();
    }

    private void cacheFlights(List<Map<String, Object>> flights) {
        flightCache.put(CACHE_KEY, new CachedFlights(flights));
    }

    private FlightResponse buildResponse(List<Map<String, Object>> data, boolean fromStorage, String source) {
        return FlightResponse.builder()
                .data(data)
                .pagination(FlightResponse.Pagination.builder()
                        .limit(data.size())
                        .offset(0)
                        .count(data.size())
                        .total(data.size())
                        .build())
                .fromStorage(fromStorage)
                .source(source)
                .build();
    }

    // Clase interna para cache
    private static class CachedFlights {
        private final List<Map<String, Object>> flights;
        private final long timestamp;
        private static final long CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutos

        public CachedFlights(List<Map<String, Object>> flights) {
            this.flights = flights;
            this.timestamp = System.currentTimeMillis();
        }

        public List<Map<String, Object>> getFlights() {
            return flights;
        }

        public boolean isExpired() {
            return System.currentTimeMillis() - timestamp > CACHE_DURATION_MS;
        }
    }
}
