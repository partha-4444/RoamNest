package com.roamnest.backend.service;

import com.roamnest.backend.dao.PropertyDao;
import com.roamnest.backend.dao.UserDao;
import com.roamnest.backend.dto.CreatePropertyRequest;
import com.roamnest.backend.dto.PropertyResponse;
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
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PropertyServiceTest {

    @Mock
    private PropertyDao propertyDao;

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
