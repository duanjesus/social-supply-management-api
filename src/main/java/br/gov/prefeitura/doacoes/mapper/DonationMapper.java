package br.gov.prefeitura.doacoes.mapper;

import br.gov.prefeitura.doacoes.dto.response.DonationResponseDTO;
import br.gov.prefeitura.doacoes.entity.Donation;
import org.springframework.stereotype.Component;

@Component
public class DonationMapper {

    private final ProductMapper productMapper;

    public DonationMapper(ProductMapper productMapper) {
        this.productMapper = productMapper;
    }

    public DonationResponseDTO toResponseDto(Donation entity) {
        return new DonationResponseDTO(
                entity.getId(),
                entity.getDonorName(),
                entity.getDonorDocument(),
                productMapper.toResponseDto(entity.getProduct()),
                entity.getQuantity(),
                entity.getDonationDate(),
                entity.getDescription()
        );
    }

}
