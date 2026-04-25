package com.roamnest.backend.dto;

public class UserDetailsResponse {
    private final Long id;
    private final String fullName;
    private final String username;
    private final String role;
    private final String phoneNo;
    private final String address;

    public UserDetailsResponse(Long id,
                               String fullName,
                               String username,
                               String role,
                               String phoneNo,
                               String address) {
        this.id = id;
        this.fullName = fullName;
        this.username = username;
        this.role = role;
        this.phoneNo = phoneNo;
        this.address = address;
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getUsername() {
        return username;
    }

    public String getRole() {
        return role;
    }

    public String getPhoneNo() {
        return phoneNo;
    }

    public String getAddress() {
        return address;
    }
}
