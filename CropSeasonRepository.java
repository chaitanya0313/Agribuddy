package com.agribuddy.agribuddy_backend.repository;

import com.agribuddy.agribuddy_backend.Entity.CropSeason;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CropSeasonRepository extends JpaRepository<CropSeason, Long> {

    // Fetch only THIS farmer's crop seasons — data isolation enforced here
    List<CropSeason> findByFarmerId(Long farmerId);

    // Used in authorization checks — ensures farmer owns the record
    Optional<CropSeason> findByIdAndFarmerId(Long id, Long farmerId);
}