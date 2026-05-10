package com.galacticos.AirportApp.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.galacticos.AirportApp.config.ApiProperties;
import com.galacticos.AirportApp.dto.response.AiResponse;
import com.galacticos.AirportApp.dto.response.FlightResponse;
import com.galacticos.AirportApp.service.AiService;
import com.galacticos.AirportApp.service.FlightService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiServiceImpl implements AiService {

    private final FlightService flightService;
    private final ApiProperties apiProperties;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Override
    public AiResponse recommend(String userMessage) {
        List<Map<String, Object>> flights = getAvailableFlights();
        String flightContext = buildFlightContext(flights);
        String systemPrompt = buildSystemPrompt(flightContext);

        // Priority: Anthropic → Groq → demo
        if (apiProperties.hasValidAnthropicKey()) {
            log.info("Usando Anthropic Claude");
            try {
                return parseAiResponse(callAnthropicApi(userMessage, systemPrompt));
            } catch (Exception e) {
                log.error("Error con Anthropic: {}", e.getMessage());
            }
        }

        if (apiProperties.hasValidGroqKey()) {
            log.info("Usando Groq (LLaMA 3)");
            try {
                return parseAiResponse(callGroqApi(userMessage, systemPrompt));
            } catch (Exception e) {
                log.error("Error con Groq: {}", e.getMessage());
            }
        }

        log.warn("Sin clave de IA — modo demo");
        return buildDemoResponse(flights, userMessage);
    }

    // ── Prompt ─────────────────────────────────────────────────────────────────

    private String buildSystemPrompt(String flightContext) {
        return """
                Eres AirBot, el asistente de viajes inteligente de este aeropuerto.
                Ayudas a los usuarios a encontrar y elegir vuelos disponibles.

                VUELOS DISPONIBLES HOY:
                """ + flightContext + """

                INSTRUCCIONES IMPORTANTES:
                - Responde SIEMPRE en español
                - Sé amigable, conciso y útil
                - Basa tus recomendaciones ÚNICAMENTE en los vuelos listados arriba
                - Responde SIEMPRE en formato JSON válido con esta estructura exacta (sin texto extra fuera del JSON):
                {
                  "message": "Tu respuesta conversacional aquí",
                  "recommendations": [
                    { "origin": "XXX", "destination": "YYY", "originCity": "Ciudad Origen", "destinationCity": "Ciudad Destino", "reason": "Motivo breve" }
                  ]
                }
                - Si no hay vuelos que coincidan, pon "recommendations": []
                - Máximo 3 recomendaciones
                """;
    }

    // ── Anthropic ──────────────────────────────────────────────────────────────

    private String callAnthropicApi(String userMessage, String systemPrompt) throws Exception {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", "claude-haiku-4-5-20251001");
        body.put("max_tokens", 1024);
        body.put("system", systemPrompt);
        body.put("messages", List.of(Map.of("role", "user", "content", userMessage)));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.anthropic.com/v1/messages"))
                .header("Content-Type", "application/json")
                .header("x-api-key", apiProperties.getAnthropic().getApiKey())
                .header("anthropic-version", "2023-06-01")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) throw new RuntimeException("Anthropic " + response.statusCode());

        JsonNode root = objectMapper.readTree(response.body());
        return root.path("content").get(0).path("text").asText();
    }

    // ── Groq (OpenAI-compatible) ───────────────────────────────────────────────

    private String callGroqApi(String userMessage, String systemPrompt) throws Exception {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", apiProperties.getGroq().getModel());
        body.put("max_tokens", 1024);
        body.put("messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user",   "content", userMessage)
        ));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiProperties.getGroq().getBaseUrl() + "/chat/completions"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiProperties.getGroq().getApiKey())
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) throw new RuntimeException("Groq " + response.statusCode() + ": " + response.body());

        JsonNode root = objectMapper.readTree(response.body());
        return root.path("choices").get(0).path("message").path("content").asText();
    }

    // ── Parse AI response ──────────────────────────────────────────────────────

    private AiResponse parseAiResponse(String aiText) {
        try {
            String json = aiText.trim();
            if (json.startsWith("```")) {
                json = json.replaceAll("^```[a-z]*\\n?", "").replaceAll("\\n?```$", "").trim();
            }
            // Extract first JSON object if there's surrounding text
            int start = json.indexOf('{');
            int end   = json.lastIndexOf('}');
            if (start >= 0 && end > start) json = json.substring(start, end + 1);

            JsonNode node = objectMapper.readTree(json);
            String message = node.path("message").asText("No pude procesar la respuesta.");

            List<AiResponse.FlightRecommendation> recs = new ArrayList<>();
            JsonNode recsNode = node.path("recommendations");
            if (recsNode.isArray()) {
                for (JsonNode rec : recsNode) {
                    recs.add(AiResponse.FlightRecommendation.builder()
                            .origin(rec.path("origin").asText())
                            .destination(rec.path("destination").asText())
                            .originCity(rec.path("originCity").asText())
                            .destinationCity(rec.path("destinationCity").asText())
                            .reason(rec.path("reason").asText())
                            .build());
                }
            }
            return AiResponse.builder().message(message).recommendations(recs).build();
        } catch (Exception e) {
            log.warn("Error parseando JSON de IA: {}", e.getMessage());
            return AiResponse.builder().message(aiText).recommendations(Collections.emptyList()).build();
        }
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private List<Map<String, Object>> getAvailableFlights() {
        try {
            // forceRefresh=true para que la IA siempre tenga los vuelos más actuales
            FlightResponse response = flightService.getAllFlights(true);
            return response.getData() != null ? response.getData() : Collections.emptyList();
        } catch (Exception e) {
            log.warn("Error obteniendo vuelos: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    @SuppressWarnings("unchecked")
    private String buildFlightContext(List<Map<String, Object>> flights) {
        StringBuilder sb = new StringBuilder();
        int idx = 1;
        for (Map<String, Object> flight : flights) {
            try {
                Map<String, Object> dep = (Map<String, Object>) flight.get("departure");
                Map<String, Object> arr = (Map<String, Object>) flight.get("arrival");
                Map<String, Object> flightInfo = (Map<String, Object>) flight.get("flight");
                Map<String, Object> airline = (Map<String, Object>) flight.get("airline");
                if (dep == null || arr == null) continue;

                String depIata    = String.valueOf(dep.getOrDefault("iata", "???"));
                String arrIata    = String.valueOf(arr.getOrDefault("iata", "???"));
                String depAirport = String.valueOf(dep.getOrDefault("airport", ""));
                String arrAirport = String.valueOf(arr.getOrDefault("airport", ""));
                String scheduled  = String.valueOf(dep.getOrDefault("scheduled", ""));
                String airlineName = airline != null ? String.valueOf(airline.getOrDefault("name", "")) : "";
                String flightNum   = flightInfo != null ? String.valueOf(flightInfo.getOrDefault("iata", "")) : "";
                String status      = String.valueOf(flight.getOrDefault("flight_status", "scheduled"));
                String depTime     = scheduled.length() >= 16 ? scheduled.substring(11, 16) : "--:--";

                sb.append(idx++).append(". ").append(flightNum)
                        .append(" | ").append(airlineName)
                        .append(" | ").append(depIata).append(" (").append(depAirport).append(")")
                        .append(" → ").append(arrIata).append(" (").append(arrAirport).append(")")
                        .append(" | Salida: ").append(depTime)
                        .append(" | Estado: ").append(status)
                        .append("\n");
            } catch (Exception e) {
                log.trace("Error procesando vuelo: {}", e.getMessage());
            }
        }
        return sb.toString();
    }

    // ── Demo fallback (no API key) ─────────────────────────────────────────────

    // Mapa de nombres de ciudad/alias → código IATA
    private static final Map<String, String> CITY_TO_IATA = Map.ofEntries(
        Map.entry("madrid", "MAD"), Map.entry("barajas", "MAD"),
        Map.entry("barcelona", "BCN"), Map.entry("prat", "BCN"),
        Map.entry("paris", "CDG"), Map.entry("parís", "CDG"), Map.entry("charles de gaulle", "CDG"), Map.entry("orly", "ORY"),
        Map.entry("london", "LHR"), Map.entry("londres", "LHR"), Map.entry("heathrow", "LHR"),
        Map.entry("frankfurt", "FRA"),
        Map.entry("amsterdam", "AMS"), Map.entry("ámsterdam", "AMS"), Map.entry("schiphol", "AMS"),
        Map.entry("roma", "FCO"), Map.entry("rome", "FCO"), Map.entry("fiumicino", "FCO"),
        Map.entry("munich", "MUC"), Map.entry("múnich", "MUC"),
        Map.entry("lisboa", "LIS"), Map.entry("lisbon", "LIS"),
        Map.entry("viena", "VIE"), Map.entry("vienna", "VIE"),
        Map.entry("zurich", "ZRH"), Map.entry("zúrich", "ZRH"), Map.entry("ginebra", "GVA"), Map.entry("geneva", "GVA"),
        Map.entry("praga", "PRG"), Map.entry("prague", "PRG"),
        Map.entry("copenhague", "CPH"), Map.entry("copenhagen", "CPH"),
        Map.entry("estocolmo", "ARN"), Map.entry("stockholm", "ARN"),
        Map.entry("dublin", "DUB"), Map.entry("dublín", "DUB"),
        Map.entry("edimburgo", "EDI"), Map.entry("edinburgh", "EDI"),
        Map.entry("atenas", "ATH"), Map.entry("athens", "ATH"),
        Map.entry("varsovia", "WAW"), Map.entry("warsaw", "WAW"),
        Map.entry("berlin", "BER"), Map.entry("berlín", "BER"),
        Map.entry("bruselas", "BRU"), Map.entry("brussels", "BRU"),
        Map.entry("helsinki", "HEL"),
        Map.entry("oslo", "OSL"),
        Map.entry("mallorca", "PMI"), Map.entry("palma", "PMI"),
        Map.entry("dusseldorf", "DUS"), Map.entry("düsseldorf", "DUS"),
        Map.entry("sevilla", "SVQ"), Map.entry("seville", "SVQ"),
        Map.entry("valencia", "VLC"), Map.entry("malaga", "AGP"), Map.entry("málaga", "AGP"),
        Map.entry("bilbao", "BIO"), Map.entry("alicante", "ALC"),
        Map.entry("tenerife", "TFS"), Map.entry("canarias", "LPA"), Map.entry("gran canaria", "LPA")
    );

    @SuppressWarnings("unchecked")
    private AiResponse buildDemoResponse(List<Map<String, Object>> flights, String userMessage) {
        String lower = userMessage.toLowerCase();

        // Extraer IATAs mencionados (explícitos o por nombre de ciudad)
        Set<String> mentionedIatas = new HashSet<>();
        for (Map.Entry<String, String> entry : CITY_TO_IATA.entrySet()) {
            if (lower.contains(entry.getKey())) mentionedIatas.add(entry.getValue());
        }
        // También buscar códigos IATA directos de 3 letras
        for (String word : lower.split("\\s+")) {
            if (word.length() == 3 && word.matches("[a-z]{3}")) {
                mentionedIatas.add(word.toUpperCase());
            }
        }

        boolean hasOrigin = lower.contains("desde") || lower.contains("saliendo") || lower.contains("de ");
        boolean hasDestination = lower.contains("a ") || lower.contains("hacia") || lower.contains("para");

        List<AiResponse.FlightRecommendation> recs = new ArrayList<>();

        for (Map<String, Object> flight : flights) {
            try {
                Map<String, Object> dep = (Map<String, Object>) flight.get("departure");
                Map<String, Object> arr = (Map<String, Object>) flight.get("arrival");
                if (dep == null || arr == null) continue;

                String depIata = String.valueOf(dep.getOrDefault("iata", ""));
                String arrIata = String.valueOf(arr.getOrDefault("iata", ""));
                String depCity = String.valueOf(dep.getOrDefault("airport", depIata));
                String arrCity = String.valueOf(arr.getOrDefault("airport", arrIata));

                boolean depMatch = mentionedIatas.contains(depIata);
                boolean arrMatch = mentionedIatas.contains(arrIata);

                // Sin filtro de origen: mostrar TODOS los vuelos disponibles
                boolean matches = mentionedIatas.isEmpty() || depMatch || arrMatch;

                if (matches) {
                    recs.add(AiResponse.FlightRecommendation.builder()
                            .origin(depIata).destination(arrIata)
                            .originCity(depCity).destinationCity(arrCity)
                            .reason(depMatch && arrMatch ? "Coincide con origen y destino"
                                    : depMatch ? "Sale desde el aeropuerto que buscas"
                                    : arrMatch ? "Llega al destino que buscas"
                                    : "Vuelo disponible hoy")
                            .build());
                }
            } catch (Exception ignored) {}
        }

        String note = " — Configura GROQ_API_KEY (gratis en console.groq.com) para recomendaciones inteligentes con IA.";

        String message;
        if (recs.isEmpty()) {
            message = "No encontré vuelos para esa ruta en los datos de hoy." + note;
        } else if (!mentionedIatas.isEmpty()) {
            message = "Encontré " + recs.size() + " vuelo(s) relacionados con tu búsqueda." + note;
        } else {
            message = "Estos son todos los vuelos disponibles en el sistema hoy." + note;
        }

        return AiResponse.builder().message(message).recommendations(recs).build();
    }
}
