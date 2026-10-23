package com.jobportal.dto;

import com.jobportal.entity.CandidateProject;

public class CandidateProjectResponse {

    private Long id;

    private Long candidateId;

    private String projectName;

    private String techStack;

    private String description;

    private String githubUrl;

    private String liveUrl;

    // No-argument constructor

    public CandidateProjectResponse() {
    }

    // Convert CandidateProject entity into response DTO

    public CandidateProjectResponse(CandidateProject project) {
        this.id = project.getId();
        this.candidateId = project.getCandidate().getId();
        this.projectName = project.getProjectName();
        this.techStack = project.getTechStack();
        this.description = project.getDescription();
        this.githubUrl = project.getGithubUrl();
        this.liveUrl = project.getLiveUrl();
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCandidateId() {
        return candidateId;
    }

    public void setCandidateId(Long candidateId) {
        this.candidateId = candidateId;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public String getTechStack() {
        return techStack;
    }

    public void setTechStack(String techStack) {
        this.techStack = techStack;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getGithubUrl() {
        return githubUrl;
    }

    public void setGithubUrl(String githubUrl) {
        this.githubUrl = githubUrl;
    }

    public String getLiveUrl() {
        return liveUrl;
    }

    public void setLiveUrl(String liveUrl) {
        this.liveUrl = liveUrl;
    }
}