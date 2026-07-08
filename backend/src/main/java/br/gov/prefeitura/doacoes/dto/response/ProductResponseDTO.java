package br.gov.prefeitura.doacoes.dto.response;

import br.gov.prefeitura.doacoes.entity.enums.ProductCategory;
import br.gov.prefeitura.doacoes.entity.enums.ProductUnit;

public record ProductResponseDTO(
        Long id,
        String name,
        String description,
        ProductCategory category,
        ProductUnit unit
) {
}
