package com.roamnest.backend.dto;

public class AdminSummaryResponse {

    private final long adminCount;
    private final long ownerCount;
    private final long userCount;
    private final long totalProperties;
    private final long availableProperties;
    private final long pendingBookings;
    private final long approvedBookings;
    private final long rejectedBookings;
    private final long cancelledBookings;
    private final double overallAverageRating;

    public AdminSummaryResponse(long adminCount,
                                long ownerCount,
                                long userCount,
                                long totalProperties,
                                long availableProperties,
                                long pendingBookings,
                                long approvedBookings,
                                long rejectedBookings,
                                long cancelledBookings,
                                double overallAverageRating) {
        this.adminCount = adminCount;
        this.ownerCount = ownerCount;
        this.userCount = userCount;
        this.totalProperties = totalProperties;
        this.availableProperties = availableProperties;
        this.pendingBookings = pendingBookings;
        this.approvedBookings = approvedBookings;
        this.rejectedBookings = rejectedBookings;
        this.cancelledBookings = cancelledBookings;
        this.overallAverageRating = overallAverageRating;
    }

    public long getAdminCount() { return adminCount; }
    public long getOwnerCount() { return ownerCount; }
    public long getUserCount() { return userCount; }
    public long getTotalProperties() { return totalProperties; }
    public long getAvailableProperties() { return availableProperties; }
    public long getPendingBookings() { return pendingBookings; }
    public long getApprovedBookings() { return approvedBookings; }
    public long getRejectedBookings() { return rejectedBookings; }
    public long getCancelledBookings() { return cancelledBookings; }
    public double getOverallAverageRating() { return overallAverageRating; }
}
