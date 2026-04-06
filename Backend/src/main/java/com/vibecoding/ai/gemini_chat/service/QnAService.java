package com.vibecoding.ai.gemini_chat.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.vibecoding.ai.gemini_chat.entity.*;
import com.vibecoding.ai.gemini_chat.repository.*;
import java.util.Base64;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;

@Service
public class QnAService {
        // Access to APIKey and URL [Gemini]
        @Value("${gemini.api.url}")
        private String geminiApiUrl;

        @Value("${gemini.api.key}")
        private String geminiApiKey;

        private final WebClient webClient;
        private final ChatSessionRepository sessionRepository;
        private final ChatMessageRepository messageRepository;

        public QnAService(WebClient.Builder webClientBuilder, ChatSessionRepository sessionRepository,
                        ChatMessageRepository messageRepository) {
                this.webClient = webClientBuilder.build();
                this.sessionRepository = sessionRepository;
                this.messageRepository = messageRepository;
        }

        public Flux<String> getAnswer(String question, MultipartFile file, User user, Long sessionId) {
                // Construct the request payload
                List<Object> parts = new ArrayList<>();
                parts.add(Map.of("text", question));

                if (file != null && !file.isEmpty()) {
                        try {
                                String base64Image = Base64.getEncoder().encodeToString(file.getBytes());
                                parts.add(Map.of("inlineData", Map.of(
                                                "mimeType", file.getContentType(),
                                                "data", base64Image)));
                        } catch (Exception e) {
                                throw new RuntimeException("Failed to encode image");
                        }
                }

                Map<String, Object> requestBody = Map.of(
                                "contents", new Object[] {
                                                Map.of("parts", parts)
                                });

                String finalUrl = geminiApiUrl;
                if (finalUrl.contains("generateContent") && !finalUrl.contains("streamGenerateContent")) {
                        finalUrl = finalUrl.replace("generateContent", "streamGenerateContent")
                                        + (finalUrl.contains("?") ? "&alt=sse" : "?alt=sse");
                } else if (!finalUrl.contains("alt=sse")) {
                        finalUrl = finalUrl + (finalUrl.contains("?") ? "&alt=sse" : "?alt=sse");
                }

                // Ensure Session
                ChatSession session;
                if (sessionId == null) {
                        session = new ChatSession();
                        session.setUser(user);
                        session.setTitle(question.substring(0, Math.min(question.length(), 20)));
                        session = sessionRepository.save(session);
                } else {
                        session = sessionRepository.findById(sessionId).orElseThrow();
                }

                // Save User Message
                messageRepository.save(ChatMessage.builder().session(session).role("user").content(question).build());

                // Stream Response and accumulate full text
                StringBuilder aiResponseBuilder = new StringBuilder();

                // Make the API Call and return the response
                final ChatSession finalSession = session;
                ObjectMapper mapper = new ObjectMapper();

                return webClient.post()
                                .uri(finalUrl)
                                .header("Content-Type", "application/json")
                                .header("X-goog-api-key", geminiApiKey)
                                .bodyValue(requestBody)
                                .retrieve()
                                .bodyToFlux(String.class)
                                .map(chunk -> {
                                        try {
                                                String jsonStr = chunk.startsWith("data:") ? chunk.substring(5).trim()
                                                                : chunk.trim();
                                                if (jsonStr.isEmpty() || jsonStr.equals(","))
                                                        return "";

                                                if (jsonStr.startsWith("["))
                                                        jsonStr = jsonStr.substring(1);
                                                if (jsonStr.endsWith("]"))
                                                        jsonStr = jsonStr.substring(0, jsonStr.length() - 1);

                                                JsonNode root = mapper.readTree(jsonStr);
                                                if (root.has("candidates")) {
                                                        JsonNode candidate = root.get("candidates").get(0);
                                                        if (candidate.has("content")
                                                                        && candidate.get("content").has("parts")) {
                                                                return candidate.get("content").get("parts")
                                                                                .get(0).get("text").asText();
                                                        }
                                                }
                                        } catch (Exception ignored) {
                                        }
                                        return "";
                                })
                                .filter(text -> !text.isEmpty())
                                .onErrorResume(throwable -> {
                                        System.err.println("API Stream Array Exception: " + throwable.getMessage());
                                        return Flux.just(" [SYSTEM: Google Gemini API dropped the connection. Reason: "
                                                        + throwable.getMessage() + "]");
                                })
                                .doOnNext(text -> {
                                        aiResponseBuilder.append(text);
                                })
                                .doFinally(signalType -> {
                                        messageRepository.save(ChatMessage.builder()
                                                        .session(finalSession)
                                                        .role("model")
                                                        .content(aiResponseBuilder.toString())
                                                        .build());
                                });
        }
}
