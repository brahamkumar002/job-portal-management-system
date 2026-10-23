package com.jobportal.controller;

import com.jobportal.dto.JobRequest;
import com.jobportal.dto.JobResponse;
import com.jobportal.service.JobService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    // RECRUITER: CREATE JOB
    // POST /api/recruiter/jobs

    @PostMapping("/api/recruiter/jobs")
    public ResponseEntity<JobResponse> createJob(
            Authentication authentication,
            @Valid @RequestBody JobRequest request) {

        JobResponse response = jobService.createJob(
                authentication.getName(),
                request
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // RECRUITER: VIEW MY JOBS
    // GET /api/recruiter/jobs

    @GetMapping("/api/recruiter/jobs")
    public ResponseEntity<List<JobResponse>> getMyJobs(
            Authentication authentication) {

        List<JobResponse> jobs = jobService.getMyJobs(
                authentication.getName()
        );

        return ResponseEntity.ok(jobs);
    }

    // RECRUITER: UPDATE JOB
    // PUT /api/recruiter/jobs/{jobId}

    @PutMapping("/api/recruiter/jobs/{jobId}")
    public ResponseEntity<JobResponse> updateJob(
            Authentication authentication,
            @PathVariable Long jobId,
            @Valid @RequestBody JobRequest request) {

        JobResponse response = jobService.updateJob(
                authentication.getName(),
                jobId,
                request
        );

        return ResponseEntity.ok(response);
    }

    // RECRUITER: CLOSE JOB
    // PATCH /api/recruiter/jobs/{jobId}/close

    @PatchMapping("/api/recruiter/jobs/{jobId}/close")
    public ResponseEntity<JobResponse> closeJob(
            Authentication authentication,
            @PathVariable Long jobId) {

        JobResponse response = jobService.closeJob(
                authentication.getName(),
                jobId
        );

        return ResponseEntity.ok(response);
    }

    // PUBLIC: VIEW ALL AVAILABLE JOBS
    // GET /api/jobs

    @GetMapping("/api/jobs")
    public ResponseEntity<List<JobResponse>> getOpenJobs(
            @RequestParam(required = false) String keyword) {

        List<JobResponse> jobs;

        if (keyword == null || keyword.isBlank()) {
            jobs = jobService.getOpenJobs();
        } else {
            jobs = jobService.searchOpenJobs(keyword);
        }

        return ResponseEntity.ok(jobs);
    }

    // PUBLIC: VIEW SINGLE AVAILABLE JOB
    // GET /api/jobs/{jobId}

    @GetMapping("/api/jobs/{jobId}")
    public ResponseEntity<JobResponse> getOpenJobById(
            @PathVariable Long jobId) {

        JobResponse response = jobService.getOpenJobById(
                jobId
        );

        return ResponseEntity.ok(response);
    }
}