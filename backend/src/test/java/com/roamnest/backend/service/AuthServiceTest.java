package com.roamnest.backend.service;

import com.roamnest.backend.dao.TokenDao;
import com.roamnest.backend.dao.UserDao;
import com.roamnest.backend.dto.AuthResponse;
import com.roamnest.backend.dto.LoginRequest;
import com.roamnest.backend.model.UserAccount;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Base64;
import java.util.Optional;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserDao userDao;

    @Mock
    private TokenDao tokenDao;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    @Test
    void loginDecodesBase64PasswordPayloadBeforeVerification() {
        LoginRequest request = new LoginRequest();
        request.setUsername("user@example.com");
        request.setPassword("base64:" + Base64.getEncoder().encodeToString("secret".getBytes(UTF_8)));

        UserAccount user = new UserAccount();
        user.setId(20L);
        user.setUsername("user@example.com");
        user.setPassword("stored-hash");
        user.setRole("USER");
        user.setEnabled(true);

        when(userDao.findByUsername("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret", "stored-hash")).thenReturn(true);
        when(jwtService.generateToken("user@example.com")).thenReturn("token");
        when(jwtService.extractExpiration("token")).thenReturn(Optional.of(Instant.parse("2030-01-01T00:00:00Z")));

        AuthResponse response = authService.login(request);

        assertEquals("Login successful", response.getMessage());
        verify(passwordEncoder).matches(eq("secret"), eq("stored-hash"));
        verify(tokenDao).revokeActiveTokensByUserId(20L);
    }
}
