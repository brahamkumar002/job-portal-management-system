package com.jobportal.dto;

import com.jobportal.entity.Job;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public class JobRequest {

    @NotBlank(message = "Job title is required")
    @Size(max = 150, message = "Job title cannot exceed 150 characters")
    private String title;

    @NotBlank(message = "Company name is required")
    @Size(max = 150, message = "Company name cannot exceed 150 characters")
    private String companyName;

    @NotBlank(message = "Job description is required")
    private String description;

    private String requirements;

    @NotBlank(message = "Job location is required")
    @Size(max = 150, message = "Location cannot exceed 150 characters")
    private String location;

    @NotNull(message = "Employment type is required")
    private Job.EmploymentType employmentType;

    @NotNull(message = "Work mode is required")
    private Job.WorkMode workMode;

    @DecimalMin(
            value = "0.00",
            message = "Minimum salary cannot be negative"
    )
    @Digits(
            integer = 10,
            fraction = 2,
            message = "Minimum salary must have at most 10 digits before and 2 after decimal"
    )
    private BigDecimal salaryMin;

    @DecimalMin(
            value = "0.00",
            message = "Maximum salary cannot be negative"
    )
    @Digits(
            integer = 10,
            fraction = 2,
            message = "Maximum salary must have at most 10 digits before and 2 after decimal"
    )
    private BigDecimal salaryMax;

    @NotNull(message = "Application deadline is required")
    @FutureOrPresent(message = "Application deadline cannot be in the past")
    private LocalDate applicationDeadline;

    // No-argument constructor required for JSON binding

    public JobRequest() {
    }

    // Validate salary range

    @AssertTrue(message = "Maximum salary must be greater than or equal to minimum salary")
    public boolean isSalaryRangeValid() {
        if (salaryMin == null || salaryMax == null) {
            return true;
        }

        return salaryMax.compareTo(salaryMin) >= 0;
    }

    // Getters and Setters

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getRequirements() {
        return requirements;
    }

    public void setRequirements(String requirements) {
        this.requirements = requirements;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Job.EmploymentType getEmploymentType() {
        return employmentType;
    }

    public void setEmploymentType(Job.EmploymentType employmentType) {
        this.employmentType = employmentType;
    }

    public Job.WorkMode getWorkMode() {
        return workMode;
    }

    public void setWorkMode(Job.WorkMode workMode) {
        this.workMode = workMode;
    }

    public BigDecimal getSalaryMin() {
        return salaryMin;
    }

    public void setSalaryMin(BigDecimal salaryMin) {
        this.salaryMin = salaryMin;
    }

    public BigDecimal getSalaryMax() {
        return salaryMax;
    }

    public void setSalaryMax(BigDecimal salaryMax) {
        this.salaryMax = salaryMax;
    }

    public LocalDate getApplicationDeadline() {
        return applicationDeadline;
    }

    public void setApplicationDeadline(LocalDate applicationDeadline) {
        this.applicationDeadline = applicationDeadline;
    }
}