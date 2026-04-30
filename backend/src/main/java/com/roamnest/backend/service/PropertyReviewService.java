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
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
public class PropertyReviewService {

    private static final String ROLE_USER = "USER";
    private static final String STATUS_APPROVED = "APPROVED";

    private final PropertyReviewDao reviewDao;
    private final BookingDao bookingDao;
    private final PropertyDao propertyDao;
    private final UserDao userDao;

    public PropertyReviewService(PropertyReviewDao reviewDao,
                                 BookingDao bookingDao,
                                 PropertyDao propertyDao,
                                 UserDao userDao) {
        this.reviewDao = reviewDao;
        this.bookingDao = bookingDao;
        this.propertyDao = propertyDao;
        this.userDao = userDao;
    }

    @Transactional
    public PropertyReviewResponse createReview(String username, Long bookingId, CreateReviewRequest request) {
        UserAccount user = getCurrentUser(username);
        requireRole(user, ROLE_USER, "Only users can leave reviews");

        BookingRecord booking = bookingDao.findById(bookingId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (!booking.getUserId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not the guest for this booking");
        }
        if (!STATUS_APPROVED.equals(booking.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Reviews can only be left for approved bookings");
        }
        if (!booking.getCheckOutDate().isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Reviews can only be submitted after the trip has ended");
        }
        if (reviewDao.existsByBookingId(bookingId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "A review for this booking already exists");
        }

        PropertyReviewRecord record = new PropertyReviewRecord();
        record.setBookingId(bookingId);
        record.setPropertyId(booking.getPropertyId());
        record.setUserId(user.getId());
        record.setRating(request.getRating());
        record.setComment(request.getComment() != null ? request.getComment().trim() : null);

        Long reviewId = reviewDao.create(record);
        if (reviewId == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to create review");
        }

        return reviewDao.findById(reviewId)
            .map(this::toResponse)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Created review not found"));
    }

    public List<PropertyReviewResponse> listReviewsForProperty(String username, Long propertyId) {
        getCurrentUser(username);
        propertyDao.findById(propertyId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));

        return reviewDao.findByPropertyId(propertyId)
            .stream()
            .map(this::toResponse)
            .toList();
    }

    private UserAccount getCurrentUser(String username) {
        return userDao.findByUsername(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private void requireRole(UserAccount user, String expectedRole, String message) {
        if (!expectedRole.equals(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, message);
        }
    }

    private PropertyReviewResponse toResponse(PropertyReviewRecord record) {
        return new PropertyReviewResponse(
            record.getId(),
            record.getBookingId(),
            record.getPropertyId(),
            record.getUserId(),
            record.getRating(),
            record.getComment(),
            record.getCreatedAt(),
            record.getUpdatedAt());
    }
}
