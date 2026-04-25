package com.roamnest.backend.service;

import com.roamnest.backend.dao.UserDao;
import com.roamnest.backend.dto.UserDetailsResponse;
import com.roamnest.backend.model.UserAccount;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class UserDetailsApiService {

    private static final String ROLE_ADMIN = "ADMIN";
    private static final String ROLE_OWNER = "OWNER";

    private final UserDao userDao;

    public UserDetailsApiService(UserDao userDao) {
        this.userDao = userDao;
    }

    public List<UserDetailsResponse> getUserDetailsByAccessScope(String username) {
        UserAccount currentUser = userDao.findByUsername(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (ROLE_ADMIN.equals(currentUser.getRole())) {
            return userDao.findAll().stream().map(this::toResponse).toList();
        }

        if (ROLE_OWNER.equals(currentUser.getRole())) {
            return userDao.findUsersByOwnerId(currentUser.getId()).stream().map(this::toResponse).toList();
        }

        return List.of(toResponse(currentUser));
    }

    private UserDetailsResponse toResponse(UserAccount user) {
        return new UserDetailsResponse(
            user.getId(),
            user.getFullName(),
            user.getUsername(),
            user.getRole(),
            user.getPhoneNo(),
            user.getAddress());
    }
}
