package com.roamnest.backend.service;

import com.roamnest.backend.dao.AdminDao;
import com.roamnest.backend.dao.UserDao;
import com.roamnest.backend.dto.AdminBookingResponse;
import com.roamnest.backend.dto.AdminPropertyResponse;
import com.roamnest.backend.dto.AdminSummaryResponse;
import com.roamnest.backend.dto.ReviewSummary;
import com.roamnest.backend.model.UserAccount;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private AdminDao adminDao;

    @Mock
    private UserDao userDao;

    @InjectMocks
    private AdminService adminService;

    @Test
    void getSummaryRequiresAdminRole() {
        when(userDao.findByUsername("user@example.com")).thenReturn(Optional.of(user(1L, "USER")));

        ResponseStatusException ex = assertThrows(
            ResponseStatusException.class,
            () -> adminService.getSummary("user@example.com"));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(adminDao, never()).findSummary();
    }

    @Test
    void getSummaryDelegatesToDaoForAdmin() {
        AdminSummaryResponse expected = summary(1L, 2L, 5L, 3L, 2L, 1L, 0L, 0L, 0L, 4.2);
        when(userDao.findByUsername("admin@example.com")).thenReturn(Optional.of(user(1L, "ADMIN")));
        when(adminDao.findSummary()).thenReturn(expected);

        AdminSummaryResponse response = adminService.getSummary("admin@example.com");

        assertEquals(5L, response.getUserCount());
        assertEquals(2L, response.getOwnerCount());
        assertEquals(4.2, response.getOverallAverageRating());
    }

    @Test
    void getAllPropertiesRequiresAdminRole() {
        when(userDao.findByUsername("owner@example.com")).thenReturn(Optional.of(user(2L, "OWNER")));

        ResponseStatusException ex = assertThrows(
            ResponseStatusException.class,
            () -> adminService.getAllProperties("owner@example.com"));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(adminDao, never()).findAllProperties();
    }

    @Test
    void getAllPropertiesReturnsAllIncludingUnavailable() {
        List<AdminPropertyResponse> props = List.of(
            adminProperty(1L, 5L, "owner@example.com", "Lake House", true),
            adminProperty(2L, 5L, "owner@example.com", "Old Cabin", false));
        when(userDao.findByUsername("admin@example.com")).thenReturn(Optional.of(user(1L, "ADMIN")));
        when(adminDao.findAllProperties()).thenReturn(props);

        List<AdminPropertyResponse> response = adminService.getAllProperties("admin@example.com");

        assertEquals(2, response.size());
    }

    @Test
    void getAllBookingsNormalizesStatusToUppercase() {
        when(userDao.findByUsername("admin@example.com")).thenReturn(Optional.of(user(1L, "ADMIN")));
        when(adminDao.findAllBookings("REJECTED")).thenReturn(List.of());

        List<AdminBookingResponse> result = adminService.getAllBookings("admin@example.com", "rejected");

        assertNotNull(result);
        verify(adminDao).findAllBookings("REJECTED");
    }

    @Test
    void getAllBookingsPassesNullForBlankStatus() {
        when(userDao.findByUsername("admin@example.com")).thenReturn(Optional.of(user(1L, "ADMIN")));
        when(adminDao.findAllBookings(null)).thenReturn(List.of());

        List<AdminBookingResponse> result = adminService.getAllBookings("admin@example.com", "  ");

        assertNotNull(result);
        verify(adminDao).findAllBookings(null);
    }

    private UserAccount user(Long id, String role) {
        UserAccount user = new UserAccount();
        user.setId(id);
        user.setUsername(role.toLowerCase() + "@example.com");
        user.setRole(role);
        user.setEnabled(true);
        return user;
    }

    private AdminSummaryResponse summary(long adminCount, long ownerCount, long userCount,
                                         long totalProps, long availableProps,
                                         long pending, long approved, long rejected, long cancelled,
                                         double avgRating) {
        return new AdminSummaryResponse(
            adminCount, ownerCount, userCount,
            totalProps, availableProps,
            pending, approved, rejected, cancelled,
            avgRating);
    }

    private AdminPropertyResponse adminProperty(Long id, Long ownerId, String ownerUsername,
                                                String title, boolean available) {
        return new AdminPropertyResponse(
            id, ownerId, ownerUsername, "Owner Name",
            title, null, "Somewhere", null,
            new BigDecimal("100.00"), 4,
            available, new ReviewSummary(0.0, 0),
            null, null);
    }
}
