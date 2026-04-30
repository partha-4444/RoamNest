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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PropertyServiceTest {

    @Mock
    private PropertyDao propertyDao;

    @Mock
    private PropertyReviewDao reviewDao;

    @Mock
    private UserDao userDao;

    @InjectMocks
    private PropertyService propertyService;

    @Test
    void createPropertyRequiresOwnerRole() {
        when(userDao.findByUsername("user@example.com")).thenReturn(Optional.of(user(1L, "USER")));

        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> propertyService.createProperty("user@example.com", createPropertyRequest()));

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
        verify(propertyDao, never()).create(any());
    }

    @Test
    void createPropertyPersistsOwnerProperty() {
        CreatePropertyRequest request = createPropertyRequest();
        PropertyRecord createdProperty = property(10L, 5L);
        when(userDao.findByUsername("owner@example.com")).thenReturn(Optional.of(user(5L, "OWNER")));
        when(propertyDao.create(any(PropertyRecord.class))).thenReturn(10L);
        when(propertyDao.findById(10L)).thenReturn(Optional.of(createdProperty));

        PropertyResponse response = propertyService.createProperty("owner@example.com", request);

        ArgumentCaptor<PropertyRecord> propertyCaptor = ArgumentCaptor.forClass(PropertyRecord.class);
        verify(propertyDao).create(propertyCaptor.capture());
        assertEquals(5L, propertyCaptor.getValue().getOwnerId());
        assertTrue(propertyCaptor.getValue().isAvailable());
        assertEquals(10L, response.getId());
    }

    @Test
    void createPropertyIncludesZeroReviewSummaryForNewProperty() {
        when(userDao.findByUsername("owner@example.com")).thenReturn(Optional.of(user(5L, "OWNER")));
        when(propertyDao.create(any(PropertyRecord.class))).thenReturn(10L);
        when(propertyDao.findById(10L)).thenReturn(Optional.of(property(10L, 5L)));

        PropertyResponse response = propertyService.createProperty("owner@example.com", createPropertyRequest());

        assertEquals(0, response.getReviewSummary().getReviewCount());
        assertEquals(0.0, response.getReviewSummary().getAverageRating());
    }

    @Test
    void searchPropertiesAllowsOwnerRole() {
        when(userDao.findByUsername("owner@example.com")).thenReturn(Optional.of(user(5L, "OWNER")));
        when(propertyDao.search(any(PropertySearchCriteria.class))).thenReturn(List.of(property(10L, 99L)));
        when(reviewDao.findSummariesForPropertyIds(anyList())).thenReturn(Map.of(10L, new ReviewSummary(4.5, 3)));

        List<PropertyResponse> results = propertyService.searchProperties(
            "owner@example.com",
            new PropertySearchCriteria("Pokhara", null, null, null, null, null, null));

        assertEquals(1, results.size());
        assertEquals(3, results.get(0).getReviewSummary().getReviewCount());
        assertEquals(4.5, results.get(0).getReviewSummary().getAverageRating());
    }

    @Test
    void searchPropertiesRejectsAdminRole() {
        when(userDao.findByUsername("admin@example.com")).thenReturn(Optional.of(user(1L, "ADMIN")));

        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> propertyService.searchProperties("admin@example.com",
                new PropertySearchCriteria(null, null, null, null, null, null, null)));

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
    }

    @Test
    void searchPropertiesRejectsInvalidDateRange() {
        when(userDao.findByUsername("user@example.com")).thenReturn(Optional.of(user(1L, "USER")));

        java.time.LocalDate today = java.time.LocalDate.now();
        PropertySearchCriteria badCriteria = new PropertySearchCriteria(
            null, null, null, null, today.plusDays(3), today.plusDays(1), null);

        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> propertyService.searchProperties("user@example.com", badCriteria));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    void listAvailablePropertiesAttachesReviewSummaries() {
        when(userDao.findByUsername("user@example.com")).thenReturn(Optional.of(user(2L, "USER")));
        when(propertyDao.findAvailable()).thenReturn(List.of(property(10L, 5L), property(11L, 5L)));
        when(reviewDao.findSummariesForPropertyIds(List.of(10L, 11L)))
            .thenReturn(Map.of(10L, new ReviewSummary(4.0, 2)));

        List<PropertyResponse> results = propertyService.listAvailableProperties("user@example.com");

        assertEquals(2, results.size());
        assertEquals(4.0, results.get(0).getReviewSummary().getAverageRating());
        assertEquals(2, results.get(0).getReviewSummary().getReviewCount());
        // property 11 had no reviews — defaults to 0
        assertEquals(0.0, results.get(1).getReviewSummary().getAverageRating());
        assertEquals(0, results.get(1).getReviewSummary().getReviewCount());
    }

    private CreatePropertyRequest createPropertyRequest() {
        CreatePropertyRequest request = new CreatePropertyRequest();
        request.setTitle("Lake House");
        request.setLocation("Pokhara");
        request.setPricePerNight(new BigDecimal("120.00"));
        request.setMaxGuests(4);
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

    private PropertyRecord property(Long id, Long ownerId) {
        PropertyRecord property = new PropertyRecord();
        property.setId(id);
        property.setOwnerId(ownerId);
        property.setTitle("Lake House");
        property.setLocation("Pokhara");
        property.setPricePerNight(new BigDecimal("120.00"));
        property.setMaxGuests(4);
        property.setAvailable(true);
        return property;
    }
}
