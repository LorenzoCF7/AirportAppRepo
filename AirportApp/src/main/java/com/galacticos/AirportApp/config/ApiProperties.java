package com.galacticos.AirportApp.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "api")
@Getter
@Setter
public class ApiProperties {
    
    private AviationstackConfig aviationstack = new AviationstackConfig();
    private AmadeusConfig amadeus = new AmadeusConfig();
    private AnthropicConfig anthropic = new AnthropicConfig();
    private GroqConfig groq = new GroqConfig();

    // Detecta si AviationStack tiene API key válida
    public boolean hasValidAviationstackKey() {
        String key = aviationstack.getApiKey();
        return key != null && !key.isBlank() && !key.startsWith("TU_");
    }

    // Detecta si Amadeus tiene credenciales válidas
    public boolean hasValidAmadeusCredentials() {
        String clientId = amadeus.getClientId();
        String clientSecret = amadeus.getClientSecret();
        return clientId != null && !clientId.isBlank() && !clientId.startsWith("TU_")
            && clientSecret != null && !clientSecret.isBlank() && !clientSecret.startsWith("TU_");
    }

    // Detecta si hay API key de Anthropic válida
    public boolean hasValidAnthropicKey() {
        String key = anthropic.getApiKey();
        return key != null && !key.isBlank() && key.startsWith("sk-ant-");
    }

    @Getter
    @Setter
    public static class AviationstackConfig {
        private String apiKey = "";
        private String baseUrl = "https://api.aviationstack.com/v1";
    }

    @Getter
    @Setter
    public static class AmadeusConfig {
        private String clientId = "";
        private String clientSecret = "";
        private String authUrl = "https://test.api.amadeus.com/v1/security/oauth2/token";
        private String baseUrl = "https://test.api.amadeus.com/v2";
    }

    // Detecta si hay API key de Groq válida (empieza por gsk_)
    public boolean hasValidGroqKey() {
        String key = groq.getApiKey();
        return key != null && !key.isBlank() && key.startsWith("gsk_");
    }

    @Getter
    @Setter
    public static class AnthropicConfig {
        private String apiKey = "";
        private String baseUrl = "https://api.anthropic.com/v1";
    }

    @Getter
    @Setter
    public static class GroqConfig {
        private String apiKey = "";
        private String baseUrl = "https://api.groq.com/openai/v1";
        private String model = "llama3-8b-8192";
    }
}
