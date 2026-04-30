package com.roamnest.backend.controller;

import com.roamnest.backend.dto.CreateWishlistRequest;
import com.roamnest.backend.dto.WishlistDetailResponse;
import com.roamnest.backend.dto.WishlistSummaryResponse;
import com.roamnest.backend.service.WishlistService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/wishlists")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    public ResponseEntity<List<WishlistSummaryResponse>> listWishlists(Authentication authentication) {
        return ResponseEntity.ok(wishlistService.listWishlists(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<WishlistDetailResponse> createWishlist(Authentication authentication,
                                                                @Valid @RequestBody CreateWishlistRequest request) {
        WishlistDetailResponse response = wishlistService.createWishlist(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{wishlistId}")
    public ResponseEntity<WishlistDetailResponse> getWishlist(Authentication authentication,
                                                             @PathVariable Long wishlistId) {
        return ResponseEntity.ok(wishlistService.getWishlist(authentication.getName(), wishlistId));
    }

    @PostMapping("/{wishlistId}/properties/{propertyId}")
    public ResponseEntity<WishlistDetailResponse> addProperty(Authentication authentication,
                                                             @PathVariable Long wishlistId,
                                                             @PathVariable Long propertyId) {
        return ResponseEntity.ok(wishlistService.addProperty(authentication.getName(), wishlistId, propertyId));
    }

    @DeleteMapping("/{wishlistId}/properties/{propertyId}")
    public ResponseEntity<Void> removeProperty(Authentication authentication,
                                               @PathVariable Long wishlistId,
                                               @PathVariable Long propertyId) {
        wishlistService.removeProperty(authentication.getName(), wishlistId, propertyId);
        return ResponseEntity.noContent().build();
    }
}
