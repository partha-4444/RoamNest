package com.roamnest.backend.service;

import com.roamnest.backend.dao.PropertyDao;
import com.roamnest.backend.dao.PropertyReviewDao;
import com.roamnest.backend.dao.UserDao;
import com.roamnest.backend.dao.WishlistDao;
import com.roamnest.backend.dto.CreateWishlistRequest;
import com.roamnest.backend.dto.ReviewSummary;
import com.roamnest.backend.dto.WishlistDetailResponse;
import com.roamnest.backend.dto.WishlistSummaryResponse;
import com.roamnest.backend.model.PropertyRecord;
import com.roamnest.backend.model.UserAccount;
import com.roamnest.backend.model.WishlistRecord;
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
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WishlistServiceTest {

    @Mock
    private WishlistDao wishlistDao;

    @Mock
    private PropertyDao propertyDao;

    @Mock
    private PropertyReviewDao reviewDao;

    @Mock
    private UserDao userDao;

    @InjectMocks
    private WishlistService wishlistService;

    @Test
    void listWishlistsRequiresUserRole() {
        when(userDao.findByUsername("owner@example.com")).thenReturn(Optional.of(user(5L, "OWNER")));

        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> wishlistService.listWishlists("owner@example.com"));

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
        verify(wishlistDao, never()).findByUserId(5L);
    }

    @Test
    void listWishlistsReturnsCurrentUserCollections() {
        when(userDao.findByUsername("user@example.com")).thenReturn(Optional.of(user(2L, "USER")));
        when(wishlistDao.findByUserId(2L)).thenReturn(List.of(wishlist(10L, 2L, "Summer 2026", 3)));

        List<WishlistSummaryResponse> response = wishlistService.listWishlists("user@example.com");

        assertEquals(1, response.size());
        assertEquals("Summer 2026", response.get(0).getName());
        assertEquals(3, response.get(0).getPropertyCount());
    }

    @Test
    void createWishlistTrimsNameAndReturnsDetail() {
        CreateWishlistRequest request = new CreateWishlistRequest();
        request.setName("  Summer 2026  ");
        when(userDao.findByUsername("user@example.com")).thenReturn(Optional.of(user(2L, "USER")));
        when(wishlistDao.create(2L, "Summer 2026")).thenReturn(10L);
        when(wishlistDao.findByIdAndUserId(10L, 2L)).thenReturn(Optional.of(wishlist(10L, 2L, "Summer 2026", 0)));
        when(wishlistDao.findProperties(10L, 2L)).thenReturn(List.of());

        WishlistDetailResponse response = wishlistService.createWishlist("user@example.com", request);

        ArgumentCaptor<String> nameCaptor = ArgumentCaptor.forClass(String.class);
        verify(wishlistDao).create(org.mockito.ArgumentMatchers.eq(2L), nameCaptor.capture());
        assertEquals("Summer 2026", nameCaptor.getValue());
        assertEquals("Summer 2026", response.getName());
    }

    @Test
    void getWishlistRejectsCollectionsOwnedByAnotherUser() {
        when(userDao.findByUsername("user@example.com")).thenReturn(Optional.of(user(2L, "USER")));
        when(wishlistDao.findByIdAndUserId(99L, 2L)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> wishlistService.getWishlist("user@example.com", 99L));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    @Test
    void addPropertyRequiresAvailableProperty() {
        when(userDao.findByUsername("user@example.com")).thenReturn(Optional.of(user(2L, "USER")));
        when(wishlistDao.findByIdAndUserId(10L, 2L)).thenReturn(Optional.of(wishlist(10L, 2L, "Summer 2026", 0)));
        when(propertyDao.findById(55L)).thenReturn(Optional.of(property(55L, false)));

        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> wishlistService.addProperty("user@example.com", 10L, 55L));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        verify(wishlistDao, never()).addProperty(10L, 55L);
    }

    @Test
    void addPropertyReturnsUpdatedWishlistDetail() {
        when(userDao.findByUsername("user@example.com")).thenReturn(Optional.of(user(2L, "USER")));
        when(wishlistDao.findByIdAndUserId(10L, 2L)).thenReturn(Optional.of(wishlist(10L, 2L, "Summer 2026", 1)));
        when(propertyDao.findById(55L)).thenReturn(Optional.of(property(55L, true)));
        when(wishlistDao.findProperties(10L, 2L)).thenReturn(List.of(property(55L, true)));
        when(reviewDao.findSummariesForPropertyIds(anyList())).thenReturn(Map.of(55L, new ReviewSummary(4.8, 6)));

        WishlistDetailResponse response = wishlistService.addProperty("user@example.com", 10L, 55L);

        verify(wishlistDao).addProperty(10L, 55L);
        assertEquals(1, response.getPropertyCount());
        assertEquals(55L, response.getProperties().get(0).getId());
        assertEquals(4.8, response.getProperties().get(0).getReviewSummary().getAverageRating());
    }

    @Test
    void duplicateAddCallsIdempotentDaoOperation() {
        when(userDao.findByUsername("user@example.com")).thenReturn(Optional.of(user(2L, "USER")));
        when(wishlistDao.findByIdAndUserId(10L, 2L)).thenReturn(Optional.of(wishlist(10L, 2L, "Summer 2026", 1)));
        when(propertyDao.findById(55L)).thenReturn(Optional.of(property(55L, true)));
        when(wishlistDao.findProperties(10L, 2L)).thenReturn(List.of(property(55L, true)));
        when(reviewDao.findSummariesForPropertyIds(anyList())).thenReturn(Map.of());

        wishlistService.addProperty("user@example.com", 10L, 55L);
        wishlistService.addProperty("user@example.com", 10L, 55L);

        verify(wishlistDao, times(2)).addProperty(10L, 55L);
    }

    private UserAccount user(Long id, String role) {
        UserAccount user = new UserAccount();
        user.setId(id);
        user.setUsername(role.toLowerCase() + "@example.com");
        user.setRole(role);
        user.setEnabled(true);
        return user;
    }

    private WishlistRecord wishlist(Long id, Long userId, String name, int propertyCount) {
        WishlistRecord wishlist = new WishlistRecord();
        wishlist.setId(id);
        wishlist.setUserId(userId);
        wishlist.setName(name);
        wishlist.setPropertyCount(propertyCount);
        return wishlist;
    }

    private PropertyRecord property(Long id, boolean available) {
        PropertyRecord property = new PropertyRecord();
        property.setId(id);
        property.setOwnerId(8L);
        property.setTitle("Lake House");
        property.setDescription("A peaceful stay by the lake");
        property.setLocation("Pokhara");
        property.setPricePerNight(new BigDecimal("120.00"));
        property.setMaxGuests(4);
        property.setAvailable(available);
        return property;
    }
}
