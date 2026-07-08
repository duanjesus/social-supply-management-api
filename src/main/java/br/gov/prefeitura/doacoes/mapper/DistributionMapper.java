package br.gov.prefeitura.doacoes.mapper;

import br.gov.prefeitura.doacoes.dto.response.DistributionResponseDTO;
import br.gov.prefeitura.doacoes.entity.Distribution;
import org.springframework.stereotype.Component;

@Component
public class DistributionMapper {

    private final InstitutionMapper institutionMapper;
    private final ProductMapper productMapper;

    public DistributionMapper(InstitutionMapper institutionMapper, ProductMapper productMapper) {
        this.institutionMapper = institutionMapper;
        this.productMapper = productMapper;
    }

    public DistributionResponseDTO toResponseDto(Distribution entity) {
        return new DistributionResponseDTO(
                entity.getId(),
                institutionMapper.toResponseDto(entity.getInstitution()),
                productMapper.toResponseDto(entity.getProduct()),
                entity.getQuantity(),
                entity.getDistributionDate(),
                entity.getResponsibleName(),
                entity.getObservation()
        );
    }

}
