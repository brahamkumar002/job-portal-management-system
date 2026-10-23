package com.jobportal.service;

import com.jobportal.dto.JobRequest;
import com.jobportal.dto.JobResponse;
import com.jobportal.entity.Job;
import com.jobportal.entity.User;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public JobService(
            JobRepository jobRepository,
            UserRepository userRepository) {

        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
    }

    // RECRUITER: CREATE JOB

    @Transactional
    public JobResponse createJob(
            String email,
            JobRequest request) {

        User recruiter = getRecruiter(email);

        validateDeadline(request);

        Job job = new Job();
        job.setRecruiter(recruiter);
        job.setStatus(Job.JobStatus.OPEN);

        updateFields(job, request);

        Job savedJob = jobRepository.saveAndFlush(job);

        return new JobResponse(savedJob);
    }

    // RECRUITER: VIEW MY JOBS

    @Transactional(readOnly = true)
    public List<JobResponse> getMyJobs(String email) {

        User recruiter = getRecruiter(email);

        return jobRepository
                .findByRecruiterIdOrderByCreatedAtDesc(
                        recruiter.getId()
                )
                .stream()
                .map(JobResponse::new)
                .toList();
    }

    // RECRUITER: UPDATE OWN JOB

    @Transactional
    public JobResponse updateJob(
            String email,
            Long jobId,
            JobRequest request) {

        User recruiter = getRecruiter(email);

        Job job = getOwnedJob(jobId, recruiter.getId());

        if (job.getStatus() == Job.JobStatus.CLOSED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Closed jobs cannot be updated"
            );
        }

        validateDeadline(request);

        updateFields(job, request);

        Job savedJob = jobRepository.saveAndFlush(job);

        return new JobResponse(savedJob);
    }

    // RECRUITER: CLOSE OWN JOB

    @Transactional
    public JobResponse closeJob(
            String email,
            Long jobId) {

        User recruiter = getRecruiter(email);

        Job job = getOwnedJob(jobId, recruiter.getId());

        if (job.getStatus() == Job.JobStatus.CLOSED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Job is already closed"
            );
        }

        job.setStatus(Job.JobStatus.CLOSED);
        job.setClosedAt(LocalDateTime.now());

        Job savedJob = jobRepository.saveAndFlush(job);

        return new JobResponse(savedJob);
    }

    // PUBLIC: VIEW AVAILABLE JOBS

    @Transactional(readOnly = true)
    public List<JobResponse> getOpenJobs() {

        return jobRepository
                .findByStatusAndApplicationDeadlineGreaterThanEqualOrderByCreatedAtDesc(
                        Job.JobStatus.OPEN,
                        LocalDate.now()
                )
                .stream()
                .map(JobResponse::new)
                .toList();
    }

    // PUBLIC: SEARCH AVAILABLE JOBS

    @Transactional(readOnly = true)
    public List<JobResponse> searchOpenJobs(String keyword) {

        if (keyword == null || keyword.isBlank()) {
            return getOpenJobs();
        }

        return jobRepository
                .searchOpenJobs(
                        Job.JobStatus.OPEN,
                        LocalDate.now(),
                        keyword.trim()
                )
                .stream()
                .map(JobResponse::new)
                .toList();
    }

    // PUBLIC: VIEW SINGLE AVAILABLE JOB

    @Transactional(readOnly = true)
    public JobResponse getOpenJobById(Long jobId) {

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Job not found"
                ));

        if (job.getStatus() != Job.JobStatus.OPEN
                || job.getApplicationDeadline()
                .isBefore(LocalDate.now())) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Job not found"
            );
        }

        return new JobResponse(job);
    }

    // VERIFY LOGGED-IN RECRUITER

    private User getRecruiter(String email) {

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

        if (user.getRole() != User.Role.RECRUITER) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only recruiters can manage jobs"
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

    // VERIFY JOB OWNERSHIP

    private Job getOwnedJob(
            Long jobId,
            Long recruiterId) {

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Job not found"
                ));

        if (!job.getRecruiter().getId().equals(recruiterId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Job not found"
            );
        }

        return job;
    }

    // VALIDATE DEADLINE AT SERVICE LEVEL

    private void validateDeadline(JobRequest request) {

        if (request.getApplicationDeadline() == null
                || request.getApplicationDeadline()
                .isBefore(LocalDate.now())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Application deadline must be today or a future date"
            );
        }
    }

    // COPY REQUEST FIELDS INTO JOB ENTITY

    private void updateFields(Job job, JobRequest request) {

        job.setTitle(request.getTitle());
        job.setCompanyName(request.getCompanyName());
        job.setDescription(request.getDescription());
        job.setRequirements(request.getRequirements());
        job.setLocation(request.getLocation());

        job.setEmploymentType(request.getEmploymentType());
        job.setWorkMode(request.getWorkMode());

        job.setSalaryMin(request.getSalaryMin());
        job.setSalaryMax(request.getSalaryMax());

        job.setApplicationDeadline(
                request.getApplicationDeadline()
        );
    }
}