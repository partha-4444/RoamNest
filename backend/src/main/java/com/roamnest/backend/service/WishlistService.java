package com.roamnest.backend.service;

import com.roamnest.backend.dao.PropertyDao;
import com.roamnest.backend.dao.PropertyReviewDao;
import com.roamnest.backend.dao.UserDao;
import com.roamnest.backend.dao.WishlistDao;
import com.roamnest.backend.dto.CreateWishlistRequest;
import com.roamnest.backend.dto.PropertyResponse;
import com.roamnest.backend.dto.ReviewSummary;
import com.roamnest.backend.dto.WishlistDetailResponse;
import com.roamnest.backend.dto.WishlistSummaryResponse;
import com.roamnest.backend.model.PropertyRecord;
import com.roamnest.backend.model.UserAccount;
import com.roamnest.backend.model.WishlistRecord;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class WishlistService {

    private static final String ROLE_USER = "USER";

    private final WishlistDao wishlistDao;
    private final PropertyDao propertyDao;
    private final PropertyReviewDao reviewDao;
    private final UserDao userDao;

    public WishlistService(WishlistDao wishlistDao,
                           PropertyDao propertyDao,
                           PropertyReviewDao reviewDao,
                           UserDao userDao) {
        this.wishlistDao = wishlistDao;
        this.propertyDao = propertyDao;
        this.reviewDao = reviewDao;
        this.userDao = userDao;
    }

    public List<WishlistSummaryResponse> listWishlists(String username) {
        UserAccount user = getCurrentUser(username);
        requireUser(user);
        return wishlistDao.findByUserId(user.getId()).stream()
            .map(this::toSummaryResponse)
            .toList();
    }

    @Transactional
    public WishlistDetailResponse createWishlist(String username, CreateWishlistRequest request) {
        UserAccount user = getCurrentUser(username);
        requireUser(user);
        String name = normalizeName(request.getName());

        Long wishlistId;
        try {
            wishlistId = wishlistDao.create(user.getId(), name);
        } catch (DuplicateKeyException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Wishlist name already exists");
        }
        if (wishlistId == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to create wishlist");
        }
        return getWishlist(username, wishlistId);
    }

    public WishlistDetailResponse getWishlist(String username, Long wishlistId) {
        UserAccount user = getCurrentUser(username);
        requireUser(user);
        WishlistRecord wishlist = getOwnedWishlist(wishlistId, user.getId());
        List<PropertyRecord> properties = wishlistDao.findProperties(wishlistId, user.getId());
        return toDetailResponse(wishlist, properties);
    }

    @Transactional
    public WishlistDetailResponse addProperty(String username, Long wishlistId, Long propertyId) {
        UserAccount user = getCurrentUser(username);
        requireUser(user);
        getOwnedWishlist(wishlistId, user.getId());

        PropertyRecord property = propertyDao.findById(propertyId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));
        if (!property.isAvailable()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Property is not available");
        }

        wishlistDao.addProperty(wishlistId, propertyId);
        return getWishlist(username, wishlistId);
    }

    @Transactional
    public void removeProperty(String username, Long wishlistId, Long propertyId) {
        UserAccount user = getCurrentUser(username);
        requireUser(user);
        getOwnedWishlist(wishlistId, user.getId());
        wishlistDao.removeProperty(wishlistId, propertyId);
    }

    private WishlistRecord getOwnedWishlist(Long wishlistId, Long userId) {
        return wishlistDao.findByIdAndUserId(wishlistId, userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Wishlist not found"));
    }

    private UserAccount getCurrentUser(String username) {
        return userDao.findByUsername(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private void requireUser(UserAccount user) {
        if (!ROLE_USER.equals(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only users can manage wishlists");
        }
    }

    private String normalizeName(String name) {
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Wishlist name is required");
        }
        return name.trim();
    }

    private WishlistSummaryResponse toSummaryResponse(WishlistRecord wishlist) {
        return new WishlistSummaryResponse(
            wishlist.getId(),
            wishlist.getName(),
            wishlist.getPropertyCount(),
            wishlist.getCreatedAt(),
            wishlist.getUpdatedAt());
    }

    private WishlistDetailResponse toDetailResponse(WishlistRecord wishlist, List<PropertyRecord> properties) {
        List<PropertyResponse> propertyResponses = attachSummariesAndMap(properties);
        return new WishlistDetailResponse(
            wishlist.getId(),
            wishlist.getName(),
            propertyResponses.size(),
            propertyResponses,
            wishlist.getCreatedAt(),
            wishlist.getUpdatedAt());
    }

    private List<PropertyResponse> attachSummariesAndMap(List<PropertyRecord> properties) {
        if (properties.isEmpty()) {
            return List.of();
        }
        List<Long> ids = properties.stream().map(PropertyRecord::getId).collect(Collectors.toList());
        Map<Long, ReviewSummary> summaries = reviewDao.findSummariesForPropertyIds(ids);
        return properties.stream()
            .map(p -> toPropertyResponse(p, summaries.getOrDefault(p.getId(), new ReviewSummary(0.0, 0))))
            .toList();
    }

    private PropertyResponse toPropertyResponse(PropertyRecord property, ReviewSummary summary) {
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
}
