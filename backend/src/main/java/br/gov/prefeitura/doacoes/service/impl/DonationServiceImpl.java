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
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

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

        product.setCurrentStock(product.getCurrentStock().add(dto.quantity()));
        productRepository.save(product);

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
    public Page<DonationResponseDTO> findAll(Pageable pageable, LocalDate startDate, LocalDate endDate) {
        Specification<Donation> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("donationDate"), startDate));
            }
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("donationDate"), endDate));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return donationRepository.findAll(spec, pageable)
                .map(donationMapper::toResponseDto);
    }

}
