package com.roamnest.backend.service;

import com.roamnest.backend.dao.TokenDao;
import com.roamnest.backend.dao.UserDao;
import com.roamnest.backend.model.UserAccount;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthHandler {

    private final JwtService jwtService;
    private final UserDao userDao;
    private final TokenDao tokenDao;

    public AuthHandler(JwtService jwtService, UserDao userDao, TokenDao tokenDao) {
        this.jwtService = jwtService;
        this.userDao = userDao;
        this.tokenDao = tokenDao;
    }

    public Optional<UserAccount> authenticateBearerToken(String authHeader) {
        Optional<String> tokenOptional = extractBearerToken(authHeader);
        if (tokenOptional.isEmpty()) {
            return Optional.empty();
        }

        String token = tokenOptional.get();
        Optional<String> usernameOptional = jwtService.extractUsername(token);
        if (usernameOptional.isEmpty()) {
            return Optional.empty();
        }

        String username = usernameOptional.get();
        Optional<UserAccount> userOptional = userDao.findByUsername(username);
        if (userOptional.isEmpty()) {
            return Optional.empty();
        }

        UserAccount user = userOptional.get();
        if (!user.isEnabled()) {
            return Optional.empty();
        }

        boolean tokenMatchesActiveRow = tokenDao.isTokenActiveForUser(token, user.getId());
        if (!tokenMatchesActiveRow) {
            return Optional.empty();
        }

        boolean jwtValid = jwtService.isTokenValidForUsername(token, username);
        if (!jwtValid) {
            return Optional.empty();
        }

        return Optional.of(user);
    }

    public Optional<String> extractBearerToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Optional.empty();
        }
        return Optional.of(authHeader.substring(7));
    }
}
