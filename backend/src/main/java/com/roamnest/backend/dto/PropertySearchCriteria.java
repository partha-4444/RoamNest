package com.roamnest.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class PropertySearchCriteria {

    private final String location;
    private final BigDecimal minPrice;
    private final BigDecimal maxPrice;
    private final Integer minGuests;
    private final LocalDate checkInDate;
    private final LocalDate checkOutDate;
    private final String sort;

    public PropertySearchCriteria(String location,
                                  BigDecimal minPrice,
                                  BigDecimal maxPrice,
                                  Integer minGuests,
                                  LocalDate checkInDate,
                                  LocalDate checkOutDate,
                                  String sort) {
        this.location = location;
        this.minPrice = minPrice;
        this.maxPrice = maxPrice;
        this.minGuests = minGuests;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.sort = sort;
    }

    public String getLocation() { return location; }
    public BigDecimal getMinPrice() { return minPrice; }
    public BigDecimal getMaxPrice() { return maxPrice; }
    public Integer getMinGuests() { return minGuests; }
    public LocalDate getCheckInDate() { return checkInDate; }
    public LocalDate getCheckOutDate() { return checkOutDate; }
    public String getSort() { return sort; }

    public boolean hasDateFilter() {
        return checkInDate != null && checkOutDate != null;
    }
}
