package br.gov.prefeitura.doacoes.dto.response;

import br.gov.prefeitura.doacoes.entity.enums.UserRole;

public record AuthResponseDTO(
        String token,
        String tokenType,
        Long expiresInMs,
        String name,
        String email,
        UserRole role
) {

    public static AuthResponseDTO of(String token, Long expiresInMs, String name, String email, UserRole role) {
        return new AuthResponseDTO(token, "Bearer", expiresInMs, name, email, role);
    }

}
