package com.jobportal.dto;

import com.jobportal.entity.CandidateProfile;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class CandidateProfileRequest {

    @Size(max = 20, message = "Phone cannot exceed 20 characters")
    private String phone;

    @Size(max = 30, message = "Gender cannot exceed 30 characters")
    private String gender;

    @Size(max = 100, message = "City cannot exceed 100 characters")
    private String city;

    @Size(max = 100, message = "State cannot exceed 100 characters")
    private String state;

    @Size(max = 150, message = "Qualification cannot exceed 150 characters")
    private String qualification;

    @Size(max = 150, message = "Specialization cannot exceed 150 characters")
    private String specialization;

    @Size(max = 200, message = "College name cannot exceed 200 characters")
    private String collegeName;

    @Min(value = 1900, message = "Enter a valid graduation year")
    @Max(value = 2100, message = "Enter a valid graduation year")
    private Short graduationYear;

    @DecimalMin(value = "0.00", message = "CGPA cannot be negative")
    @DecimalMax(value = "10.00", message = "CGPA cannot exceed 10")
    @Digits(integer = 2, fraction = 2,
            message = "CGPA can have at most 2 decimal places")
    private BigDecimal cgpa;

    private CandidateProfile.ExperienceLevel experienceLevel;

    @DecimalMin(value = "0.0",
            message = "Years of experience cannot be negative")
    @Digits(integer = 3, fraction = 1,
            message = "Enter a valid experience value")
    private BigDecimal yearsOfExperience;

    @Size(max = 150,
            message = "Current job title cannot exceed 150 characters")
    private String currentJobTitle;

    @Size(max = 150,
            message = "Preferred job location cannot exceed 150 characters")
    private String preferredJobLocation;

    @Size(max = 50,
            message = "Notice period cannot exceed 50 characters")
    private String noticePeriod;

    private String technicalSkills;

    @Size(max = 500, message = "Resume URL cannot exceed 500 characters")
    private String resumeUrl;

    @Size(max = 500, message = "LinkedIn URL cannot exceed 500 characters")
    private String linkedinUrl;

    @Size(max = 500, message = "GitHub URL cannot exceed 500 characters")
    private String githubUrl;

    @Size(max = 500, message = "Portfolio URL cannot exceed 500 characters")
    private String portfolioUrl;

    // No-argument constructor

    public CandidateProfileRequest() {
    }

    // Getters and Setters

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
}