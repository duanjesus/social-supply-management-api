package br.gov.prefeitura.doacoes.service;

import br.gov.prefeitura.doacoes.dto.request.DonationRequestDTO;
import br.gov.prefeitura.doacoes.dto.response.DonationResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface DonationService {

    DonationResponseDTO register(DonationRequestDTO dto);

    DonationResponseDTO findById(Long id);

    Page<DonationResponseDTO> findAll(Pageable pageable, LocalDate startDate, LocalDate endDate);

}
