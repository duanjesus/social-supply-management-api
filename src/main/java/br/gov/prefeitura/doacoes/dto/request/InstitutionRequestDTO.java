package br.gov.prefeitura.doacoes.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record InstitutionRequestDTO(

        @NotBlank(message = "O nome é obrigatório")
        @Size(max = 150, message = "O nome deve ter no máximo 150 caracteres")
        String name,

        @NotBlank(message = "O CNPJ é obrigatório")
        @Pattern(regexp = "\\d{14}|\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2}",
                message = "CNPJ inválido. Use o formato 00.000.000/0000-00 ou apenas números")
        String cnpj,

        @NotBlank(message = "O endereço é obrigatório")
        @Size(max = 200, message = "O endereço deve ter no máximo 200 caracteres")
        String address,

        @Size(max = 20, message = "O telefone deve ter no máximo 20 caracteres")
        String phone,

        @Email(message = "E-mail inválido")
        @Size(max = 150)
        String email,

        @Size(max = 150)
        String responsibleName,

        @PositiveOrZero(message = "A quantidade de famílias atendidas não pode ser negativa")
        Integer familiesServed,

        Boolean active

) {
}
