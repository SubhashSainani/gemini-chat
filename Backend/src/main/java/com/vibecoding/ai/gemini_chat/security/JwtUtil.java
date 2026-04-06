package com.vibecoding.ai.gemini_chat.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    private static final long EXPIRATION_TIME = 864_000_000; // 10 days

    public String generateToken(String username) {
        return JWT.create()
                .withSubject(username)
                .withExpiresAt(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .sign(Algorithm.HMAC512(secret.getBytes()));
    }

    public String validateTokenAndRetrieveSubject(String token) throws Exception {
        DecodedJWT jwt = JWT.require(Algorithm.HMAC512(secret.getBytes()))
                .build()
                .verify(token);
        return jwt.getSubject();
    }
}
