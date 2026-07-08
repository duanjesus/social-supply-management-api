package br.gov.prefeitura.doacoes.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DistributionResponseDTO(
        Long id,
        InstitutionResponseDTO institution,
        ProductResponseDTO product,
        BigDecimal quantity,
        LocalDate distributionDate,
        String responsibleName,
        String observation
) {
}
