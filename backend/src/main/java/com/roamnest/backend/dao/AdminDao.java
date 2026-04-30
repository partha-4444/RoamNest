package com.roamnest.backend.dao;

import com.roamnest.backend.dto.AdminBookingResponse;
import com.roamnest.backend.dto.AdminPropertyResponse;
import com.roamnest.backend.dto.AdminSummaryResponse;

import java.util.List;

public interface AdminDao {

    AdminSummaryResponse findSummary();

    List<AdminPropertyResponse> findAllProperties();

    /** @param status nullable — null returns all statuses */
    List<AdminBookingResponse> findAllBookings(String status);
}
