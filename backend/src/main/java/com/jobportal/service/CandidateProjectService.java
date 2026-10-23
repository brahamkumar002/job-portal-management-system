package com.jobportal.service;

import com.jobportal.dto.CandidateProjectRequest;
import com.jobportal.dto.CandidateProjectResponse;
import com.jobportal.entity.CandidateProject;
import com.jobportal.entity.User;
import com.jobportal.repository.CandidateProjectRepository;
import com.jobportal.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@Service
public class CandidateProjectService {

    private final CandidateProjectRepository projectRepository;
    private final UserRepository userRepository;

    public CandidateProjectService(
            CandidateProjectRepository projectRepository,
            UserRepository userRepository) {

        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    // CREATE PROJECT

    @Transactional
    public CandidateProjectResponse createProject(
            String email,
            CandidateProjectRequest request) {

        User candidate = getCandidate(email);

        CandidateProject project = new CandidateProject();
        project.setCandidate(candidate);

        updateFields(project, request);

        CandidateProject savedProject =
                projectRepository.saveAndFlush(project);

        return new CandidateProjectResponse(savedProject);
    }

    // GET ALL MY PROJECTS

    @Transactional(readOnly = true)
    public List<CandidateProjectResponse> getMyProjects(
            String email) {

        User candidate = getCandidate(email);

        return projectRepository
                .findByCandidateId(candidate.getId())
                .stream()
                .map(CandidateProjectResponse::new)
                .toList();
    }

    // UPDATE MY PROJECT

    @Transactional
    public CandidateProjectResponse updateProject(
            String email,
            Long projectId,
            CandidateProjectRequest request) {

        User candidate = getCandidate(email);

        CandidateProject project =
                getOwnedProject(projectId, candidate.getId());

        updateFields(project, request);

        CandidateProject savedProject =
                projectRepository.saveAndFlush(project);

        return new CandidateProjectResponse(savedProject);
    }

    // DELETE MY PROJECT

    @Transactional
    public void deleteProject(
            String email,
            Long projectId) {

        User candidate = getCandidate(email);

        CandidateProject project =
                getOwnedProject(projectId, candidate.getId());

        projectRepository.delete(project);
    }

    // VERIFY LOGGED-IN CANDIDATE

    private User getCandidate(String email) {

        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication required"
            );
        }

        User user = userRepository
                .findByEmail(email.trim().toLowerCase(Locale.ROOT))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "User not found"
                ));

        if (user.getRole() != User.Role.CANDIDATE) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only candidates can manage projects"
            );
        }

        if (!Boolean.TRUE.equals(user.getEnabled())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "User account is disabled"
            );
        }

        return user;
    }

    // ENSURE PROJECT BELONGS TO LOGGED-IN CANDIDATE

    private CandidateProject getOwnedProject(
            Long projectId,
            Long candidateId) {

        CandidateProject project = projectRepository
                .findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Project not found"
                ));

        if (!project.getCandidate().getId().equals(candidateId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Project not found"
            );
        }

        return project;
    }

    // COPY REQUEST FIELDS INTO ENTITY

    private void updateFields(
            CandidateProject project,
            CandidateProjectRequest request) {

        project.setProjectName(request.getProjectName());
        project.setTechStack(request.getTechStack());
        project.setDescription(request.getDescription());
        project.setGithubUrl(request.getGithubUrl());
        project.setLiveUrl(request.getLiveUrl());
    }
}