package br.gov.prefeitura.doacoes.service.impl;

import br.gov.prefeitura.doacoes.dto.request.LoginRequestDTO;
import br.gov.prefeitura.doacoes.dto.request.RegisterRequestDTO;
import br.gov.prefeitura.doacoes.dto.response.AuthResponseDTO;
import br.gov.prefeitura.doacoes.entity.User;
import br.gov.prefeitura.doacoes.entity.enums.UserRole;
import br.gov.prefeitura.doacoes.exception.DuplicateResourceException;
import br.gov.prefeitura.doacoes.exception.InvalidCredentialsException;
import br.gov.prefeitura.doacoes.repository.UserRepository;
import br.gov.prefeitura.doacoes.security.JwtService;
import br.gov.prefeitura.doacoes.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Override
    public AuthResponseDTO register(RegisterRequestDTO dto) {
        if (userRepository.existsByEmail(dto.email())) {
            throw new DuplicateResourceException("There is already a user registered with the email: " + dto.email());
        }

        // The role is never taken from client input: the first user to ever
        // register becomes ADMIN (bootstrap), everyone after that is OPERATOR.
        // Promotions afterwards go through UserService, restricted to ADMIN.
        UserRole role = userRepository.count() == 0 ? UserRole.ADMIN : UserRole.OPERATOR;

        User user = User.builder()
                .name(dto.name())
                .email(dto.email())
                .password(passwordEncoder.encode(dto.password()))
                .role(role)
                .active(true)
                .build();

        userRepository.save(user);

        return buildAuthResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponseDTO login(LoginRequestDTO dto) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dto.email(), dto.password())
            );
        } catch (BadCredentialsException ex) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        User user = userRepository.findByEmail(dto.email())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        return buildAuthResponse(user);
    }

    private AuthResponseDTO buildAuthResponse(User user) {
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities("ROLE_" + user.getRole().name())
                .build();

        String token = jwtService.generateToken(userDetails);

        return AuthResponseDTO.of(token, jwtService.getExpirationMs(), user.getName(), user.getEmail(), user.getRole());
    }

}
