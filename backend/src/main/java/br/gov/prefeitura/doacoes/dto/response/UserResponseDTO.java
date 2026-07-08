package br.gov.prefeitura.doacoes.dto.response;

import br.gov.prefeitura.doacoes.entity.enums.UserRole;

public record UserResponseDTO(
        Long id,
        String name,
        String email,
        UserRole role,
        Boolean active
) {
}
