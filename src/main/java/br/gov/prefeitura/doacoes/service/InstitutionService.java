package br.gov.prefeitura.doacoes.service;

import br.gov.prefeitura.doacoes.dto.request.InstitutionRequestDTO;
import br.gov.prefeitura.doacoes.dto.response.InstitutionResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface InstitutionService {

    InstitutionResponseDTO create(InstitutionRequestDTO dto);

    InstitutionResponseDTO update(Long id, InstitutionRequestDTO dto);

    void delete(Long id);

    InstitutionResponseDTO findById(Long id);

    Page<InstitutionResponseDTO> findAll(Pageable pageable);

}
