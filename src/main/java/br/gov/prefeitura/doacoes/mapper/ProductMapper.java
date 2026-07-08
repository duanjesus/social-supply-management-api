package br.gov.prefeitura.doacoes.mapper;

import br.gov.prefeitura.doacoes.dto.request.ProductRequestDTO;
import br.gov.prefeitura.doacoes.dto.response.ProductResponseDTO;
import br.gov.prefeitura.doacoes.entity.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public Product toEntity(ProductRequestDTO dto) {
        return Product.builder()
                .name(dto.name())
                .description(dto.description())
                .category(dto.category())
                .unit(dto.unit())
                .build();
    }

    public void updateEntityFromDto(ProductRequestDTO dto, Product entity) {
        entity.setName(dto.name());
        entity.setDescription(dto.description());
        entity.setCategory(dto.category());
        entity.setUnit(dto.unit());
    }

    public ProductResponseDTO toResponseDto(Product entity) {
        return new ProductResponseDTO(
                entity.getId(),
                entity.getName(),
                entity.getDescription(),
                entity.getCategory(),
                entity.getUnit()
        );
    }

}
