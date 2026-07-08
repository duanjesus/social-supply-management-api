package br.gov.prefeitura.doacoes.service;

import br.gov.prefeitura.doacoes.dto.response.UserResponseDTO;
import br.gov.prefeitura.doacoes.entity.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {

    Page<UserResponseDTO> findAll(Pageable pageable);

    UserResponseDTO updateRole(Long id, UserRole newRole, String currentUserEmail);

}
