package com.roamnest.backend.service;

import com.roamnest.backend.dao.PropertyDao;
import com.roamnest.backend.dao.PropertyReviewDao;
import com.roamnest.backend.dao.UserDao;
import com.roamnest.backend.dto.CreatePropertyRequest;
import com.roamnest.backend.dto.PropertyResponse;
import com.roamnest.backend.dto.PropertySearchCriteria;
import com.roamnest.backend.dto.ReviewSummary;
import com.roamnest.backend.model.PropertyRecord;
import com.roamnest.backend.model.UserAccount;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PropertyService {

    private static final String ROLE_OWNER = "OWNER";
    private static final String ROLE_USER = "USER";

    private final PropertyDao propertyDao;
    private final PropertyReviewDao reviewDao;
    private final UserDao userDao;

    public PropertyService(PropertyDao propertyDao, PropertyReviewDao reviewDao, UserDao userDao) {
        this.propertyDao = propertyDao;
        this.reviewDao = reviewDao;
        this.userDao = userDao;
    }

    @Transactional
    public PropertyResponse createProperty(String username, CreatePropertyRequest request) {
        UserAccount owner = getCurrentUser(username);
        requireRole(owner, ROLE_OWNER, "Only owners can add properties");

        PropertyRecord property = new PropertyRecord();
        property.setOwnerId(owner.getId());
        property.setTitle(request.getTitle().trim());
        property.setDescription(trimToNull(request.getDescription()));
        property.setLocation(request.getLocation().trim());
        property.setAddress(trimToNull(request.getAddress()));
        property.setPricePerNight(request.getPricePerNight());
        property.setMaxGuests(request.getMaxGuests());
        property.setAvailable(request.getAvailable() == null || request.getAvailable());

        Long propertyId = propertyDao.create(property);
        if (propertyId == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to create property");
        }

        return propertyDao.findById(propertyId)
            .map(p -> toResponse(p, new ReviewSummary(0.0, 0)))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Created property not found"));
    }

    public List<PropertyResponse> listAvailableProperties(String username) {
        UserAccount user = getCurrentUser(username);
        requireUserOrOwner(user);
        List<PropertyRecord> properties = propertyDao.findAvailable();
        return attachSummariesAndMap(properties);
    }

    /**
     * Unified search/filter endpoint — all params are optional.
     * Accessible to USER and OWNER roles.
     */
    public List<PropertyResponse> searchProperties(String username, PropertySearchCriteria criteria) {
        UserAccount user = getCurrentUser(username);
        requireUserOrOwner(user);

        if (criteria.hasDateFilter() && !criteria.getCheckOutDate().isAfter(criteria.getCheckInDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Check-out date must be after check-in date");
        }

        List<PropertyRecord> properties = propertyDao.search(criteria);
        return attachSummariesAndMap(properties);
    }

    public PropertyResponse getProperty(String username, Long propertyId) {
        UserAccount user = getCurrentUser(username);
        requireUserOrOwner(user);

        PropertyRecord property = propertyDao.findById(propertyId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));
        ReviewSummary summary = reviewDao.findSummariesForPropertyIds(List.of(propertyId))
            .getOrDefault(propertyId, new ReviewSummary(0.0, 0));
        return toResponse(property, summary);
    }

    @Deprecated
    public List<PropertyResponse> searchAvailableProperties(String username, String location) {
        return searchProperties(username, new PropertySearchCriteria(
            location, null, null, null, null, null, null));
    }

    private List<PropertyResponse> attachSummariesAndMap(List<PropertyRecord> properties) {
        if (properties.isEmpty()) {
            return List.of();
        }
        List<Long> ids = properties.stream().map(PropertyRecord::getId).collect(Collectors.toList());
        Map<Long, ReviewSummary> summaries = reviewDao.findSummariesForPropertyIds(ids);
        return properties.stream()
            .map(p -> toResponse(p, summaries.getOrDefault(p.getId(), new ReviewSummary(0.0, 0))))
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

    private void requireUserOrOwner(UserAccount user) {
        if (!ROLE_USER.equals(user.getRole()) && !ROLE_OWNER.equals(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "Only users and owners can browse properties");
        }
    }

    private PropertyResponse toResponse(PropertyRecord property, ReviewSummary summary) {
        return new PropertyResponse(
            property.getId(),
            property.getOwnerId(),
            property.getTitle(),
            property.getDescription(),
            property.getLocation(),
            property.getAddress(),
            property.getPricePerNight(),
            property.getMaxGuests(),
            property.isAvailable(),
            summary,
            property.getCreatedAt(),
            property.getUpdatedAt());
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
