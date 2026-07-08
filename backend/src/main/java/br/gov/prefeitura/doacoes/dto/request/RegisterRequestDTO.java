package br.gov.prefeitura.doacoes.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Public self-registration payload. Deliberately has no "role" field: a
 * client-supplied role would let anyone register as ADMIN. The role is
 * decided server-side by {@link br.gov.prefeitura.doacoes.service.impl.AuthServiceImpl}
 * (first user in the system becomes ADMIN, everyone else OPERATOR). Promoting
 * a user afterwards requires an existing ADMIN via {@code PATCH /api/v1/users/{id}/role}.
 */
public record RegisterRequestDTO(

        @NotBlank(message = "Name is required")
        @Size(max = 150, message = "Name must be at most 150 characters")
        String name,

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        @Size(max = 150, message = "Email must be at most 150 characters")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
        String password

) {
}
