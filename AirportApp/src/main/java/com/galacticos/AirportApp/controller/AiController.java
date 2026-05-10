package com.galacticos.AirportApp.controller;

import com.galacticos.AirportApp.dto.request.AiRequest;
import com.galacticos.AirportApp.dto.response.AiResponse;
import com.galacticos.AirportApp.dto.response.ApiResponse;
import com.galacticos.AirportApp.service.AiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
public class AiController {

    private final AiService aiService;

    @PostMapping("/recommend")
    public ResponseEntity<ApiResponse<AiResponse>> recommend(@RequestBody AiRequest request) {
        log.info("Petición IA: {}", request.getMessage());
        AiResponse response = aiService.recommend(request.getMessage());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
