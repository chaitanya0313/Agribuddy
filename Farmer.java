package com.agribuddy.agribuddy_backend.Entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "farmer")
public class Farmer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    @Column(unique = true)
    private String phone;      // NEW: for login + OTP

    private LocalDate dob;     // NEW: date of birth

    private String password;

    // OTP fields
    private String otp;
    private java.time.LocalDateTime otpExpiry;

    public Farmer() {}

    public Farmer(String name, String email, String phone, LocalDate dob, String password) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.dob = dob;
        this.password = password;
    }

    // --- Getters & Setters ---

    public Long getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public LocalDate getDob() { return dob; }
    public void setDob(LocalDate dob) { this.dob = dob; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }

    public java.time.LocalDateTime getOtpExpiry() { return otpExpiry; }
    public void setOtpExpiry(java.time.LocalDateTime otpExpiry) { this.otpExpiry = otpExpiry; }
}