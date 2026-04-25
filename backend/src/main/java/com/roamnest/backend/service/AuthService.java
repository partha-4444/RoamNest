package com.roamnest.backend.service;

import com.roamnest.backend.dao.TokenDao;
import com.roamnest.backend.dao.UserDao;
import com.roamnest.backend.dto.AuthResponse;
import com.roamnest.backend.dto.LoginRequest;
import com.roamnest.backend.dto.SignupRequest;
import com.roamnest.backend.model.UserAccount;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Locale;
import java.util.Optional;

@Service
public class AuthService {

    private static final String ROLE_ADMIN = "ADMIN";
    private static final String ROLE_OWNER = "OWNER";
    private static final String ROLE_USER = "USER";

    private final UserDao userDao;
    private final TokenDao tokenDao;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserDao userDao,
                       TokenDao tokenDao,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userDao = userDao;
        this.tokenDao = tokenDao;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        Optional<UserAccount> existing = userDao.findByUsername(request.getUsername());
        if (existing.isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }

        UserAccount user = new UserAccount();
        user.setFullName(request.getFullName());
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(normalizeRole(request.getRole()));
        user.setPhoneNo(request.getPhoneNo());
        user.setAddress(request.getAddress());
        user.setEnabled(true);

        Long userId = userDao.createUser(user);
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to create user");
        }
        user.setId(userId);

        String token = jwtService.generateToken(user.getUsername());
        Instant expiresAt = jwtService.extractExpiration(token).orElse(Instant.now());
        tokenDao.saveToken(userId, token, expiresAt);

        return new AuthResponse(token, user.getUsername(), user.getRole(), "Signup successful");
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        UserAccount user = userDao.findByUsername(request.getUsername())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password"));

        if (!user.isEnabled()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User account disabled");
        }

        boolean passwordMatches = passwordEncoder.matches(request.getPassword(), user.getPassword());
        if (!passwordMatches) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
        }

        tokenDao.revokeActiveTokensByUserId(user.getId());

        String token = jwtService.generateToken(user.getUsername());
        Instant expiresAt = jwtService.extractExpiration(token).orElse(Instant.now());
        tokenDao.saveToken(user.getId(), token, expiresAt);

        return new AuthResponse(token, user.getUsername(), user.getRole(), "Login successful");
    }

    @Transactional
    public void logout(String bearerToken) {
        tokenDao.revokeToken(bearerToken);
    }

    private String normalizeRole(String role) {
        if (role == null || role.isBlank()) {
            return ROLE_USER;
        }
        String normalized = role.trim().toUpperCase(Locale.ROOT);
        if (ROLE_ADMIN.equals(normalized) || ROLE_OWNER.equals(normalized) || ROLE_USER.equals(normalized)) {
            return normalized;
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role");
    }
}
