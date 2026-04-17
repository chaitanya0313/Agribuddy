package com.agribuddy.agribuddy_backend.repository;

import com.agribuddy.agribuddy_backend.Entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    // Must match the 'date' field in Expense entity
    List<Expense> findByFarmerIdOrderByDateDesc(Long farmerId);

    // Required for CropController's buildCropSummary calculation
    List<Expense> findByCropRecordIdOrderByDateDesc(Long cropRecordId);
}