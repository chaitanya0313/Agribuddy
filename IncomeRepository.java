package com.agribuddy.agribuddy_backend.repository;

import com.agribuddy.agribuddy_backend.Entity.Income;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IncomeRepository extends JpaRepository<Income, Long> {
    // Must use 'Date' to match the 'date' field in the Entity
    List<Income> findByFarmerIdOrderByDateDesc(Long farmerId);

    // This allows the CropController to calculate totals for a specific crop
    List<Income> findByCropRecordIdOrderByDateDesc(Long cropRecordId);
}