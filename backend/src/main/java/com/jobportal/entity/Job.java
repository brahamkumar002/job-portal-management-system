package com.jobportal.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "jobs")
public class Job {

    // Enums used by Job entity

    public enum EmploymentType {
        FULL_TIME,
        PART_TIME,
        INTERNSHIP,
        CONTRACT
    }

    public enum WorkMode {
        ONSITE,
        REMOTE,
        HYBRID
    }

    public enum JobStatus {
        OPEN,
        CLOSED
    }

    // Primary Key

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Recruiter who posted the job

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recruiter_id", nullable = false)
    private User recruiter;

    // Job Information

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "company_name", nullable = false, length = 150)
    private String companyName;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "requirements", columnDefinition = "TEXT")
    private String requirements;

    @Column(name = "location", nullable = false, length = 150)
    private String location;

    // Employment Type

    @Enumerated(EnumType.STRING)
    @Column(
            name = "employment_type",
            nullable = false,
            columnDefinition =
                    "ENUM('FULL_TIME','PART_TIME','INTERNSHIP','CONTRACT')"
    )
    private EmploymentType employmentType;

    // Work Mode

    @Enumerated(EnumType.STRING)
    @Column(
            name = "work_mode",
            nullable = false,
            columnDefinition = "ENUM('ONSITE','REMOTE','HYBRID')"
    )
    private WorkMode workMode;

    // Salary Information

    @Column(name = "salary_min", precision = 12, scale = 2)
    private BigDecimal salaryMin;

    @Column(name = "salary_max", precision = 12, scale = 2)
    private BigDecimal salaryMax;

    // Job Status

    @Enumerated(EnumType.STRING)
    @Column(
            name = "status",
            nullable = false,
            columnDefinition = "ENUM('OPEN','CLOSED')"
    )
    private JobStatus status = JobStatus.OPEN;

    // Application Deadline

    @Column(name = "application_deadline", nullable = false)
    private LocalDate applicationDeadline;

    // When recruiter or admin closes the job

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    // MySQL-managed timestamps

    @Column(
            name = "created_at",
            nullable = false,
            insertable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @Column(
            name = "updated_at",
            nullable = false,
            insertable = false,
            updatable = false
    )
    private LocalDateTime updatedAt;

    // Constructor required by JPA

    public Job() {
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getRecruiter() {
        return recruiter;
    }

    public void setRecruiter(User recruiter) {
        this.recruiter = recruiter;
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

    public EmploymentType getEmploymentType() {
        return employmentType;
    }

    public void setEmploymentType(EmploymentType employmentType) {
        this.employmentType = employmentType;
    }

    public WorkMode getWorkMode() {
        return workMode;
    }

    public void setWorkMode(WorkMode workMode) {
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

    public JobStatus getStatus() {
        return status;
    }

    public void setStatus(JobStatus status) {
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

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
