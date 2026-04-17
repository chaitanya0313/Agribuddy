package com.agribuddy.agribuddy_backend.repository;

import com.agribuddy.agribuddy_backend.Entity.CropRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CropRecordRepository extends JpaRepository<CropRecord, Long> {

    // 1. Basic fetch
    List<CropRecord> findByFarmerId(Long farmerId);

    // 2. ADD THIS: Sorted fetch used by your Controller for the Dashboard and Profit views
    List<CropRecord> findByFarmerIdOrderByYearDescStartDateDesc(Long farmerId);

    // 3. Authorization check
    Optional<CropRecord> findByIdAndFarmerId(Long id, Long farmerId);
}