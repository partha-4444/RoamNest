package com.roamnest.backend.service;

import com.roamnest.backend.dao.PropertyDao;
import com.roamnest.backend.dao.UserDao;
import com.roamnest.backend.dto.CreatePropertyRequest;
import com.roamnest.backend.dto.PropertyResponse;
import com.roamnest.backend.model.PropertyRecord;
import com.roamnest.backend.model.UserAccount;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class PropertyService {

    private static final String ROLE_OWNER = "OWNER";
    private static final String ROLE_USER = "USER";

    private final PropertyDao propertyDao;
    private final UserDao userDao;

    public PropertyService(PropertyDao propertyDao, UserDao userDao) {
        this.propertyDao = propertyDao;
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
            .map(this::toResponse)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Created property not found"));
    }

    public List<PropertyResponse> listAvailableProperties(String username) {
        UserAccount user = getCurrentUser(username);
        requireRole(user, ROLE_USER, "Only users can list properties");
        return propertyDao.findAvailable().stream().map(this::toResponse).toList();
    }

    public List<PropertyResponse> searchAvailableProperties(String username, String location) {
        UserAccount user = getCurrentUser(username);
        requireRole(user, ROLE_USER, "Only users can search properties");
        if (location == null || location.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Location is required");
        }
        return propertyDao.searchAvailableByLocation(location.trim()).stream().map(this::toResponse).toList();
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

    private PropertyResponse toResponse(PropertyRecord property) {
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
