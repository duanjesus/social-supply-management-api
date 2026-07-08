package br.gov.prefeitura.doacoes.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DonationResponseDTO(
        Long id,
        String donorName,
        String donorDocument,
        ProductResponseDTO product,
        BigDecimal quantity,
        LocalDate donationDate,
        String description
) {
}
