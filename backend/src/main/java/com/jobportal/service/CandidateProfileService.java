package com.jobportal.service;

import com.jobportal.dto.CandidateProfileRequest;
import com.jobportal.dto.CandidateProfileResponse;
import com.jobportal.entity.CandidateProfile;
import com.jobportal.entity.User;
import com.jobportal.repository.CandidateProfileRepository;
import com.jobportal.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CandidateProfileService {

    private final CandidateProfileRepository profileRepository;
    private final UserRepository userRepository;

    public CandidateProfileService(
            CandidateProfileRepository profileRepository,
            UserRepository userRepository) {

        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
    }

    // CREATE PROFILE

    @Transactional
    public CandidateProfileResponse createProfile(
            String email,
            CandidateProfileRequest request) {

        User user = getCandidate(email);

        if (profileRepository.existsByUserId(user.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Candidate profile already exists"
            );
        }

        CandidateProfile profile = new CandidateProfile();
        profile.setUser(user);

        updateFields(profile, request);

        CandidateProfile savedProfile =
                profileRepository.saveAndFlush(profile);

        return new CandidateProfileResponse(savedProfile);
    }

    // VIEW PROFILE

    @Transactional(readOnly = true)
    public CandidateProfileResponse getMyProfile(String email) {

        User user = getCandidate(email);

        CandidateProfile profile = profileRepository
                .findByUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Candidate profile not found"
                ));

        return new CandidateProfileResponse(profile);
    }

    // UPDATE PROFILE

    @Transactional
    public CandidateProfileResponse updateProfile(
            String email,
            CandidateProfileRequest request) {

        User user = getCandidate(email);

        CandidateProfile profile = profileRepository
                .findByUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Candidate profile not found"
                ));

        updateFields(profile, request);

        CandidateProfile savedProfile =
                profileRepository.saveAndFlush(profile);

        return new CandidateProfileResponse(savedProfile);
    }

    // GET LOGGED-IN CANDIDATE

    private User getCandidate(String email) {

        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication required"
            );
        }

        User user = userRepository
                .findByEmail(email.trim().toLowerCase(java.util.Locale.ROOT))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "User not found"
                ));

        if (user.getRole() != User.Role.CANDIDATE) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only candidates can manage profiles"
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

    // MAP REQUEST FIELDS TO ENTITY

    private void updateFields(
            CandidateProfile profile,
            CandidateProfileRequest request) {

        profile.setPhone(request.getPhone());
        profile.setGender(request.getGender());
        profile.setCity(request.getCity());
        profile.setState(request.getState());

        profile.setQualification(request.getQualification());
        profile.setSpecialization(request.getSpecialization());
        profile.setCollegeName(request.getCollegeName());
        profile.setGraduationYear(request.getGraduationYear());
        profile.setCgpa(request.getCgpa());

        profile.setExperienceLevel(request.getExperienceLevel());
        profile.setYearsOfExperience(request.getYearsOfExperience());
        profile.setCurrentJobTitle(request.getCurrentJobTitle());
        profile.setPreferredJobLocation(
                request.getPreferredJobLocation()
        );
        profile.setNoticePeriod(request.getNoticePeriod());

        profile.setTechnicalSkills(request.getTechnicalSkills());

        profile.setResumeUrl(request.getResumeUrl());
        profile.setLinkedinUrl(request.getLinkedinUrl());
        profile.setGithubUrl(request.getGithubUrl());
        profile.setPortfolioUrl(request.getPortfolioUrl());
    }
}