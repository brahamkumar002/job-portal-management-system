
CREATE DATABASE IF NOT EXISTS job_portal_db;

USE job_portal_db;


-- =========================================
-- 1. USERS
-- =========================================

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,

    role ENUM(
        'CANDIDATE',
        'RECRUITER',
        'ADMIN'
    ) NOT NULL,

    enabled BOOLEAN NOT NULL DEFAULT TRUE,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);


-- =========================================
-- 2. CANDIDATE PROFILES
-- =========================================

CREATE TABLE candidate_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT NOT NULL UNIQUE,

    -- Personal Information
    phone VARCHAR(20),
    gender VARCHAR(30),
    city VARCHAR(100),
    state VARCHAR(100),

    -- Academic Information
    qualification VARCHAR(150),
    specialization VARCHAR(150),
    college_name VARCHAR(200),
    graduation_year SMALLINT,
    cgpa DECIMAL(4,2),

    -- Professional Information
    experience_level ENUM(
        'FRESHER',
        'EXPERIENCED'
    ),
    years_of_experience DECIMAL(4,1),
    current_job_title VARCHAR(150),
    preferred_job_location VARCHAR(150),
    notice_period VARCHAR(50),

    -- Technical Skills
    technical_skills TEXT,

    -- Resume and Social Links
    resume_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    github_url VARCHAR(500),
    portfolio_url VARCHAR(500),

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id),

    CONSTRAINT chk_candidate_experience
        CHECK (
            years_of_experience IS NULL
            OR years_of_experience >= 0
        ),

    CONSTRAINT chk_candidate_cgpa
        CHECK (
            cgpa IS NULL
            OR cgpa BETWEEN 0 AND 10
        )
);


-- =========================================
-- 3. CANDIDATE PROJECTS
-- =========================================

CREATE TABLE candidate_projects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    candidate_id BIGINT NOT NULL,

    project_name VARCHAR(150) NOT NULL,
    tech_stack VARCHAR(500),
    description TEXT,
    github_url VARCHAR(500),
    live_url VARCHAR(500),

    FOREIGN KEY (candidate_id) REFERENCES users(id)
);


-- =========================================
-- 4. JOBS
-- =========================================

CREATE TABLE jobs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    recruiter_id BIGINT NOT NULL,

    title VARCHAR(150) NOT NULL,
    company_name VARCHAR(150) NOT NULL,

    description TEXT NOT NULL,
    requirements TEXT,
    location VARCHAR(150) NOT NULL,

    employment_type ENUM(
        'FULL_TIME',
        'PART_TIME',
        'INTERNSHIP',
        'CONTRACT'
    ) NOT NULL,

    work_mode ENUM(
        'ONSITE',
        'REMOTE',
        'HYBRID'
    ) NOT NULL,

    salary_min DECIMAL(12,2),
    salary_max DECIMAL(12,2),

    status ENUM(
        'OPEN',
        'CLOSED'
    ) NOT NULL DEFAULT 'OPEN',

    application_deadline DATE NOT NULL,
    closed_at DATETIME NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (recruiter_id) REFERENCES users(id),

    CONSTRAINT chk_job_salary
        CHECK (
            (salary_min IS NULL OR salary_min >= 0)
            AND (salary_max IS NULL OR salary_max >= 0)
            AND (
                salary_min IS NULL
                OR salary_max IS NULL
                OR salary_max >= salary_min
            )
        )
);


-- =========================================
-- 5. APPLICATIONS
-- =========================================

CREATE TABLE applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    job_id BIGINT NOT NULL,
    candidate_id BIGINT NOT NULL,

    status ENUM(
        'APPLIED',
        'SHORTLISTED',
        'REJECTED'
    ) NOT NULL DEFAULT 'APPLIED',

    applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (job_id) REFERENCES jobs(id),
    FOREIGN KEY (candidate_id) REFERENCES users(id),

    UNIQUE (job_id, candidate_id)
);
