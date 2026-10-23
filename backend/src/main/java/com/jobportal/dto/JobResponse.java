package com.jobportal.dto;

import com.jobportal.entity.Job;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class JobResponse {

    private Long id;

    private Long recruiterId;

    private String title;

    private String companyName;

    private String description;

    private String requirements;

    private String location;

    private Job.EmploymentType employmentType;

    private Job.WorkMode workMode;

    private BigDecimal salaryMin;

    private BigDecimal salaryMax;

    private Job.JobStatus status;

    private LocalDate applicationDeadline;

    private LocalDateTime closedAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // No-argument constructor

    public JobResponse() {
    }

    // Convert Job entity into response DTO

    public JobResponse(Job job) {
        this.id = job.getId();
        this.recruiterId = job.getRecruiter().getId();

        this.title = job.getTitle();
        this.companyName = job.getCompanyName();
        this.description = job.getDescription();
        this.requirements = job.getRequirements();
        this.location = job.getLocation();

        this.employmentType = job.getEmploymentType();
        this.workMode = job.getWorkMode();

        this.salaryMin = job.getSalaryMin();
        this.salaryMax = job.getSalaryMax();

        this.status = job.getStatus();
        this.applicationDeadline = job.getApplicationDeadline();

        this.closedAt = job.getClosedAt();
        this.createdAt = job.getCreatedAt();
        this.updatedAt = job.getUpdatedAt();
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRecruiterId() {
        return recruiterId;
    }

    public void setRecruiterId(Long recruiterId) {
        this.recruiterId = recruiterId;
    }

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

    public Job.JobStatus getStatus() {
        return status;
    }

    public void setStatus(Job.JobStatus status) {
        this.status = status;
    }

    public LocalDate getApplicationDeadline() {
        return applicationDeadline;
    }

    public void setApplicationDeadline(LocalDate applicationDeadline) {
        this.applicationDeadline = applicationDeadline;
    }

    public LocalDateTime getClosedAt() {
        return closedAt;
    }

    public void setClosedAt(LocalDateTime closedAt) {
        this.closedAt = closedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}