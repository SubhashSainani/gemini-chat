package com.vibecoding.ai.gemini_chat.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class AppConfig {

    // Test code
    @Bean
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder();
    }
}