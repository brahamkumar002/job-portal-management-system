
package com.jobportal.service;

import com.jobportal.dto.ApplicationResponse;
import com.jobportal.dto.RecruiterCandidateDetailsResponse;

import com.jobportal.entity.Application;
import com.jobportal.entity.CandidateProfile;
import com.jobportal.entity.CandidateProject;
import com.jobportal.entity.Job;
import com.jobportal.entity.User;

import com.jobportal.repository.ApplicationRepository;
import com.jobportal.repository.CandidateProfileRepository;
import com.jobportal.repository.CandidateProjectRepository;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    private final CandidateProfileRepository candidateProfileRepository;
    private final CandidateProjectRepository candidateProjectRepository;

    public ApplicationService(
            ApplicationRepository applicationRepository,
            JobRepository jobRepository,
            UserRepository userRepository,
            CandidateProfileRepository candidateProfileRepository,
            CandidateProjectRepository candidateProjectRepository) {

        this.applicationRepository = applicationRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.candidateProfileRepository = candidateProfileRepository;
        this.candidateProjectRepository = candidateProjectRepository;
    }

    // ---------------------------------------------------------
    // CANDIDATE: APPLY FOR A JOB
    // POST /api/candidate/applications/jobs/{jobId}
    // ---------------------------------------------------------

    @Transactional
    public ApplicationResponse applyForJob(
            String email,
            Long jobId) {

        User candidate = getUserWithRole(
                email,
                User.Role.CANDIDATE
        );

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Job not found"
                ));

        if (job.getStatus() != Job.JobStatus.OPEN
                || job.getApplicationDeadline().isBefore(LocalDate.now())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Job is closed or application deadline has passed"
            );
        }

        if (applicationRepository.existsByJobIdAndCandidateId(
                jobId,
                candidate.getId())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "You have already applied for this job"
            );
        }

        Application application = new Application();
        application.setJob(job);
        application.setCandidate(candidate);
        application.setStatus(Application.ApplicationStatus.APPLIED);

        Application saved =
                applicationRepository.saveAndFlush(application);

        return new ApplicationResponse(saved);
    }

    // ---------------------------------------------------------
    // CANDIDATE: VIEW MY APPLICATIONS
    // GET /api/candidate/applications
    // ---------------------------------------------------------

    @Transactional(readOnly = true)
    public List<ApplicationResponse> getMyApplications(
            String email) {

        User candidate = getUserWithRole(
                email,
                User.Role.CANDIDATE
        );

        return applicationRepository
                .findByCandidateIdOrderByAppliedAtDesc(
                        candidate.getId()
                )
                .stream()
                .map(ApplicationResponse::new)
                .toList();
    }

    // ---------------------------------------------------------
    // RECRUITER: VIEW APPLICATIONS FOR OWN JOB
    // GET /api/recruiter/jobs/{jobId}/applications
    // ---------------------------------------------------------

    @Transactional(readOnly = true)
    public List<ApplicationResponse> getJobApplications(
            String email,
            Long jobId) {

        User recruiter = getUserWithRole(
                email,
                User.Role.RECRUITER
        );

        getOwnedJob(jobId, recruiter.getId());

        return applicationRepository
                .findByJobIdOrderByAppliedAtDesc(jobId)
                .stream()
                .map(ApplicationResponse::new)
                .toList();
    }

    // ---------------------------------------------------------
    // RECRUITER: VIEW FULL CANDIDATE DETAILS
    // GET /api/recruiter/applications/{applicationId}/candidate-details
    // ---------------------------------------------------------

    @Transactional(readOnly = true)
    public RecruiterCandidateDetailsResponse getRecruiterCandidateDetails(
            String email,
            Long applicationId) {

        // Step 1: Verify recruiter role and account status
        User recruiter = getUserWithRole(
                email,
                User.Role.RECRUITER
        );

        // Step 2: Find the requested application
        Application application = applicationRepository
                .findById(applicationId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Application not found"
                ));

        // Step 3: Verify that this application belongs
        // to a job owned by the logged-in recruiter
        if (!application.getJob()
                .getRecruiter()
                .getId()
                .equals(recruiter.getId())) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Application not found"
            );
        }

        // Step 4: Identify the candidate
        Long candidateId = application
                .getCandidate()
                .getId();

        // Step 5: Load the candidate's profile.
        // A candidate may have applied without creating a profile.
        CandidateProfile profile = candidateProfileRepository
                .findByUserId(candidateId)
                .orElse(null);

        // Step 6: Load the candidate's projects.
        // An empty list is valid if no projects exist.
        List<CandidateProject> projects =
                candidateProjectRepository.findByCandidateId(
                        candidateId
                );

        // Step 7: Return only the fields defined
        // in our dedicated recruiter response DTO.
        return new RecruiterCandidateDetailsResponse(
                application,
                profile,
                projects
        );
    }

    // ---------------------------------------------------------
    // RECRUITER: UPDATE APPLICATION STATUS
    // PATCH /api/recruiter/applications/{applicationId}/status
    // ---------------------------------------------------------

    @Transactional
    public ApplicationResponse updateApplicationStatus(
            String email,
            Long applicationId,
            Application.ApplicationStatus newStatus) {

        User recruiter = getUserWithRole(
                email,
                User.Role.RECRUITER
        );

        // Only SHORTLISTED or REJECTED are allowed.
        if (newStatus == null
                || newStatus == Application.ApplicationStatus.APPLIED) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Status must be SHORTLISTED or REJECTED"
            );
        }

        Application application = applicationRepository
                .findById(applicationId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Application not found"
                ));

        // Recruiter must own the job associated
        // with this application.
        if (!application.getJob()
                .getRecruiter()
                .getId()
                .equals(recruiter.getId())) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Application not found"
            );
        }

        // Once reviewed, an application cannot be changed again.
        if (application.getStatus()
                != Application.ApplicationStatus.APPLIED) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Application has already been reviewed"
            );
        }

        application.setStatus(newStatus);

        Application saved =
                applicationRepository.saveAndFlush(application);

        return new ApplicationResponse(saved);
    }

    // ---------------------------------------------------------
    // PRIVATE: VERIFY USER ROLE AND ACCOUNT STATUS
    // ---------------------------------------------------------

    private User getUserWithRole(
            String email,
            User.Role requiredRole) {

        if (email == null || email.isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication required"
            );
        }

        User user = userRepository
                .findByEmail(
                        email.trim().toLowerCase(Locale.ROOT)
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "User not found"
                ));

        if (user.getRole() != requiredRole) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not authorized for this operation"
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

    // ---------------------------------------------------------
    // PRIVATE: VERIFY JOB BELONGS TO RECRUITER
    // ---------------------------------------------------------

    private Job getOwnedJob(
            Long jobId,
            Long recruiterId) {

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Job not found"
                ));

        if (!job.getRecruiter()
                .getId()
                .equals(recruiterId)) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Job not found"
            );
        }

        return job;
    }
}
