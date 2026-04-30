package com.roamnest.backend.service;

import com.roamnest.backend.dao.AdminDao;
import com.roamnest.backend.dao.UserDao;
import com.roamnest.backend.dto.AdminBookingResponse;
import com.roamnest.backend.dto.AdminPropertyResponse;
import com.roamnest.backend.dto.AdminSummaryResponse;
import com.roamnest.backend.model.UserAccount;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AdminService {

    private static final String ROLE_ADMIN = "ADMIN";

    private final AdminDao adminDao;
    private final UserDao userDao;

    public AdminService(AdminDao adminDao, UserDao userDao) {
        this.adminDao = adminDao;
        this.userDao = userDao;
    }

    public AdminSummaryResponse getSummary(String username) {
        requireAdmin(username);
        return adminDao.findSummary();
    }

    public List<AdminPropertyResponse> getAllProperties(String username) {
        requireAdmin(username);
        return adminDao.findAllProperties();
    }

    /**
     * @param status optional filter; null or blank returns all statuses
     */
    public List<AdminBookingResponse> getAllBookings(String username, String status) {
        requireAdmin(username);
        String normalizedStatus = (status == null || status.isBlank()) ? null : status.trim().toUpperCase();
        return adminDao.findAllBookings(normalizedStatus);
    }

    private void requireAdmin(String username) {
        UserAccount user = userDao.findByUsername(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        if (!ROLE_ADMIN.equals(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }
    }
}
