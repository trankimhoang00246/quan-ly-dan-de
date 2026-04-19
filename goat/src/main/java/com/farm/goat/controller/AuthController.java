package com.farm.goat.controller;

import com.farm.goat.config.JwtUtil;
import com.farm.goat.dto.AuthResponse;
import com.farm.goat.dto.LoginRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final JwtUtil jwtUtil;
    private final String authUsername;
    private final String authPassword;

    public AuthController(
            JwtUtil jwtUtil,
            @Value("${app.auth.username}") String authUsername,
            @Value("${app.auth.password}") String authPassword) {
        this.jwtUtil = jwtUtil;
        this.authUsername = authUsername;
        this.authPassword = authPassword;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        if (authUsername.equals(req.username()) && authPassword.equals(req.password())) {
            String token = jwtUtil.generateToken(req.username());
            return ResponseEntity.ok(new AuthResponse(token, req.username()));
        }
        return ResponseEntity.status(401).body("Sai tên đăng nhập hoặc mật khẩu");
    }
}
