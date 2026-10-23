package com.jobportal.controller;

import com.jobportal.dto.CandidateProfileRequest;
import com.jobportal.dto.CandidateProfileResponse;
import com.jobportal.service.CandidateProfileService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/candidate/profile")
public class CandidateProfileController {

    private final CandidateProfileService profileService;

    public CandidateProfileController(
            CandidateProfileService profileService) {
        this.profileService = profileService;
    }

    // CREATE PROFILE
    // POST /api/candidate/profile

    @PostMapping
    public ResponseEntity<CandidateProfileResponse> createProfile(
            Authentication authentication,
            @Valid @RequestBody CandidateProfileRequest request) {

        CandidateProfileResponse response =
                profileService.createProfile(
                        authentication.getName(),
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // VIEW MY PROFILE
    // GET /api/candidate/profile

    @GetMapping
    public ResponseEntity<CandidateProfileResponse> getMyProfile(
            Authentication authentication) {

        CandidateProfileResponse response =
                profileService.getMyProfile(
                        authentication.getName()
                );

        return ResponseEntity.ok(response);
    }

    // UPDATE PROFILE
    // PUT /api/candidate/profile

    @PutMapping
    public ResponseEntity<CandidateProfileResponse> updateProfile(
            Authentication authentication,
            @Valid @RequestBody CandidateProfileRequest request) {

        CandidateProfileResponse response =
                profileService.updateProfile(
                        authentication.getName(),
                        request
                );

        return ResponseEntity.ok(response);
    }
}