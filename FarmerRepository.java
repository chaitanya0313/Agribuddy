package com.agribuddy.agribuddy_backend.repository;

import com.agribuddy.agribuddy_backend.Entity.Farmer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FarmerRepository extends JpaRepository<Farmer, Long> {
    Farmer findByEmail(String email);
    Farmer findByPhone(String phone);   // NEW: for phone-based login + OTP
}