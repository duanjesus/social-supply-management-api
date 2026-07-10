package br.gov.prefeitura.doacoes.service;

import br.gov.prefeitura.doacoes.dto.request.DistributionRequestDTO;
import br.gov.prefeitura.doacoes.dto.response.DistributionResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface DistributionService {

    DistributionResponseDTO register(DistributionRequestDTO dto);

    DistributionResponseDTO findById(Long id);

    Page<DistributionResponseDTO> findAll(Pageable pageable, LocalDate startDate, LocalDate endDate, Long institutionId);

}
