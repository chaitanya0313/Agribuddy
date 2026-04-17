package com.agribuddy.agribuddy_backend.controller;

import com.agribuddy.agribuddy_backend.Entity.CropRecord;
import com.agribuddy.agribuddy_backend.repository.CropRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/crop-records")
@CrossOrigin(origins = "http://localhost:5173")
public class CropRecordController {

    @Autowired
    private CropRecordRepository cropRecordRepository;

    // GET all crop records for a farmer
    @GetMapping("/farmer/{farmerId}")
    public ResponseEntity<List<CropRecord>> getCropRecords(@PathVariable Long farmerId) {
        List<CropRecord> records = cropRecordRepository.findByFarmerId(farmerId);
        return ResponseEntity.ok(records);
    }

    // POST create a new crop record
    @PostMapping
    public ResponseEntity<?> createCropRecord(@RequestBody Map<String, Object> body) {
        try {
            CropRecord record = new CropRecord();
            record.setFarmerId(Long.parseLong(body.get("farmerId").toString()));
            record.setCropName(body.get("cropName").toString());
            record.setSeason(body.get("season").toString());
            record.setYear(Integer.parseInt(body.get("year").toString()));
            record.setAreaAcres(Double.parseDouble(body.get("areaAcres").toString()));
            // startDate defaults to today if not provided
            String startDate = body.containsKey("startDate") && body.get("startDate") != null
                    ? body.get("startDate").toString()
                    : LocalDate.now().toString();
            record.setStartDate(LocalDate.parse(startDate));

            CropRecord saved = cropRecordRepository.save(record);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // DELETE a crop record by id (only if it belongs to the farmer)
    @DeleteMapping("/{id}/farmer/{farmerId}")
    public ResponseEntity<?> deleteCropRecord(@PathVariable Long id, @PathVariable Long farmerId) {
        return cropRecordRepository.findById(id).map(record -> {
            if (!record.getFarmerId().equals(farmerId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("success", false, "message", "Not authorized"));
            }
            cropRecordRepository.delete(record);
            return ResponseEntity.ok(Map.of("success", true, "message", "Deleted"));
        }).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("success", false, "message", "Record not found")));
    }
}