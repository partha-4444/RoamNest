package com.roamnest.backend.service;

import com.roamnest.backend.dao.BookingDao;
import com.roamnest.backend.dao.BookingMessageDao;
import com.roamnest.backend.dao.PropertyDao;
import com.roamnest.backend.dao.UserDao;
import com.roamnest.backend.dto.BookingMessageResponse;
import com.roamnest.backend.dto.CreateMessageRequest;
import com.roamnest.backend.model.BookingMessageRecord;
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
import java.time.OffsetDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingMessageServiceTest {

    @Mock
    private BookingMessageDao messageDao;

    @Mock
    private BookingDao bookingDao;

    @Mock
    private PropertyDao propertyDao;

    @Mock
    private UserDao userDao;

    @InjectMocks
    private BookingMessageService bookingMessageService;

    @Test
    void sendMessageRejectsPendingBooking() {
        when(userDao.findByUsername("user@example.com")).thenReturn(Optional.of(user(20L, "USER")));
        when(bookingDao.findById(1L)).thenReturn(Optional.of(booking(1L, 10L, 20L, "PENDING")));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> bookingMessageService.sendMessage("user@example.com", 1L, messageRequest("Hello")));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(messageDao, never()).create(any());
    }

    @Test
    void sendMessageRejectsNonGuestUser() {
        when(userDao.findByUsername("other@example.com")).thenReturn(Optional.of(user(99L, "USER")));
        when(bookingDao.findById(1L)).thenReturn(Optional.of(booking(1L, 10L, 20L, "APPROVED")));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> bookingMessageService.sendMessage("other@example.com", 1L, messageRequest("Hi")));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(messageDao, never()).create(any());
    }

    @Test
    void sendMessageRejectsOwnerWhoDoesNotOwnProperty() {
        when(userDao.findByUsername("owner@example.com")).thenReturn(Optional.of(user(7L, "OWNER")));
        when(bookingDao.findById(1L)).thenReturn(Optional.of(booking(1L, 10L, 20L, "APPROVED")));
        when(propertyDao.findById(10L)).thenReturn(Optional.of(property(10L, 5L)));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> bookingMessageService.sendMessage("owner@example.com", 1L, messageRequest("Hello guest")));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(messageDao, never()).create(any());
    }

    @Test
    void guestMessageHasGuestSenderRole() {
        BookingMessageRecord saved = message(55L, 1L, 20L, "Hello owner");
        when(userDao.findByUsername("user@example.com")).thenReturn(Optional.of(user(20L, "USER")));
        when(bookingDao.findById(1L)).thenReturn(Optional.of(booking(1L, 10L, 20L, "APPROVED")));
        when(messageDao.create(any(BookingMessageRecord.class))).thenReturn(55L);
        when(messageDao.findById(55L)).thenReturn(Optional.of(saved));

        BookingMessageResponse response = bookingMessageService.sendMessage(
            "user@example.com", 1L, messageRequest("Hello owner"));

        ArgumentCaptor<BookingMessageRecord> captor = ArgumentCaptor.forClass(BookingMessageRecord.class);
        verify(messageDao).create(captor.capture());
        assertEquals(20L, captor.getValue().getSenderId());
        assertEquals(1L, captor.getValue().getBookingId());
        assertEquals(55L, response.getId());
        assertEquals("GUEST", response.getSenderRole());
    }

    @Test
    void ownerMessageHasOwnerSenderRole() {
        BookingMessageRecord saved = message(56L, 1L, 5L, "Welcome!");
        when(userDao.findByUsername("owner@example.com")).thenReturn(Optional.of(user(5L, "OWNER")));
        when(bookingDao.findById(1L)).thenReturn(Optional.of(booking(1L, 10L, 20L, "APPROVED")));
        when(propertyDao.findById(10L)).thenReturn(Optional.of(property(10L, 5L)));
        when(messageDao.create(any(BookingMessageRecord.class))).thenReturn(56L);
        when(messageDao.findById(56L)).thenReturn(Optional.of(saved));

        BookingMessageResponse response = bookingMessageService.sendMessage(
            "owner@example.com", 1L, messageRequest("Welcome!"));

        ArgumentCaptor<BookingMessageRecord> captor = ArgumentCaptor.forClass(BookingMessageRecord.class);
        verify(messageDao).create(captor.capture());
        assertEquals(5L, captor.getValue().getSenderId());
        assertEquals(56L, response.getId());
        assertEquals("OWNER", response.getSenderRole());
    }

    @Test
    void senderRoleIsGuestWhenSenderMatchesBookingUserId() {
        // booking.userId = 20; sender = 20 → GUEST
        BookingMessageRecord saved = message(60L, 1L, 20L, "Test");
        when(userDao.findByUsername("user@example.com")).thenReturn(Optional.of(user(20L, "USER")));
        when(bookingDao.findById(1L)).thenReturn(Optional.of(booking(1L, 10L, 20L, "APPROVED")));
        when(messageDao.create(any())).thenReturn(60L);
        when(messageDao.findById(60L)).thenReturn(Optional.of(saved));

        BookingMessageResponse response = bookingMessageService.sendMessage(
            "user@example.com", 1L, messageRequest("Test"));

        assertEquals("GUEST", response.getSenderRole());
    }

    private CreateMessageRequest messageRequest(String text) {
        CreateMessageRequest req = new CreateMessageRequest();
        req.setMessage(text);
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

    private BookingRecord booking(Long id, Long propertyId, Long userId, String status) {
        BookingRecord booking = new BookingRecord();
        booking.setId(id);
        booking.setPropertyId(propertyId);
        booking.setUserId(userId);
        booking.setCheckInDate(LocalDate.now().minusDays(5));
        booking.setCheckOutDate(LocalDate.now().minusDays(2));
        booking.setGuests(2);
        booking.setStatus(status);
        return booking;
    }

    private PropertyRecord property(Long id, Long ownerId) {
        PropertyRecord property = new PropertyRecord();
        property.setId(id);
        property.setOwnerId(ownerId);
        property.setTitle("Beach Villa");
        property.setLocation("Goa");
        property.setPricePerNight(new BigDecimal("200.00"));
        property.setMaxGuests(4);
        property.setAvailable(true);
        return property;
    }

    private BookingMessageRecord message(Long id, Long bookingId, Long senderId, String text) {
        BookingMessageRecord msg = new BookingMessageRecord();
        msg.setId(id);
        msg.setBookingId(bookingId);
        msg.setSenderId(senderId);
        msg.setMessage(text);
        msg.setCreatedAt(OffsetDateTime.now());
        return msg;
    }
}
