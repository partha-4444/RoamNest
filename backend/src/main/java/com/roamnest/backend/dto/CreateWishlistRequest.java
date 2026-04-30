package com.roamnest.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateWishlistRequest {
    @NotBlank(message = "Wishlist name is required")
    @Size(max = 120, message = "Wishlist name must be 120 characters or fewer")
    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
