
package com.jobportal.repository;

import com.jobportal.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationRepository
        extends JpaRepository<Application, Long> {

    // Check whether candidate already applied for a job
    boolean existsByJobIdAndCandidateId(
            Long jobId,
            Long candidateId
    );

    // Candidate: View all my applications, latest first
    List<Application> findByCandidateIdOrderByAppliedAtDesc(
            Long candidateId
    );

    // Recruiter: View applications received for a job
    List<Application> findByJobIdOrderByAppliedAtDesc(
            Long jobId
    );
}
