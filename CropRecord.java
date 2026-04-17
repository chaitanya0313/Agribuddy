package com.agribuddy.agribuddy_backend.Entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "crop_record")
public class CropRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long farmerId;
    private String cropName;
    private String season;
    private Integer year;
    private Double areaAcres;
    private LocalDate startDate;

    @OneToMany(mappedBy = "cropRecord", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Income> incomes;

    @OneToMany(mappedBy = "cropRecord", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Expense> expenses;

    public Long getId() { return id; }
    public Long getFarmerId() { return farmerId; }
    public void setFarmerId(Long farmerId) { this.farmerId = farmerId; }
    public String getCropName() { return cropName; }
    public void setCropName(String cropName) { this.cropName = cropName; }
    public String getSeason() { return season; }
    public void setSeason(String season) { this.season = season; }
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
    public Double getAreaAcres() { return areaAcres; }
    public void setAreaAcres(Double areaAcres) { this.areaAcres = areaAcres; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public List<Income> getIncomes() { return incomes; }
    public List<Expense> getExpenses() { return expenses; }
}
