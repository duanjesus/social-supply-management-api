package br.gov.prefeitura.doacoes.dto.response;

import br.gov.prefeitura.doacoes.entity.enums.ProductCategory;
import br.gov.prefeitura.doacoes.entity.enums.ProductUnit;

import java.math.BigDecimal;

public record ProductResponseDTO(
        Long id,
        String name,
        String description,
        ProductCategory category,
        ProductUnit unit,
        BigDecimal currentStock,
        BigDecimal minimumStock,
        boolean lowStock
) {
}
