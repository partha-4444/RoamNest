package com.roamnest.backend.entity;

import jakarta.persistence.*;

@Entity // Tells Spring "Make a database table out of this class"
@Table(name = "user_data") // Tells Spring to name the table "user_data"
public class User {

    @Id // Tells Spring this is the primary key (the unique identifier for each row)
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Tells the database to auto-generate this ID (1, 2, 3...)
    private Long id;

    // By default, Spring will turn 'fullName' into a column named 'full_name'
    private String fullName;

    // We can enforce rules! E.g. username cannot be empty, and no two people can
    // have the same username.
    @Column(nullable = false, unique = true)
    private String username;

    private String role; // e.g., "ADMIN", "OWNER", "USER"

    private String phoneNo;

    private String address;

    // Constructors, Getters, and Setters need to go here so Spring can read/write
    // the data.
    public User() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getPhoneNo() {
        return phoneNo;
    }

    public void setPhoneNo(String phoneNo) {
        this.phoneNo = phoneNo;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }
}
