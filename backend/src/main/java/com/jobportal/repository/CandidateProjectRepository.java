package com.jobportal.repository;

import com.jobportal.entity.CandidateProject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CandidateProjectRepository
        extends JpaRepository<CandidateProject, Long> {

    List<CandidateProject> findByCandidateId(Long candidateId);

    long countByCandidateId(Long candidateId);
}