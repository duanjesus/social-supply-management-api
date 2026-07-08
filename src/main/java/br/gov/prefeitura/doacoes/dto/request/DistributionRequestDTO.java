package br.gov.prefeitura.doacoes.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DistributionRequestDTO(

        @NotNull(message = "A instituição é obrigatória")
        Long institutionId,

        @NotNull(message = "O produto é obrigatório")
        Long productId,

        @NotNull(message = "A quantidade é obrigatória")
        @DecimalMin(value = "0.001", message = "A quantidade deve ser maior que zero")
        BigDecimal quantity,

        @NotNull(message = "A data da distribuição é obrigatória")
        @PastOrPresent(message = "A data da distribuição não pode ser futura")
        LocalDate distributionDate,

        @Size(max = 150)
        String responsibleName,

        @Size(max = 500)
        String observation

) {
}
