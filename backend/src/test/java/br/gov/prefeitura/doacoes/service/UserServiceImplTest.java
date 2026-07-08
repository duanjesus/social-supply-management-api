package br.gov.prefeitura.doacoes.service;

import br.gov.prefeitura.doacoes.dto.response.UserResponseDTO;
import br.gov.prefeitura.doacoes.entity.User;
import br.gov.prefeitura.doacoes.entity.enums.UserRole;
import br.gov.prefeitura.doacoes.exception.BusinessException;
import br.gov.prefeitura.doacoes.exception.ResourceNotFoundException;
import br.gov.prefeitura.doacoes.mapper.UserMapper;
import br.gov.prefeitura.doacoes.repository.UserRepository;
import br.gov.prefeitura.doacoes.service.impl.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserService")
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserServiceImpl userService;

    private User operator;

    @BeforeEach
    void setUp() {
        operator = User.builder()
                .id(2L)
                .name("Bruno Lima")
                .email("bruno@example.org")
                .password("encoded-password")
                .role(UserRole.OPERATOR)
                .active(true)
                .build();
    }

    @Test
    @DisplayName("Should promote a user to ADMIN when requested by a different user")
    void devePromoverUsuarioParaAdmin() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(operator));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userMapper.toResponseDto(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            return new UserResponseDTO(u.getId(), u.getName(), u.getEmail(), u.getRole(), u.getActive());
        });

        UserResponseDTO response = userService.updateRole(2L, UserRole.ADMIN, "admin@example.org");

        assertThat(response.role()).isEqualTo(UserRole.ADMIN);
        verify(userRepository, times(1)).save(argThat(u -> u.getRole() == UserRole.ADMIN));
    }

    @Test
    @DisplayName("Should throw BusinessException when a user tries to change their own role")
    void deveLancarExcecaoAoAlterarPropriaRole() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(operator));

        assertThatThrownBy(() -> userService.updateRole(2L, UserRole.ADMIN, "bruno@example.org"))
                .isInstanceOf(BusinessException.class);

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when user does not exist")
    void deveLancarExcecaoQuandoUsuarioNaoExiste() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.updateRole(99L, UserRole.ADMIN, "admin@example.org"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

}
