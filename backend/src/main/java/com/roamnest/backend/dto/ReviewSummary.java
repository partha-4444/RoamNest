package com.roamnest.backend.dto;

public class ReviewSummary {

    private final double averageRating;
    private final int reviewCount;

    public ReviewSummary(double averageRating, int reviewCount) {
        this.averageRating = averageRating;
        this.reviewCount = reviewCount;
    }

    public double getAverageRating() {
        return averageRating;
    }

    public int getReviewCount() {
        return reviewCount;
    }
}
