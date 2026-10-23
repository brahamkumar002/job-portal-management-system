package com.jobportal.controller;

import com.jobportal.dto.CandidateProjectRequest;
import com.jobportal.dto.CandidateProjectResponse;
import com.jobportal.service.CandidateProjectService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/candidate/projects")
public class CandidateProjectController {

    private final CandidateProjectService projectService;

    public CandidateProjectController(
            CandidateProjectService projectService) {
        this.projectService = projectService;
    }

    // CREATE PROJECT
    // POST /api/candidate/projects

    @PostMapping
    public ResponseEntity<CandidateProjectResponse> createProject(
            Authentication authentication,
            @Valid @RequestBody CandidateProjectRequest request) {

        CandidateProjectResponse response =
                projectService.createProject(
                        authentication.getName(),
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // GET ALL MY PROJECTS
    // GET /api/candidate/projects

    @GetMapping
    public ResponseEntity<List<CandidateProjectResponse>> getMyProjects(
            Authentication authentication) {

        List<CandidateProjectResponse> projects =
                projectService.getMyProjects(
                        authentication.getName()
                );

        return ResponseEntity.ok(projects);
    }

    // UPDATE PROJECT
    // PUT /api/candidate/projects/{projectId}

    @PutMapping("/{projectId}")
    public ResponseEntity<CandidateProjectResponse> updateProject(
            Authentication authentication,
            @PathVariable Long projectId,
            @Valid @RequestBody CandidateProjectRequest request) {

        CandidateProjectResponse response =
                projectService.updateProject(
                        authentication.getName(),
                        projectId,
                        request
                );

        return ResponseEntity.ok(response);
    }

    // DELETE PROJECT
    // DELETE /api/candidate/projects/{projectId}

    @DeleteMapping("/{projectId}")
    public ResponseEntity<Void> deleteProject(
            Authentication authentication,
            @PathVariable Long projectId) {

        projectService.deleteProject(
                authentication.getName(),
                projectId
        );

        return ResponseEntity.noContent().build();
    }
}