package com.jobportal.dto;

import com.jobportal.entity.Application;
import com.jobportal.entity.CandidateProfile;
import com.jobportal.entity.CandidateProject;
import com.jobportal.entity.User;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class RecruiterCandidateDetailsResponse {

    private final Long applicationId;
    private final Long jobId;
    private final String jobTitle;
    private final String companyName;

    private final Long candidateId;
    private final String candidateName;
    private final String candidateEmail;

    private final Application.ApplicationStatus status;
    private final LocalDateTime appliedAt;
    private final LocalDateTime updatedAt;

    private final ProfileDetails profile;
    private final List<ProjectDetails> projects;

    public RecruiterCandidateDetailsResponse(
            Application application,
            CandidateProfile candidateProfile,
            List<CandidateProject> candidateProjects) {

        User candidate = application.getCandidate();

        this.applicationId = application.getId();
        this.jobId = application.getJob().getId();
        this.jobTitle = application.getJob().getTitle();
        this.companyName = application.getJob().getCompanyName();

        this.candidateId = candidate.getId();
        this.candidateName = candidate.getFullName();
        this.candidateEmail = candidate.getEmail();

        this.status = application.getStatus();
        this.appliedAt = application.getAppliedAt();
        this.updatedAt = application.getUpdatedAt();

        this.profile = candidateProfile == null
                ? null
                : new ProfileDetails(candidateProfile);

        this.projects = candidateProjects == null
                ? List.of()
                : candidateProjects.stream()
                .map(ProjectDetails::new)
                .toList();
    }

    public Long getApplicationId() {
        return applicationId;
    }

    public Long getJobId() {
        return jobId;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public String getCompanyName() {
        return companyName;
    }

    public Long getCandidateId() {
        return candidateId;
    }

    public String getCandidateName() {
        return candidateName;
    }

    public String getCandidateEmail() {
        return candidateEmail;
    }

    public Application.ApplicationStatus getStatus() {
        return status;
    }

    public LocalDateTime getAppliedAt() {
        return appliedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public ProfileDetails getProfile() {
        return profile;
    }

    public List<ProjectDetails> getProjects() {
        return projects;
    }

    // Candidate profile information
    public static class ProfileDetails {

        private final String phone;
        private final String gender;
        private final String city;
        private final String state;

        private final String qualification;
        private final String specialization;
        private final String collegeName;
        private final Short graduationYear;
        private final BigDecimal cgpa;

        private final CandidateProfile.ExperienceLevel experienceLevel;
        private final BigDecimal yearsOfExperience;
        private final String currentJobTitle;
        private final String preferredJobLocation;
        private final String noticePeriod;

        private final String technicalSkills;

        private final String resumeUrl;
        private final String linkedinUrl;
        private final String githubUrl;
        private final String portfolioUrl;

        public ProfileDetails(CandidateProfile profile) {
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
        }

        public String getPhone() {
            return phone;
        }

        public String getGender() {
            return gender;
        }

        public String getCity() {
            return city;
        }

        public String getState() {
            return state;
        }

        public String getQualification() {
            return qualification;
        }

        public String getSpecialization() {
            return specialization;
        }

        public String getCollegeName() {
            return collegeName;
        }

        public Short getGraduationYear() {
            return graduationYear;
        }

        public BigDecimal getCgpa() {
            return cgpa;
        }

        public CandidateProfile.ExperienceLevel getExperienceLevel() {
            return experienceLevel;
        }

        public BigDecimal getYearsOfExperience() {
            return yearsOfExperience;
        }

        public String getCurrentJobTitle() {
            return currentJobTitle;
        }

        public String getPreferredJobLocation() {
            return preferredJobLocation;
        }

        public String getNoticePeriod() {
            return noticePeriod;
        }

        public String getTechnicalSkills() {
            return technicalSkills;
        }

        public String getResumeUrl() {
            return resumeUrl;
        }

        public String getLinkedinUrl() {
            return linkedinUrl;
        }

        public String getGithubUrl() {
            return githubUrl;
        }

        public String getPortfolioUrl() {
            return portfolioUrl;
        }
    }

    // Candidate project information
    public static class ProjectDetails {

        private final Long id;
        private final String projectName;
        private final String techStack;
        private final String description;
        private final String githubUrl;
        private final String liveUrl;

        public ProjectDetails(CandidateProject project) {
            this.id = project.getId();
            this.projectName = project.getProjectName();
            this.techStack = project.getTechStack();
            this.description = project.getDescription();
            this.githubUrl = project.getGithubUrl();
            this.liveUrl = project.getLiveUrl();
        }

        public Long getId() {
            return id;
        }

        public String getProjectName() {
            return projectName;
        }

        public String getTechStack() {
            return techStack;
        }

        public String getDescription() {
            return description;
        }

        public String getGithubUrl() {
            return githubUrl;
        }

        public String getLiveUrl() {
            return liveUrl;
        }
    }
}
