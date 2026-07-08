package br.gov.prefeitura.doacoes.service.impl;

import br.gov.prefeitura.doacoes.dto.request.DonationRequestDTO;
import br.gov.prefeitura.doacoes.dto.response.DonationResponseDTO;
import br.gov.prefeitura.doacoes.entity.Donation;
import br.gov.prefeitura.doacoes.entity.Product;
import br.gov.prefeitura.doacoes.exception.ResourceNotFoundException;
import br.gov.prefeitura.doacoes.mapper.DonationMapper;
import br.gov.prefeitura.doacoes.repository.DonationRepository;
import br.gov.prefeitura.doacoes.repository.ProductRepository;
import br.gov.prefeitura.doacoes.service.DonationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class DonationServiceImpl implements DonationService {

    private final DonationRepository donationRepository;
    private final ProductRepository productRepository;
    private final DonationMapper donationMapper;

    @Override
    public DonationResponseDTO register(DonationRequestDTO dto) {
        Product product = productRepository.findById(dto.productId())
                .orElseThrow(() -> ResourceNotFoundException.of("Produto", dto.productId()));

        Donation donation = Donation.builder()
                .donorName(dto.donorName())
                .donorDocument(dto.donorDocument())
                .product(product)
                .quantity(dto.quantity())
                .donationDate(dto.donationDate())
                .description(dto.description())
                .build();

        Donation saved = donationRepository.save(donation);
        return donationMapper.toResponseDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public DonationResponseDTO findById(Long id) {
        Donation donation = donationRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Doação", id));
        return donationMapper.toResponseDto(donation);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DonationResponseDTO> findAll(Pageable pageable) {
        return donationRepository.findAll(pageable)
                .map(donationMapper::toResponseDto);
    }

}
