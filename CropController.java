package com.agribuddy.agribuddy_backend.controller;

import com.agribuddy.agribuddy_backend.Entity.CropRecord;
import com.agribuddy.agribuddy_backend.Entity.Expense;
import com.agribuddy.agribuddy_backend.Entity.Income;
import com.agribuddy.agribuddy_backend.repository.CropRecordRepository;
import com.agribuddy.agribuddy_backend.repository.ExpenseRepository;
import com.agribuddy.agribuddy_backend.repository.IncomeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/crops")
@CrossOrigin(origins = "http://localhost:5173")
public class CropController {

    @Autowired private CropRecordRepository cropRepo;
    @Autowired private IncomeRepository incomeRepo;
    @Autowired private ExpenseRepository expenseRepo;

    // 1. Create a new Crop Season
    @PostMapping("/record")
    public ResponseEntity<?> createCropRecord(@RequestBody Map<String, String> body) {
        try {
            CropRecord crop = new CropRecord();
            crop.setFarmerId(Long.parseLong(body.get("farmerId")));
            crop.setCropName(body.get("cropName"));
            crop.setSeason(body.get("season"));
            crop.setYear(Integer.parseInt(body.get("year")));
            crop.setAreaAcres(Double.parseDouble(body.get("areaAcres")));
            crop.setStartDate(LocalDate.parse(body.get("startDate")));
            
            cropRepo.save(crop);
            return ResponseEntity.ok(Map.of("success", true, "cropId", crop.getId()));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // 2. Get all records for a farmer (Sorted)
    @GetMapping("/record/{farmerId}")
    public ResponseEntity<?> getCropRecords(@PathVariable Long farmerId) {
        List<CropRecord> crops = cropRepo.findByFarmerIdOrderByYearDescStartDateDesc(farmerId);
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (CropRecord crop : crops) {
            result.add(buildCropSummary(crop));
        }
        return ResponseEntity.ok(result);
    }

    // 3. Get Profit/Loss Dashboard Data
    @GetMapping("/profit/{farmerId}")
    public ResponseEntity<?> getProfitLoss(@PathVariable Long farmerId) {
        List<CropRecord> crops = cropRepo.findByFarmerIdOrderByYearDescStartDateDesc(farmerId);
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (CropRecord crop : crops) {
            result.add(buildCropSummary(crop));
        }
        return ResponseEntity.ok(result);
    }

    // ── Private Helper Method to Calculate Totals for each Crop ──
    private Map<String, Object> buildCropSummary(CropRecord crop) {
        // Fetch incomes and expenses linked specifically to this Crop ID
        // Note: These method names must exist in your Income/Expense repositories
        List<Income> incomes = incomeRepo.findByCropRecordIdOrderByDateDesc(crop.getId());
        List<Expense> expenses = expenseRepo.findByCropRecordIdOrderByDateDesc(crop.getId());

        double totalIncome = 0;
        for (Income i : incomes) {
            totalIncome += i.getAmount();
        }

        double totalExpense = 0;
        for (Expense e : expenses) {
            totalExpense += e.getAmount();
        }

        double profitLoss = totalIncome - totalExpense;
        
        // Avoid division by zero
        double perAcre = (crop.getAreaAcres() != null && crop.getAreaAcres() > 0) 
                         ? profitLoss / crop.getAreaAcres() : 0;

        // Construct the response map
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("cropId", crop.getId());
        map.put("cropName", crop.getCropName());
        map.put("season", crop.getSeason());
        map.put("year", crop.getYear());
        map.put("areaAcres", crop.getAreaAcres());
        map.put("startDate", crop.getStartDate().toString());
        map.put("totalIncome", totalIncome);
        map.put("totalExpense", totalExpense);
        map.put("profitLoss", profitLoss);
        map.put("profitPerAcre", Math.round(perAcre * 100.0) / 100.0);
        map.put("status", profitLoss >= 0 ? "PROFIT" : "LOSS");
        
        return map;
    }
}