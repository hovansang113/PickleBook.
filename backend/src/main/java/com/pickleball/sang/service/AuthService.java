package com.pickleball.sang.service;

import com.pickleball.sang.dto.auth.AuthResponse;
import com.pickleball.sang.dto.auth.LoginRequest;
import com.pickleball.sang.dto.auth.RegisterRequest;
import com.pickleball.sang.entity.user.Membership;
import com.pickleball.sang.entity.user.Role;
import com.pickleball.sang.entity.user.Status;
import com.pickleball.sang.entity.user.User;
import com.pickleball.sang.repository.UserRepository;
import com.pickleball.sang.config.JwtUtil;
import com.pickleball.sang.exception.AccountInactiveException;
import com.pickleball.sang.exception.DuplicateEmailException;
import com.pickleball.sang.exception.DuplicateUsernameException;
import com.pickleball.sang.exception.InvalidCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                        PasswordEncoder passwordEncoder,
                        JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException("Email already exists");
        }

        if (userRepository.existsByName(request.getUsername())) {
            throw new DuplicateUsernameException("Username already exists");
        }

        User user = new User();
        user.setName(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole(Role.CUSTOMER);
        user.setTotalPoints(0);
        user.setMembershipTier(Membership.BRONZE);
        user.setStatus(Status.ACTIVE);

        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getName(), user.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        if (user.getStatus() == Status.INACTIVE) {
            throw new AccountInactiveException("This account has been deactivated");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getName(), user.getRole().name());
    }

    public String logout() {
        return "Logged out successfully";
    }
}
