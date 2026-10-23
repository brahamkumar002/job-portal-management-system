package com.jobportal.service;

import com.jobportal.dto.RegisterRequest;
import com.jobportal.dto.UserResponse;
import com.jobportal.entity.User;
import com.jobportal.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    // Constructor injection

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    // Register candidate or recruiter

    @Transactional
    public UserResponse register(RegisterRequest request) {

        // Only candidates and recruiters can register publicly

        if (request.getRole() != User.Role.CANDIDATE
                && request.getRole() != User.Role.RECRUITER) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only CANDIDATE or RECRUITER registration is allowed"
            );
        }

        // Normalize email

        String email = request.getEmail()
                .trim()
                .toLowerCase(Locale.ROOT);

        // Check duplicate email

        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email is already registered"
            );
        }

        // Create user entity

        User user = new User();

        user.setFullName(request.getFullName().trim());
        user.setEmail(email);

        // Never store plain-text passwords

        user.setPasswordHash(
                passwordEncoder.encode(request.getPassword())
        );

        user.setRole(request.getRole());
        user.setEnabled(true);

        // Save user to MySQL

        User savedUser = userRepository.saveAndFlush(user);

        // Return safe DTO without password hash

        return new UserResponse(savedUser);
    }
}