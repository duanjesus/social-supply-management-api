package br.gov.prefeitura.doacoes.service.impl;

import br.gov.prefeitura.doacoes.dto.request.DistributionRequestDTO;
import br.gov.prefeitura.doacoes.dto.response.DistributionResponseDTO;
import br.gov.prefeitura.doacoes.entity.Distribution;
import br.gov.prefeitura.doacoes.entity.Institution;
import br.gov.prefeitura.doacoes.entity.Product;
import br.gov.prefeitura.doacoes.exception.BusinessException;
import br.gov.prefeitura.doacoes.exception.ResourceNotFoundException;
import br.gov.prefeitura.doacoes.mapper.DistributionMapper;
import br.gov.prefeitura.doacoes.repository.DistributionRepository;
import br.gov.prefeitura.doacoes.repository.InstitutionRepository;
import br.gov.prefeitura.doacoes.repository.ProductRepository;
import br.gov.prefeitura.doacoes.service.DistributionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class DistributionServiceImpl implements DistributionService {

    private final DistributionRepository distributionRepository;
    private final InstitutionRepository institutionRepository;
    private final ProductRepository productRepository;
    private final DistributionMapper distributionMapper;

    @Override
    public DistributionResponseDTO register(DistributionRequestDTO dto) {
        Institution institution = institutionRepository.findById(dto.institutionId())
                .orElseThrow(() -> ResourceNotFoundException.of("Instituição", dto.institutionId()));

        Product product = productRepository.findById(dto.productId())
                .orElseThrow(() -> ResourceNotFoundException.of("Produto", dto.productId()));

        if (product.getCurrentStock().compareTo(dto.quantity()) < 0) {
            throw new BusinessException(
                    "Estoque insuficiente de " + product.getName() + ". Disponível: "
                            + product.getCurrentStock() + " " + product.getUnit());
        }

        Distribution distribution = Distribution.builder()
                .institution(institution)
                .product(product)
                .quantity(dto.quantity())
                .distributionDate(dto.distributionDate())
                .responsibleName(dto.responsibleName())
                .observation(dto.observation())
                .build();

        Distribution saved = distributionRepository.save(distribution);

        product.setCurrentStock(product.getCurrentStock().subtract(dto.quantity()));
        productRepository.save(product);

        return distributionMapper.toResponseDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public DistributionResponseDTO findById(Long id) {
        Distribution distribution = distributionRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Distribuição", id));
        return distributionMapper.toResponseDto(distribution);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DistributionResponseDTO> findAll(Pageable pageable) {
        return distributionRepository.findAll(pageable)
                .map(distributionMapper::toResponseDto);
    }

}
