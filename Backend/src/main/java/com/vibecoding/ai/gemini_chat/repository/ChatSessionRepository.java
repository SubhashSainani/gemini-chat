package com.vibecoding.ai.gemini_chat.repository;

import com.vibecoding.ai.gemini_chat.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    List<ChatSession> findByUserId(Long userId);
}
