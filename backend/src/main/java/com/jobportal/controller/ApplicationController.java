
package com.jobportal.controller;

import com.jobportal.dto.ApplicationResponse;
import com.jobportal.dto.ApplicationStatusUpdateRequest;
import com.jobportal.dto.RecruiterCandidateDetailsResponse;

import com.jobportal.service.ApplicationService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(
            ApplicationService applicationService) {

        this.applicationService = applicationService;
    }

    // ---------------------------------------------------------
    // CANDIDATE: APPLY FOR A JOB
    // POST /api/candidate/applications/jobs/{jobId}
    // ---------------------------------------------------------

    @PostMapping("/api/candidate/applications/jobs/{jobId}")
    public ResponseEntity<ApplicationResponse> applyForJob(
            Authentication authentication,
            @PathVariable Long jobId) {

        ApplicationResponse response =
                applicationService.applyForJob(
                        authentication.getName(),
                        jobId
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // ---------------------------------------------------------
    // CANDIDATE: VIEW MY APPLICATIONS
    // GET /api/candidate/applications
    // ---------------------------------------------------------

    @GetMapping("/api/candidate/applications")
    public ResponseEntity<List<ApplicationResponse>> getMyApplications(
            Authentication authentication) {

        List<ApplicationResponse> applications =
                applicationService.getMyApplications(
                        authentication.getName()
                );

        return ResponseEntity.ok(applications);
    }

    // ---------------------------------------------------------
    // RECRUITER: VIEW APPLICATIONS FOR OWN JOB
    // GET /api/recruiter/jobs/{jobId}/applications
    // ---------------------------------------------------------

    @GetMapping("/api/recruiter/jobs/{jobId}/applications")
    public ResponseEntity<List<ApplicationResponse>> getJobApplications(
            Authentication authentication,
            @PathVariable Long jobId) {

        List<ApplicationResponse> applications =
                applicationService.getJobApplications(
                        authentication.getName(),
                        jobId
                );

        return ResponseEntity.ok(applications);
    }

    // ---------------------------------------------------------
    // RECRUITER: VIEW COMPLETE CANDIDATE DETAILS
    // GET /api/recruiter/applications/{applicationId}/candidate-details
    // ---------------------------------------------------------

    @GetMapping(
            "/api/recruiter/applications/{applicationId}/candidate-details"
    )
    public ResponseEntity<RecruiterCandidateDetailsResponse>
    getRecruiterCandidateDetails(
            Authentication authentication,
            @PathVariable Long applicationId) {

        RecruiterCandidateDetailsResponse response =
                applicationService.getRecruiterCandidateDetails(
                        authentication.getName(),
                        applicationId
                );

        return ResponseEntity.ok(response);
    }

    // ---------------------------------------------------------
    // RECRUITER: UPDATE APPLICATION STATUS
    // PATCH /api/recruiter/applications/{applicationId}/status
    // ---------------------------------------------------------

    @PatchMapping(
            "/api/recruiter/applications/{applicationId}/status"
    )
    public ResponseEntity<ApplicationResponse> updateApplicationStatus(
            Authentication authentication,
            @PathVariable Long applicationId,
            @Valid @RequestBody ApplicationStatusUpdateRequest request) {

        ApplicationResponse response =
                applicationService.updateApplicationStatus(
                        authentication.getName(),
                        applicationId,
                        request.getStatus()
                );

        return ResponseEntity.ok(response);
    }
}
