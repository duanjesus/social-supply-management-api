package br.gov.prefeitura.doacoes.service.impl;

import br.gov.prefeitura.doacoes.dto.response.UserResponseDTO;
import br.gov.prefeitura.doacoes.entity.User;
import br.gov.prefeitura.doacoes.entity.enums.UserRole;
import br.gov.prefeitura.doacoes.exception.BusinessException;
import br.gov.prefeitura.doacoes.exception.ResourceNotFoundException;
import br.gov.prefeitura.doacoes.mapper.UserMapper;
import br.gov.prefeitura.doacoes.repository.UserRepository;
import br.gov.prefeitura.doacoes.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponseDTO> findAll(Pageable pageable) {
        return userRepository.findAll(pageable).map(userMapper::toResponseDto);
    }

    @Override
    public UserResponseDTO updateRole(Long id, UserRole newRole, String currentUserEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Usuário", id));

        if (user.getEmail().equalsIgnoreCase(currentUserEmail)) {
            throw new BusinessException("Você não pode alterar o seu próprio papel");
        }

        user.setRole(newRole);
        User updated = userRepository.save(user);
        return userMapper.toResponseDto(updated);
    }

}
