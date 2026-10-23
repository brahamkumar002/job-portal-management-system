
package com.jobportal.repository;

import com.jobportal.entity.Job;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {

    // Recruiter ki saari jobs - latest first
    List<Job> findByRecruiterIdOrderByCreatedAtDesc(
            Long recruiterId
    );

    // Public: open jobs with valid deadline
    List<Job> findByStatusAndApplicationDeadlineGreaterThanEqualOrderByCreatedAtDesc(
            Job.JobStatus status,
            LocalDate applicationDeadline
    );

    // Public: search open jobs by title, company or location
    @Query("""
            SELECT j
            FROM Job j
            WHERE j.status = :status
              AND j.applicationDeadline >= :today
              AND (
                  LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                  OR LOWER(j.companyName) LIKE LOWER(CONCAT('%', :keyword, '%'))
                  OR LOWER(j.location) LIKE LOWER(CONCAT('%', :keyword, '%'))
              )
            ORDER BY j.createdAt DESC
            """)
    List<Job> searchOpenJobs(
            @Param("status") Job.JobStatus status,
            @Param("today") LocalDate today,
            @Param("keyword") String keyword
    );
}