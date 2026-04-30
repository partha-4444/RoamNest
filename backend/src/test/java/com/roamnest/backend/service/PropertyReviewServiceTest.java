package com.roamnest.backend.service;

import com.roamnest.backend.dao.BookingDao;
import com.roamnest.backend.dao.PropertyDao;
import com.roamnest.backend.dao.PropertyReviewDao;
import com.roamnest.backend.dao.UserDao;
import com.roamnest.backend.dto.CreateReviewRequest;
import com.roamnest.backend.dto.PropertyReviewResponse;
import com.roamnest.backend.model.BookingRecord;
import com.roamnest.backend.model.PropertyReviewRecord;
import com.roamnest.backend.model.UserAccount;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PropertyReviewServiceTest {

    @Mock
    private PropertyReviewDao reviewDao;

    @Mock
    private BookingDao bookingDao;

    @Mock
    private PropertyDao propertyDao;

    @Mock
    private UserDao userDao;

    @InjectMocks
    private PropertyReviewService propertyReviewService;

    @Test
    void createReviewRequiresUserRole() {
        when(userDao.findByUsername("owner@example.com")).thenReturn(Optional.of(user(5L, "OWNER")));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> propertyReviewService.createReview("owner@example.com", 1L, reviewRequest(4, "Nice")));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(reviewDao, never()).create(any());
    }

    @Test
    void createReviewRejectsNonGuestOfBooking() {
        when(userDao.findByUsername("user@example.com")).thenReturn(Optional.of(user(99L, "USER")));
        when(bookingDao.findById(1L)).thenReturn(Optional.of(booking(1L, 10L, 20L, "APPROVED",
            LocalDate.now().minusDays(5), LocalDate.now().minusDays(1))));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> propertyReviewService.createReview("user@example.com", 1L, reviewRequest(5, "Great")));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(reviewDao, never()).create(any());
    }

    @Test
    void createReviewRejectsPendingBooking() {
        when(userDao.findByUsername("user@example.com")).thenReturn(Optional.of(user(20L, "USER")));
        when(bookingDao.findById(1L)).thenReturn(Optional.of(booking(1L, 10L, 20L, "PENDING",
            LocalDate.now().minusDays(5), LocalDate.now().minusDays(1))));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> propertyReviewService.createReview("user@example.com", 1L, reviewRequest(3, null)));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(reviewDao, never()).create(any());
    }

    @Test
    void createReviewRejectsBeforeCheckout() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        when(userDao.findByUsername("user@example.com")).thenReturn(Optional.of(user(20L, "USER")));
        when(bookingDao.findById(1L)).thenReturn(Optional.of(booking(1L, 10L, 20L, "APPROVED",
            LocalDate.now().minusDays(2), tomorrow)));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> propertyReviewService.createReview("user@example.com", 1L, reviewRequest(4, "Not done yet")));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(reviewDao, never()).create(any());
    }

    @Test
    void createReviewRejectsDuplicateForSameBooking() {
        when(userDao.findByUsername("user@example.com")).thenReturn(Optional.of(user(20L, "USER")));
        when(bookingDao.findById(1L)).thenReturn(Optional.of(booking(1L, 10L, 20L, "APPROVED",
            LocalDate.now().minusDays(5), LocalDate.now().minusDays(1))));
        when(reviewDao.existsByBookingId(1L)).thenReturn(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> propertyReviewService.createReview("user@example.com", 1L, reviewRequest(5, "Amazing")));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        verify(reviewDao, never()).create(any());
    }

    @Test
    void createReviewPersistsRatingAndComment() {
        PropertyReviewRecord saved = reviewRecord(77L, 1L, 10L, 20L, 5, "Loved it");
        when(userDao.findByUsername("user@example.com")).thenReturn(Optional.of(user(20L, "USER")));
        when(bookingDao.findById(1L)).thenReturn(Optional.of(booking(1L, 10L, 20L, "APPROVED",
            LocalDate.now().minusDays(5), LocalDate.now().minusDays(1))));
        when(reviewDao.existsByBookingId(1L)).thenReturn(false);
        when(reviewDao.create(any(PropertyReviewRecord.class))).thenReturn(77L);
        when(reviewDao.findById(77L)).thenReturn(Optional.of(saved));

        PropertyReviewResponse response = propertyReviewService.createReview(
            "user@example.com", 1L, reviewRequest(5, "Loved it"));

        ArgumentCaptor<PropertyReviewRecord> captor = ArgumentCaptor.forClass(PropertyReviewRecord.class);
        verify(reviewDao).create(captor.capture());
        assertEquals(5, captor.getValue().getRating());
        assertEquals("Loved it", captor.getValue().getComment());
        assertEquals(20L, captor.getValue().getUserId());
        assertEquals(10L, captor.getValue().getPropertyId());
        assertEquals(77L, response.getId());
        assertEquals(5, response.getRating());
    }

    @Test
    void createReviewAllowsNullComment() {
        PropertyReviewRecord saved = reviewRecord(78L, 1L, 10L, 20L, 3, null);
        when(userDao.findByUsername("user@example.com")).thenReturn(Optional.of(user(20L, "USER")));
        when(bookingDao.findById(1L)).thenReturn(Optional.of(booking(1L, 10L, 20L, "APPROVED",
            LocalDate.now().minusDays(5), LocalDate.now().minusDays(1))));
        when(reviewDao.existsByBookingId(1L)).thenReturn(false);
        when(reviewDao.create(any(PropertyReviewRecord.class))).thenReturn(78L);
        when(reviewDao.findById(78L)).thenReturn(Optional.of(saved));

        PropertyReviewResponse response = propertyReviewService.createReview(
            "user@example.com", 1L, reviewRequest(3, null));

        assertNull(response.getComment());
        assertEquals(3, response.getRating());
    }

    private CreateReviewRequest reviewRequest(int rating, String comment) {
        CreateReviewRequest req = new CreateReviewRequest();
        req.setRating(rating);
        req.setComment(comment);
        return req;
    }

    private UserAccount user(Long id, String role) {
        UserAccount user = new UserAccount();
        user.setId(id);
        user.setUsername(role.toLowerCase() + "@example.com");
        user.setRole(role);
        user.setEnabled(true);
        return user;
    }

    private BookingRecord booking(Long id, Long propertyId, Long userId, String status,
                                  LocalDate checkIn, LocalDate checkOut) {
        BookingRecord booking = new BookingRecord();
        booking.setId(id);
        booking.setPropertyId(propertyId);
        booking.setUserId(userId);
        booking.setCheckInDate(checkIn);
        booking.setCheckOutDate(checkOut);
        booking.setGuests(2);
        booking.setStatus(status);
        return booking;
    }

    private PropertyReviewRecord reviewRecord(Long id, Long bookingId, Long propertyId,
                                              Long userId, int rating, String comment) {
        PropertyReviewRecord record = new PropertyReviewRecord();
        record.setId(id);
        record.setBookingId(bookingId);
        record.setPropertyId(propertyId);
        record.setUserId(userId);
        record.setRating(rating);
        record.setComment(comment);
        record.setCreatedAt(OffsetDateTime.now());
        record.setUpdatedAt(OffsetDateTime.now());
        return record;
    }
}
