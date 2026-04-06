package com.vibecoding.ai.gemini_chat.repository;

import com.vibecoding.ai.gemini_chat.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findBySessionIdOrderByIdAsc(Long sessionId);
}
