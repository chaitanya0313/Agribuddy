package com.agribuddy.agribuddy_backend.controller;

import com.agribuddy.agribuddy_backend.Entity.CropSeason;
import com.agribuddy.agribuddy_backend.Entity.Farmer;
import com.agribuddy.agribuddy_backend.config.JwtUtil;
import com.agribuddy.agribuddy_backend.repository.CropSeasonRepository;
import com.agribuddy.agribuddy_backend.repository.FarmerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/crop-seasons")
@CrossOrigin(origins = "http://localhost:5173")
public class CropSeasonController {

    @Autowired private CropSeasonRepository cropSeasonRepository;
    @Autowired private FarmerRepository farmerRepository;
    @Autowired private JwtUtil jwtUtil;

    // ── Helper: extract & validate farmerId from Authorization header ──
    private Long getFarmerIdFromHeader(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) return null;
        return jwtUtil.extractFarmerId(token);
    }

    // ── GET /api/crop-seasons — fetch all for logged-in farmer ──
    @GetMapping
    public ResponseEntity<?> getAllCropSeasons(@RequestHeader("Authorization") String authHeader) {
        Long farmerId = getFarmerIdFromHeader(authHeader);
        if (farmerId == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid or missing token"));

        List<CropSeason> seasons = cropSeasonRepository.findByFarmerId(farmerId);
        return ResponseEntity.ok(seasons);
    }

    // ── POST /api/crop-seasons — create new crop season ──
    @PostMapping
    public ResponseEntity<?> createCropSeason(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody CropSeason body) {

        Long farmerId = getFarmerIdFromHeader(authHeader);
        if (farmerId == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));

        Optional<Farmer> farmerOpt = farmerRepository.findById(farmerId);
        if (farmerOpt.isEmpty())
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Farmer not found"));

        // Validate required fields
        if (body.getCropName() == null || body.getCropName().isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "cropName is required"));
        if (body.getSeason() == null || body.getYear() == null || body.getAcres() == null)
            return ResponseEntity.badRequest().body(Map.of("message", "season, year, and acres are required"));
        if (body.getAcres() <= 0)
            return ResponseEntity.badRequest().body(Map.of("message", "acres must be greater than 0"));

        body.setFarmer(farmerOpt.get());
        CropSeason saved = cropSeasonRepository.save(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // ── PUT /api/crop-seasons/{id} — update (only owner) ──
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCropSeason(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestBody CropSeason body) {

        Long farmerId = getFarmerIdFromHeader(authHeader);
        if (farmerId == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));

        Optional<CropSeason> existing = cropSeasonRepository.findByIdAndFarmerId(id, farmerId);
        if (existing.isEmpty())
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Not found or access denied"));

        CropSeason cs = existing.get();
        if (body.getCropName() != null) cs.setCropName(body.getCropName());
        if (body.getSeason() != null) cs.setSeason(body.getSeason());
        if (body.getYear() != null) cs.setYear(body.getYear());
        if (body.getAcres() != null && body.getAcres() > 0) cs.setAcres(body.getAcres());
        if (body.getTotalIncome() != null) cs.setTotalIncome(body.getTotalIncome());
        if (body.getTotalExpense() != null) cs.setTotalExpense(body.getTotalExpense());

        return ResponseEntity.ok(cropSeasonRepository.save(cs));
    }

    // ── DELETE /api/crop-seasons/{id} — delete (only owner) ──
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCropSeason(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {

        Long farmerId = getFarmerIdFromHeader(authHeader);
        if (farmerId == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));

        Optional<CropSeason> existing = cropSeasonRepository.findByIdAndFarmerId(id, farmerId);
        if (existing.isEmpty())
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Not found or access denied"));

        cropSeasonRepository.delete(existing.get());
        return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
    }
}