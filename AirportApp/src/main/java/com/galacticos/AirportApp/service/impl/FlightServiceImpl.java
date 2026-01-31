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
        List<String> selectedHubs = selectRandomAirports(7);

        log.info("Consultando vuelos desde: {}", selectedHubs);

        for (String hub : selectedHubs) {
            if (allFlights.size() >= 40) break;

            try {
                String url = String.format("%s/flights?access_key=%s&dep_iata=%s&limit=15",
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

        // Adaptar vuelos para hoy
        return adaptFlightsToToday(allFlights.stream().limit(20).toList());
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

        String[][] routes = {
                {"MAD", "BCN", "Madrid-Barajas", "Barcelona-El Prat", "Iberia", "IB"},
                {"LHR", "CDG", "London Heathrow", "Paris CDG", "British Airways", "BA"},
                {"FRA", "AMS", "Frankfurt", "Amsterdam Schiphol", "Lufthansa", "LH"},
                {"FCO", "MUC", "Rome Fiumicino", "Munich", "Alitalia", "AZ"},
                {"BCN", "LIS", "Barcelona-El Prat", "Lisbon", "Vueling", "VY"},
                {"MAD", "LHR", "Madrid-Barajas", "London Heathrow", "Iberia", "IB"},
                {"CDG", "FCO", "Paris CDG", "Rome Fiumicino", "Air France", "AF"},
                {"AMS", "VIE", "Amsterdam Schiphol", "Vienna", "KLM", "KL"},
                {"MUC", "ZRH", "Munich", "Zurich", "Lufthansa", "LH"},
                {"LIS", "MAD", "Lisbon", "Madrid-Barajas", "TAP Portugal", "TP"},
                {"BCN", "FRA", "Barcelona-El Prat", "Frankfurt", "Vueling", "VY"},
                {"LHR", "AMS", "London Heathrow", "Amsterdam Schiphol", "British Airways", "BA"},
                {"VIE", "PRG", "Vienna", "Prague", "Austrian", "OS"},
                {"CPH", "ARN", "Copenhagen", "Stockholm Arlanda", "SAS", "SK"},
                {"DUB", "EDI", "Dublin", "Edinburgh", "Ryanair", "FR"},
                {"ATH", "FCO", "Athens", "Rome Fiumicino", "Aegean", "A3"},
                {"WAW", "BER", "Warsaw", "Berlin Brandenburg", "LOT", "LO"},
                {"BRU", "GVA", "Brussels", "Geneva", "Brussels Airlines", "SN"},
                {"HEL", "OSL", "Helsinki", "Oslo", "Finnair", "AY"},
                {"PMI", "DUS", "Palma de Mallorca", "Dusseldorf", "Eurowings", "EW"}
        };

        LocalTime now = LocalTime.now();
        LocalDate today = LocalDate.now();
        Random random = new Random(); // Sin seed para variación

        // Distribuir vuelos: ~7 aterrizados, ~6 en curso, ~7 programados
        for (int i = 0; i < routes.length; i++) {
            String[] route = routes[i];
            
            // Calcular horarios RELATIVOS a la hora actual
            LocalTime depTime;
            LocalTime arrTime;
            String status;
            int flightDuration = 1 + (i % 3); // 1-3 horas de duración
            
            if (i < 7) {
                // ATERRIZADOS: Salieron hace 2-5 horas, ya llegaron
                int hoursAgo = 2 + (i % 4);
                depTime = now.minusHours(hoursAgo).minusMinutes(random.nextInt(30));
                arrTime = depTime.plusHours(flightDuration).plusMinutes(random.nextInt(30));
                status = "landed";
            } else if (i < 13) {
                // EN CURSO: Salieron hace 0-2 horas, llegarán en 0-2 horas
                int minutesAgo = 15 + (i - 7) * 20 + random.nextInt(15);
                depTime = now.minusMinutes(minutesAgo);
                arrTime = now.plusMinutes(10 + (i - 7) * 15 + random.nextInt(20));
                status = "active";
            } else {
                // PROGRAMADOS: Saldrán en 0.5-4 horas
                int minutesUntil = 30 + (i - 13) * 30 + random.nextInt(20);
                depTime = now.plusMinutes(minutesUntil);
                arrTime = depTime.plusHours(flightDuration).plusMinutes(random.nextInt(30));
                status = "scheduled";
            }
            
            String flightNum = route[5] + (1000 + i * 11);

            Map<String, Object> flight = new LinkedHashMap<>();
            flight.put("flight_date", today.toString());
            flight.put("flight_status", status);

            Map<String, Object> flightInfo = new LinkedHashMap<>();
            flightInfo.put("number", String.valueOf(1000 + i * 11));
            flightInfo.put("iata", flightNum);
            flight.put("flight", flightInfo);

            Map<String, Object> airline = new LinkedHashMap<>();
            airline.put("name", route[4]);
            airline.put("iata", route[5]);
            flight.put("airline", airline);

            Map<String, Object> departure = new LinkedHashMap<>();
            departure.put("airport", route[2]);
            departure.put("iata", route[0]);
            departure.put("scheduled", today + "T" + depTime.withSecond(0).withNano(0) + ":00");
            flight.put("departure", departure);

            Map<String, Object> arrival = new LinkedHashMap<>();
            arrival.put("airport", route[3]);
            arrival.put("iata", route[1]);
            arrival.put("scheduled", today + "T" + arrTime.withSecond(0).withNano(0) + ":00");
            flight.put("arrival", arrival);

            // Añadir datos live para vuelos ACTIVOS (necesario para el mapa)
            if ("active".equals(status)) {
                Map<String, Object> live = new LinkedHashMap<>();
                
                // Coordenadas de aeropuertos europeos para calcular posición
                double[][] airportCoords = {
                    {40.4168, -3.7038},   // MAD
                    {41.2974, 2.0833},    // BCN
                    {51.4700, -0.4543},   // LHR
                    {49.0097, 2.5479},    // CDG
                    {50.0379, 8.5622},    // FRA
                    {52.3105, 4.7683},    // AMS
                    {41.8003, 12.2389},   // FCO
                    {48.3538, 11.7861},   // MUC
                    {38.7742, -9.1342},   // LIS
                    {48.1103, 16.5697},   // VIE
                    {50.1008, 14.2600},   // PRG
                    {55.6180, 12.6508},   // CPH
                    {59.6519, 17.9186},   // ARN
                    {53.4264, -6.2499},   // DUB
                    {55.9500, -3.3725},   // EDI
                    {37.9364, 23.9445},   // ATH
                    {52.1657, 20.9671},   // WAW
                    {52.3667, 13.5033},   // BER
                    {50.9014, 4.4844},    // BRU
                    {46.2370, 6.1092},    // GVA
                    {60.3172, 24.9633},   // HEL
                    {60.1939, 11.1004},   // OSL
                    {39.5517, 2.7388},    // PMI
                    {51.2895, 6.7668}     // DUS
                };
                
                // Calcular progreso del vuelo (0.1 a 0.9)
                double progress = 0.3 + (random.nextDouble() * 0.4);
                
                // Buscar coordenadas de origen y destino
                String[] airports = {"MAD", "BCN", "LHR", "CDG", "FRA", "AMS", "FCO", "MUC", "LIS", "VIE", 
                                    "PRG", "CPH", "ARN", "DUB", "EDI", "ATH", "WAW", "BER", "BRU", "GVA", 
                                    "HEL", "OSL", "PMI", "DUS"};
                
                int depIdx = java.util.Arrays.asList(airports).indexOf(route[0]);
                int arrIdx = java.util.Arrays.asList(airports).indexOf(route[1]);
                
                if (depIdx == -1) depIdx = 0;
                if (arrIdx == -1) arrIdx = 1;
                
                double depLat = airportCoords[depIdx][0];
                double depLng = airportCoords[depIdx][1];
                double arrLat = airportCoords[arrIdx][0];
                double arrLng = airportCoords[arrIdx][1];
                
                // Interpolar posición actual
                double currentLat = depLat + (arrLat - depLat) * progress;
                double currentLng = depLng + (arrLng - depLng) * progress;
                
                // Calcular dirección (heading)
                double direction = Math.toDegrees(Math.atan2(arrLng - depLng, arrLat - depLat));
                if (direction < 0) direction += 360;
                
                live.put("latitude", currentLat);
                live.put("longitude", currentLng);
                live.put("altitude", 35000 + random.nextInt(5000));
                live.put("speed", 450 + random.nextInt(100));
                live.put("direction", direction);
                live.put("is_ground", false);
                
                flight.put("live", live);
            }

            flights.add(flight);
        }

        return flights;
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

    private List<Map<String, Object>> adaptFlightsToToday(List<Map<String, Object>> flights) {
        LocalDate today = LocalDate.now();
        return flights.stream()
                .map(flight -> {
                    Map<String, Object> adapted = new LinkedHashMap<>(flight);
                    adapted.put("flight_date", today.toString());
                    return adapted;
                })
                .toList();
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
