package com.foody.minitracker.service;

import com.foody.minitracker.domain.User;
import com.foody.minitracker.dto.AuthDtos.AuthResponse;
import com.foody.minitracker.dto.AuthDtos.LoginRequest;
import com.foody.minitracker.dto.AuthDtos.RegisterRequest;
import com.foody.minitracker.dto.AuthDtos.UserInfo;
import com.foody.minitracker.exception.ConflictException;
import com.foody.minitracker.repository.UserRepository;
import com.foody.minitracker.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new ConflictException("Já existe um usuário cadastrado com este e-mail.");
        }

        User user = new User(
                request.name().trim(),
                normalizedEmail,
                passwordEncoder.encode(request.password())
        );

        User saved = userRepository.save(user);
        String token = jwtService.generateToken(saved);
        return new AuthResponse(token, new UserInfo(saved.getId(), saved.getName(), saved.getEmail()));
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.password())
        );

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow();
        String token = jwtService.generateToken(user);
        return new AuthResponse(token, new UserInfo(user.getId(), user.getName(), user.getEmail()));
    }
}
