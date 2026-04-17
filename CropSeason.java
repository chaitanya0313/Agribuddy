package com.agribuddy.agribuddy_backend.Entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "crop_seasons")
public class CropSeason {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // FK → farmer table, cascades delete
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "farmer_id", nullable = false)
    private Farmer farmer;

    @Column(nullable = false)
    private String cropName;

    @Column(nullable = false)
    private String season;       // "Kharif", "Rabi", "Zaid"

    @Column(nullable = false)
    private Integer year;

    // acres > 0 enforced by CHECK constraint below
    @Column(nullable = false)
    private Double acres;

    // These store aggregated income/expense; kept nullable — updated by income/expense endpoints
    private Double totalIncome = 0.0;
    private Double totalExpense = 0.0;

    @Column(nullable = false, updatable = false)
    private LocalDate createdAt = LocalDate.now();

    // ── Constructors ──
    public CropSeason() {}

    // ── Getters & Setters ──
    public Long getId() { return id; }

    public Farmer getFarmer() { return farmer; }
    public void setFarmer(Farmer farmer) { this.farmer = farmer; }

    public String getCropName() { return cropName; }
    public void setCropName(String cropName) { this.cropName = cropName; }

    public String getSeason() { return season; }
    public void setSeason(String season) { this.season = season; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public Double getAcres() { return acres; }
    public void setAcres(Double acres) { this.acres = acres; }

    public Double getTotalIncome() { return totalIncome; }
    public void setTotalIncome(Double totalIncome) { this.totalIncome = totalIncome; }

    public Double getTotalExpense() { return totalExpense; }
    public void setTotalExpense(Double totalExpense) { this.totalExpense = totalExpense; }

    public LocalDate getCreatedAt() { return createdAt; }
}