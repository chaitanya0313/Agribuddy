package com.agribuddy.agribuddy_backend.controller;

import com.agribuddy.agribuddy_backend.Entity.Farmer;
import com.agribuddy.agribuddy_backend.repository.FarmerRepository;
import com.agribuddy.agribuddy_backend.service.OtpService;
import com.agribuddy.agribuddy_backend.config.JwtUtil; // Added Import
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/farmers")
@CrossOrigin(origins = "http://localhost:5173")
public class FarmerController {

    @Autowired
    private FarmerRepository farmerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil; // Added Injection

    @Autowired
    private OtpService otpService;

    // ─────────────────────────────────────────────
    // SIGNUP — email, phone, dob, password
    // ─────────────────────────────────────────────
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> body) {
        String name     = body.get("name");
        String email    = body.get("email");
        String phone    = body.get("phone");
        String dobStr   = body.get("dob");
        String password = body.get("password");

        // Validations
        if (name == null || email == null || phone == null || dobStr == null || password == null) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", "All fields are required"));
        }

        if (farmerRepository.findByEmail(email) != null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("success", false, "message", "Email already registered"));
        }

        if (farmerRepository.findByPhone(phone) != null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("success", false, "message", "Phone number already registered"));
        }

        Farmer farmer = new Farmer();
        farmer.setName(name);
        farmer.setEmail(email);
        farmer.setPhone(phone);
        farmer.setDob(LocalDate.parse(dobStr)); // expects "YYYY-MM-DD"
        farmer.setPassword(passwordEncoder.encode(password));

        farmerRepository.save(farmer);

        return ResponseEntity.ok(Map.of("success", true, "message", "Farmer registered successfully"));
    }

    // ─────────────────────────────────────────────
    // NEW LOGIN API — Now returns JWT token
    // ─────────────────────────────────────────────
    @PostMapping("/login/verify-password")
public ResponseEntity<?> verifyPassword(@RequestBody Map<String, String> body) {

    String phone = body.get("phone");
    String password = body.get("password");

    Farmer farmer = farmerRepository.findByPhone(phone);

    if (farmer == null) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Phone number not found"));
    }

    if (!passwordEncoder.matches(password, farmer.getPassword())) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid password"));
    }

    // ✅ Generate & store OTP
    String otp = otpService.generateOtp(phone);

    // ✅ Send email
    otpService.sendOtpEmail(farmer.getEmail(), otp);

    return ResponseEntity.ok(Map.of(
            "message", "OTP sent to " + maskEmail(farmer.getEmail())
    ));
}

@PostMapping("/login/verify-otp")
public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {

    String phone = body.get("phone");
    String otp = body.get("otp");

    Farmer farmer = farmerRepository.findByPhone(phone);

    if (farmer == null) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "User not found"));
    }

    boolean isValid = otpService.verifyOtp(phone, otp);

    if (!isValid) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid or expired OTP"));
    }

    // ✅ Generate JWT
    String token = jwtUtil.generateToken(farmer.getId(), farmer.getEmail());

    return ResponseEntity.ok(Map.of(
            "message", "Login successful",
            "token", token,
            "farmerId", farmer.getId(),
            "farmerName", farmer.getName()
    ));
}

    @PostMapping("/login")

    public ResponseEntity<?> login(@RequestBody Farmer farmer) {
        // Look up the farmer by email
        Farmer existingFarmer = farmerRepository.findByEmail(farmer.getEmail());

        if (existingFarmer == null) {
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("success", false, "message", "Email not found"));
        }

        // Verify the password matches
        if (!passwordEncoder.matches(farmer.getPassword(), existingFarmer.getPassword())) {
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("success", false, "message", "Invalid password"));
        }

        // Generate JWT carrying farmerId and email
        String token = jwtUtil.generateToken(existingFarmer.getId(), existingFarmer.getEmail());

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Login successful",
            "token", token,
            "farmerId", existingFarmer.getId(),
            "name", existingFarmer.getName()
        ));
    }

    // ─────────────────────────────────────────────
    // Helper: mask email for display e.g. ch****@gmail.com
    // ─────────────────────────────────────────────
    private String maskEmail(String email) {
        int atIndex = email.indexOf('@');
        if (atIndex <= 2) return email;
        return email.substring(0, 2) + "****" + email.substring(atIndex);
    }

    /* Note: The old verifyPassword and verifyOtp methods were removed 
       to migrate to the single-step JWT login flow.
    */
}