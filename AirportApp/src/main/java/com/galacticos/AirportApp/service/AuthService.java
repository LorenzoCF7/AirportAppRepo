package com.galacticos.AirportApp.service;

import com.galacticos.AirportApp.config.JwtTokenProvider;
import com.galacticos.AirportApp.dto.request.LoginRequest;
import com.galacticos.AirportApp.dto.request.RegisterRequest;
import com.galacticos.AirportApp.dto.response.AuthResponse;
import com.galacticos.AirportApp.entity.User;
import com.galacticos.AirportApp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getUsername());

        return new AuthResponse(user.getId(), user.getUsername(), user.getEmail(), token);
    }

    public AuthResponse register(RegisterRequest request) {
        // Validar que el usuario no exista
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("El usuario ya existe");
        }

        // Crear nuevo usuario
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        userRepository.save(user);

        // Generar token
        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getUsername());

        return new AuthResponse(user.getId(), user.getUsername(), user.getEmail(), token);
    }
}
