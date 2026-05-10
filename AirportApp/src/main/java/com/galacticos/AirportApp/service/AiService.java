package com.galacticos.AirportApp.service;

import com.galacticos.AirportApp.dto.response.AiResponse;

public interface AiService {
    AiResponse recommend(String userMessage);
}
