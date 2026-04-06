package com.vibecoding.ai.gemini_chat.controller;

import com.vibecoding.ai.gemini_chat.service.QnAService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.context.SecurityContextHolder;
import reactor.core.publisher.Flux;
import com.vibecoding.ai.gemini_chat.entity.User;
import com.vibecoding.ai.gemini_chat.repository.UserRepository;
import com.vibecoding.ai.gemini_chat.repository.ChatSessionRepository;
import com.vibecoding.ai.gemini_chat.repository.ChatMessageRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.http.ResponseEntity;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/qna")
public class AIController {

    private final QnAService qnAService;
    private final UserRepository userRepository;
    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;

    public AIController(QnAService qnAService, UserRepository userRepository,
            ChatSessionRepository sessionRepository, ChatMessageRepository messageRepository) {
        this.qnAService = qnAService;
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
        this.messageRepository = messageRepository;
    }

    @PostMapping(value = "/ask", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> askQuestion(
            @RequestParam("question") String question,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "sessionId", required = false) Long sessionId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        return qnAService.getAnswer(question, file, user, sessionId);
    }

    @GetMapping("/sessions")
    public ResponseEntity<?> getUserSessions() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow();
        var sessions = sessionRepository.findByUserId(user.getId()).stream()
                .map(s -> Map.of("id", s.getId(), "title", s.getTitle()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/sessions/{id}/messages")
    public ResponseEntity<?> getSessionMessages(@PathVariable("id") Long id) {
        var messages = messageRepository.findBySessionIdOrderByIdAsc(id).stream()
                .map(m -> Map.of("role", m.getRole(), "content", m.getContent()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(messages);
    }
}
