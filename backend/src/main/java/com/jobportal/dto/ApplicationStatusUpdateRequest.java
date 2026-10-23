package com.jobportal.dto;

import com.jobportal.entity.Application;
import jakarta.validation.constraints.NotNull;

public class ApplicationStatusUpdateRequest {

    @NotNull(message = "Application status is required")
    private Application.ApplicationStatus status;

    public ApplicationStatusUpdateRequest() {
    }

    public Application.ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(Application.ApplicationStatus status) {
        this.status = status;
    }
}
