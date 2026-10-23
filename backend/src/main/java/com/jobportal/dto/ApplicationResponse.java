package com.jobportal.dto;

import com.jobportal.entity.Application;

import java.time.LocalDateTime;

public class ApplicationResponse {

    private Long id;

    private Long jobId;

    private String jobTitle;

    private String companyName;

    private Long candidateId;

    private String candidateName;

    private String candidateEmail;

    private Application.ApplicationStatus status;

    private LocalDateTime appliedAt;

    private LocalDateTime updatedAt;

    // No-argument constructor

    public ApplicationResponse() {
    }

    // Convert Application entity into response DTO

    public ApplicationResponse(Application application) {
        this.id = application.getId();

        this.jobId = application.getJob().getId();
        this.jobTitle = application.getJob().getTitle();
        this.companyName = application.getJob().getCompanyName();

        this.candidateId = application.getCandidate().getId();
        this.candidateName = application.getCandidate().getFullName();
        this.candidateEmail = application.getCandidate().getEmail();

        this.status = application.getStatus();

        this.appliedAt = application.getAppliedAt();
        this.updatedAt = application.getUpdatedAt();
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public Long getCandidateId() {
        return candidateId;
    }

    public void setCandidateId(Long candidateId) {
        this.candidateId = candidateId;
    }

    public String getCandidateName() {
        return candidateName;
    }

    public void setCandidateName(String candidateName) {
        this.candidateName = candidateName;
    }

    public String getCandidateEmail() {
        return candidateEmail;
    }

    public void setCandidateEmail(String candidateEmail) {
        this.candidateEmail = candidateEmail;
    }

    public Application.ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(Application.ApplicationStatus status) {
        this.status = status;
    }

    public LocalDateTime getAppliedAt() {
        return appliedAt;
    }

    public void setAppliedAt(LocalDateTime appliedAt) {
        this.appliedAt = appliedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}