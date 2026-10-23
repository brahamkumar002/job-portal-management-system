package com.jobportal.dto;

import com.jobportal.entity.CandidateProfile;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CandidateProfileResponse {

    private Long id;
    private Long userId;

    private String phone;
    private String gender;
    private String city;
    private String state;

    private String qualification;
    private String specialization;
    private String collegeName;
    private Short graduationYear;
    private BigDecimal cgpa;

    private CandidateProfile.ExperienceLevel experienceLevel;
    private BigDecimal yearsOfExperience;
    private String currentJobTitle;
    private String preferredJobLocation;
    private String noticePeriod;

    private String technicalSkills;

    private String resumeUrl;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // No-argument constructor

    public CandidateProfileResponse() {
    }

    // Convert CandidateProfile entity into response DTO

    public CandidateProfileResponse(CandidateProfile profile) {
        this.id = profile.getId();
        this.userId = profile.getUser().getId();

        this.phone = profile.getPhone();
        this.gender = profile.getGender();
        this.city = profile.getCity();
        this.state = profile.getState();

        this.qualification = profile.getQualification();
        this.specialization = profile.getSpecialization();
        this.collegeName = profile.getCollegeName();
        this.graduationYear = profile.getGraduationYear();
        this.cgpa = profile.getCgpa();

        this.experienceLevel = profile.getExperienceLevel();
        this.yearsOfExperience = profile.getYearsOfExperience();
        this.currentJobTitle = profile.getCurrentJobTitle();
        this.preferredJobLocation = profile.getPreferredJobLocation();
        this.noticePeriod = profile.getNoticePeriod();

        this.technicalSkills = profile.getTechnicalSkills();

        this.resumeUrl = profile.getResumeUrl();
        this.linkedinUrl = profile.getLinkedinUrl();
        this.githubUrl = profile.getGithubUrl();
        this.portfolioUrl = profile.getPortfolioUrl();

        this.createdAt = profile.getCreatedAt();
        this.updatedAt = profile.getUpdatedAt();
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getQualification() {
        return qualification;
    }

    public void setQualification(String qualification) {
        this.qualification = qualification;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public String getCollegeName() {
        return collegeName;
    }

    public void setCollegeName(String collegeName) {
        this.collegeName = collegeName;
    }

    public Short getGraduationYear() {
        return graduationYear;
    }

    public void setGraduationYear(Short graduationYear) {
        this.graduationYear = graduationYear;
    }

    public BigDecimal getCgpa() {
        return cgpa;
    }

    public void setCgpa(BigDecimal cgpa) {
        this.cgpa = cgpa;
    }

    public CandidateProfile.ExperienceLevel getExperienceLevel() {
        return experienceLevel;
    }

    public void setExperienceLevel(
            CandidateProfile.ExperienceLevel experienceLevel) {
        this.experienceLevel = experienceLevel;
    }

    public BigDecimal getYearsOfExperience() {
        return yearsOfExperience;
    }

    public void setYearsOfExperience(BigDecimal yearsOfExperience) {
        this.yearsOfExperience = yearsOfExperience;
    }

    public String getCurrentJobTitle() {
        return currentJobTitle;
    }

    public void setCurrentJobTitle(String currentJobTitle) {
        this.currentJobTitle = currentJobTitle;
    }

    public String getPreferredJobLocation() {
        return preferredJobLocation;
    }

    public void setPreferredJobLocation(String preferredJobLocation) {
        this.preferredJobLocation = preferredJobLocation;
    }

    public String getNoticePeriod() {
        return noticePeriod;
    }

    public void setNoticePeriod(String noticePeriod) {
        this.noticePeriod = noticePeriod;
    }

    public String getTechnicalSkills() {
        return technicalSkills;
    }

    public void setTechnicalSkills(String technicalSkills) {
        this.technicalSkills = technicalSkills;
    }

    public String getResumeUrl() {
        return resumeUrl;
    }

    public void setResumeUrl(String resumeUrl) {
        this.resumeUrl = resumeUrl;
    }

    public String getLinkedinUrl() {
        return linkedinUrl;
    }

    public void setLinkedinUrl(String linkedinUrl) {
        this.linkedinUrl = linkedinUrl;
    }

    public String getGithubUrl() {
        return githubUrl;
    }

    public void setGithubUrl(String githubUrl) {
        this.githubUrl = githubUrl;
    }

    public String getPortfolioUrl() {
        return portfolioUrl;
    }

    public void setPortfolioUrl(String portfolioUrl) {
        this.portfolioUrl = portfolioUrl;
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