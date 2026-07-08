package br.gov.prefeitura.doacoes.service;

import br.gov.prefeitura.doacoes.dto.request.LoginRequestDTO;
import br.gov.prefeitura.doacoes.dto.request.RegisterRequestDTO;
import br.gov.prefeitura.doacoes.dto.response.AuthResponseDTO;
import br.gov.prefeitura.doacoes.entity.User;
import br.gov.prefeitura.doacoes.entity.enums.UserRole;
import br.gov.prefeitura.doacoes.exception.DuplicateResourceException;
import br.gov.prefeitura.doacoes.exception.InvalidCredentialsException;
import br.gov.prefeitura.doacoes.repository.UserRepository;
import br.gov.prefeitura.doacoes.security.JwtService;
import br.gov.prefeitura.doacoes.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService")
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthServiceImpl authService;

    private RegisterRequestDTO registerRequestDTO;
    private LoginRequestDTO loginRequestDTO;
    private User user;

    @BeforeEach
    void setUp() {
        registerRequestDTO = new RegisterRequestDTO("Ana Souza", "ana@example.org", "supersecret123", UserRole.OPERATOR);
        loginRequestDTO = new LoginRequestDTO("ana@example.org", "supersecret123");

        user = User.builder()
                .id(1L)
                .name("Ana Souza")
                .email("ana@example.org")
                .password("encoded-password")
                .role(UserRole.OPERATOR)
                .active(true)
                .build();
    }

    @Test
    @DisplayName("Should register a new user successfully when email does not exist yet")
    void deveRegistrarUsuarioComSucesso() {
        when(userRepository.existsByEmail(registerRequestDTO.email())).thenReturn(false);
        when(passwordEncoder.encode(registerRequestDTO.password())).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(jwtService.generateToken(any())).thenReturn("fake-jwt-token");
        when(jwtService.getExpirationMs()).thenReturn(86_400_000L);

        AuthResponseDTO response = authService.register(registerRequestDTO);

        assertThat(response).isNotNull();
        assertThat(response.token()).isEqualTo("fake-jwt-token");
        assertThat(response.email()).isEqualTo("ana@example.org");
        assertThat(response.role()).isEqualTo(UserRole.OPERATOR);
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw DuplicateResourceException when email is already registered")
    void deveLancarExcecaoQuandoEmailJaExiste() {
        when(userRepository.existsByEmail(registerRequestDTO.email())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequestDTO))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining(registerRequestDTO.email());

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should authenticate and return a token when credentials are valid")
    void deveAutenticarComSucesso() {
        when(userRepository.findByEmail(loginRequestDTO.email())).thenReturn(Optional.of(user));
        when(jwtService.generateToken(any())).thenReturn("fake-jwt-token");
        when(jwtService.getExpirationMs()).thenReturn(86_400_000L);

        AuthResponseDTO response = authService.login(loginRequestDTO);

        assertThat(response).isNotNull();
        assertThat(response.token()).isEqualTo("fake-jwt-token");
        verify(authenticationManager, times(1)).authenticate(any());
    }

    @Test
    @DisplayName("Should throw InvalidCredentialsException when credentials are invalid")
    void deveLancarExcecaoQuandoCredenciaisInvalidas() {
        doThrow(new BadCredentialsException("Bad credentials"))
                .when(authenticationManager).authenticate(any());

        assertThatThrownBy(() -> authService.login(loginRequestDTO))
                .isInstanceOf(InvalidCredentialsException.class);

        verify(userRepository, never()).findByEmail(any());
    }

}
