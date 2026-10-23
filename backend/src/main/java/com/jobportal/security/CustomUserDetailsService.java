package com.jobportal.security;

import com.jobportal.entity.User;
import com.jobportal.repository.UserRepository;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    // Constructor injection

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Spring Security calls this method during authentication

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        // Normalize email to match registration format

        String normalizedEmail = email.trim()
                .toLowerCase(Locale.ROOT);

        // Find user from MySQL database

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Invalid email or password"
                ));

        // Convert our User entity into Spring Security UserDetails

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPasswordHash())
                .authorities("ROLE_" + user.getRole().name())
                .disabled(!Boolean.TRUE.equals(user.getEnabled()))
                .build();
    }
}