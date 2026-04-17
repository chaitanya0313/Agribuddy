package com.agribuddy.agribuddy_backend.Entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "expense")
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

   @ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "farmer_id", nullable = false)
@JsonIgnore
private Farmer farmer;

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "crop_record_id")
@JsonIgnore
private CropRecord cropRecord;


    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private LocalDate date;

    public Expense() {}

    public Long getId() { return id; }
    public Farmer getFarmer() { return farmer; }
    public void setFarmer(Farmer farmer) { this.farmer = farmer; }
    public CropRecord getCropRecord() { return cropRecord; }
    public void setCropRecord(CropRecord cropRecord) { this.cropRecord = cropRecord; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
}
