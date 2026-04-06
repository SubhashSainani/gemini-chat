package com.vibecoding.ai.gemini_chat.repository;

import com.vibecoding.ai.gemini_chat.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
}
