package com.roamnest.backend.service;

import com.roamnest.backend.dao.BookingDao;
import com.roamnest.backend.dao.PropertyDao;
import com.roamnest.backend.dao.UserDao;
import com.roamnest.backend.dto.BookingDecisionRequest;
import com.roamnest.backend.dto.BookingResponse;
import com.roamnest.backend.dto.CreateBookingRequest;
import com.roamnest.backend.model.BookingRecord;
import com.roamnest.backend.model.PropertyRecord;
import com.roamnest.backend.model.UserAccount;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingDao bookingDao;

    @Mock
    private PropertyDao propertyDao;

    @Mock
    private UserDao userDao;

    @InjectMocks
    private BookingService bookingService;

    @Test
    void createBookingRejectsGuestCountAboveCapacity() {
        CreateBookingRequest request = createBookingRequest();
        request.setGuests(5);
        when(userDao.findByUsername("user@example.com")).thenReturn(Optional.of(user(20L, "USER")));
        when(propertyDao.findById(10L)).thenReturn(Optional.of(property(10L, 5L, 4)));

        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> bookingService.createBooking("user@example.com", request));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        verify(bookingDao, never()).create(any());
    }

    @Test
    void createBookingStoresPendingBooking() {
        CreateBookingRequest request = createBookingRequest();
        BookingRecord createdBooking = booking(99L, 10L, 20L, "PENDING");
        when(userDao.findByUsername("user@example.com")).thenReturn(Optional.of(user(20L, "USER")));
        when(propertyDao.findById(10L)).thenReturn(Optional.of(property(10L, 5L, 4)));
        when(bookingDao.existsApprovedOverlap(10L, request.getCheckInDate(), request.getCheckOutDate(), null))
            .thenReturn(false);
        when(bookingDao.create(any(BookingRecord.class))).thenReturn(99L);
        when(bookingDao.findById(99L)).thenReturn(Optional.of(createdBooking));

        BookingResponse response = bookingService.createBooking("user@example.com", request);

        ArgumentCaptor<BookingRecord> bookingCaptor = ArgumentCaptor.forClass(BookingRecord.class);
        verify(bookingDao).create(bookingCaptor.capture());
        assertEquals("PENDING", bookingCaptor.getValue().getStatus());
        assertEquals(20L, bookingCaptor.getValue().getUserId());
        assertEquals(99L, response.getId());
    }

    @Test
    void approveBookingRequiresPropertyOwner() {
        BookingDecisionRequest request = new BookingDecisionRequest();
        request.setOwnerDecisionNote("Approved");
        when(userDao.findByUsername("owner@example.com")).thenReturn(Optional.of(user(7L, "OWNER")));
        when(bookingDao.findById(99L)).thenReturn(Optional.of(booking(99L, 10L, 20L, "PENDING")));
        when(propertyDao.findById(10L)).thenReturn(Optional.of(property(10L, 5L, 4)));

        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> bookingService.approveBooking("owner@example.com", 99L, request));

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
        verify(bookingDao, never()).approve(any(), any(), any());
    }

    private CreateBookingRequest createBookingRequest() {
        CreateBookingRequest request = new CreateBookingRequest();
        request.setPropertyId(10L);
        request.setCheckInDate(LocalDate.now().plusDays(1));
        request.setCheckOutDate(LocalDate.now().plusDays(3));
        request.setGuests(2);
        return request;
    }

    private UserAccount user(Long id, String role) {
        UserAccount user = new UserAccount();
        user.setId(id);
        user.setUsername(role.toLowerCase() + "@example.com");
        user.setRole(role);
        user.setEnabled(true);
        return user;
    }

    private PropertyRecord property(Long id, Long ownerId, Integer maxGuests) {
        PropertyRecord property = new PropertyRecord();
        property.setId(id);
        property.setOwnerId(ownerId);
        property.setTitle("Lake House");
        property.setLocation("Pokhara");
        property.setPricePerNight(new BigDecimal("120.00"));
        property.setMaxGuests(maxGuests);
        property.setAvailable(true);
        return property;
    }

    private BookingRecord booking(Long id, Long propertyId, Long userId, String status) {
        BookingRecord booking = new BookingRecord();
        booking.setId(id);
        booking.setPropertyId(propertyId);
        booking.setUserId(userId);
        booking.setCheckInDate(LocalDate.now().plusDays(1));
        booking.setCheckOutDate(LocalDate.now().plusDays(3));
        booking.setGuests(2);
        booking.setStatus(status);
        return booking;
    }
}
