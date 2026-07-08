package br.gov.prefeitura.doacoes.dto.request;

import br.gov.prefeitura.doacoes.entity.enums.UserRole;
import jakarta.validation.constraints.NotNull;

public record UpdateUserRoleRequestDTO(

        @NotNull(message = "O papel é obrigatório")
        UserRole role

) {
}
