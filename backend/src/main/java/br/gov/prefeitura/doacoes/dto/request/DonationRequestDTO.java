package br.gov.prefeitura.doacoes.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DonationRequestDTO(

        @NotBlank(message = "O nome do doador é obrigatório")
        @Size(max = 150)
        String donorName,

        @Size(max = 20)
        String donorDocument,

        @NotNull(message = "O produto é obrigatório")
        Long productId,

        @NotNull(message = "A quantidade é obrigatória")
        @DecimalMin(value = "0.001", message = "A quantidade deve ser maior que zero")
        BigDecimal quantity,

        @NotNull(message = "A data da doação é obrigatória")
        @PastOrPresent(message = "A data da doação não pode ser futura")
        LocalDate donationDate,

        @Size(max = 500)
        String description

) {
}
