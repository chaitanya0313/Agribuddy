package com.agribuddy.agribuddy_backend.controller;

import com.agribuddy.agribuddy_backend.Entity.*;
import com.agribuddy.agribuddy_backend.config.JwtUtil;
import com.agribuddy.agribuddy_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class IncomeExpenseController {

    @Autowired private IncomeRepository incomeRepo;
    @Autowired private ExpenseRepository expenseRepo;
    @Autowired private FarmerRepository farmerRepo;
    @Autowired private CropRecordRepository cropRepo;
    @Autowired private JwtUtil jwtUtil;

    // ── Helper ──
    private Long getFarmerId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        return jwtUtil.validateToken(token) ? jwtUtil.extractFarmerId(token) : null;
    }

    // ════════════════════════════════
    //  INCOME ENDPOINTS
    // ════════════════════════════════

    @GetMapping("/api/incomes")
    public ResponseEntity<?> getIncomes(@RequestHeader("Authorization") String auth) {
        Long farmerId = getFarmerId(auth);
        if (farmerId == null)
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));

        // Match the repository method: findByFarmerIdOrderByDateDesc
        List<Income> list = incomeRepo.findByFarmerIdOrderByDateDesc(farmerId);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/api/incomes")
    public ResponseEntity<?> addIncome(
            @RequestHeader("Authorization") String auth,
            @RequestBody Map<String, Object> body) {

        Long farmerId = getFarmerId(auth);
        if (farmerId == null)
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));

        Optional<Farmer> farmerOpt = farmerRepo.findById(farmerId);
        if (farmerOpt.isEmpty())
            return ResponseEntity.status(404).body(Map.of("message", "Farmer not found"));

        Income income = new Income();
        // Now using the Farmer object setter
        income.setFarmer(farmerOpt.get()); 
        income.setSource((String) body.get("source"));
        income.setAmount(Double.parseDouble(body.get("amount").toString()));
        
        // Ensure this matches the 'date' field in your Income entity
        income.setDate(LocalDate.parse((String) body.get("date")));

        if (body.get("cropRecordId") != null) {
            try {
                Long cropId = Long.parseLong(body.get("cropRecordId").toString());
                cropRepo.findByIdAndFarmerId(cropId, farmerId)
                        .ifPresent(income::setCropRecord);
            } catch (Exception e) {
                // Log error or ignore if ID is malformed
            }
        }

        return ResponseEntity.status(201).body(incomeRepo.save(income));
    }

    @DeleteMapping("/api/incomes/{id}")
    public ResponseEntity<?> deleteIncome(
            @RequestHeader("Authorization") String auth,
            @PathVariable Long id) {

        Long farmerId = getFarmerId(auth);
        if (farmerId == null)
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));

        Optional<Income> opt = incomeRepo.findById(id);
        if (opt.isEmpty() || !opt.get().getFarmer().getId().equals(farmerId))
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden"));

        incomeRepo.delete(opt.get());
        return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
    }

    // ════════════════════════════════
    //  EXPENSE ENDPOINTS
    // ════════════════════════════════

    @GetMapping("/api/expenses")
    public ResponseEntity<?> getExpenses(@RequestHeader("Authorization") String auth) {
        Long farmerId = getFarmerId(auth);
        if (farmerId == null)
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));

        List<Expense> list = expenseRepo.findByFarmerIdOrderByDateDesc(farmerId);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/api/expenses")
    public ResponseEntity<?> addExpense(
            @RequestHeader("Authorization") String auth,
            @RequestBody Map<String, Object> body) {

        Long farmerId = getFarmerId(auth);
        if (farmerId == null)
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));

        Optional<Farmer> farmerOpt = farmerRepo.findById(farmerId);
        if (farmerOpt.isEmpty())
            return ResponseEntity.status(404).body(Map.of("message", "Farmer not found"));

        Expense expense = new Expense();
        expense.setFarmer(farmerOpt.get());
        expense.setDescription((String) body.get("description"));
        expense.setAmount(Double.parseDouble(body.get("amount").toString()));
        
        // Ensure this matches the 'date' field in your Expense entity
        expense.setDate(LocalDate.parse((String) body.get("date")));

        if (body.get("cropRecordId") != null) {
            try {
                Long cropId = Long.parseLong(body.get("cropRecordId").toString());
                cropRepo.findByIdAndFarmerId(cropId, farmerId)
                        .ifPresent(expense::setCropRecord);
            } catch (Exception e) {
                // Log error
            }
        }

        return ResponseEntity.status(201).body(expenseRepo.save(expense));
    }

    @DeleteMapping("/api/expenses/{id}")
    public ResponseEntity<?> deleteExpense(
            @RequestHeader("Authorization") String auth,
            @PathVariable Long id) {

        Long farmerId = getFarmerId(auth);
        if (farmerId == null)
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));

        Optional<Expense> opt = expenseRepo.findById(id);
        if (opt.isEmpty() || !opt.get().getFarmer().getId().equals(farmerId))
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden"));

        expenseRepo.delete(opt.get());
        return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
    }
}