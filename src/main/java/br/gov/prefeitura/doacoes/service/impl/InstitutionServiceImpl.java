package br.gov.prefeitura.doacoes.service.impl;

import br.gov.prefeitura.doacoes.dto.request.InstitutionRequestDTO;
import br.gov.prefeitura.doacoes.dto.response.InstitutionResponseDTO;
import br.gov.prefeitura.doacoes.entity.Institution;
import br.gov.prefeitura.doacoes.exception.DuplicateResourceException;
import br.gov.prefeitura.doacoes.exception.ResourceNotFoundException;
import br.gov.prefeitura.doacoes.mapper.InstitutionMapper;
import br.gov.prefeitura.doacoes.repository.InstitutionRepository;
import br.gov.prefeitura.doacoes.service.InstitutionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class InstitutionServiceImpl implements InstitutionService {

    private final InstitutionRepository institutionRepository;
    private final InstitutionMapper institutionMapper;

    @Override
    public InstitutionResponseDTO create(InstitutionRequestDTO dto) {
        if (institutionRepository.existsByCnpj(dto.cnpj())) {
            throw new DuplicateResourceException("Já existe uma instituição cadastrada com o CNPJ: " + dto.cnpj());
        }

        Institution institution = institutionMapper.toEntity(dto);
        Institution saved = institutionRepository.save(institution);
        return institutionMapper.toResponseDto(saved);
    }

    @Override
    public InstitutionResponseDTO update(Long id, InstitutionRequestDTO dto) {
        Institution institution = findEntityById(id);

        institutionRepository.findByCnpj(dto.cnpj())
                .filter(other -> !other.getId().equals(id))
                .ifPresent(other -> {
                    throw new DuplicateResourceException("Já existe uma instituição cadastrada com o CNPJ: " + dto.cnpj());
                });

        institutionMapper.updateEntityFromDto(dto, institution);
        Institution updated = institutionRepository.save(institution);
        return institutionMapper.toResponseDto(updated);
    }

    @Override
    public void delete(Long id) {
        Institution institution = findEntityById(id);
        institutionRepository.delete(institution);
    }

    @Override
    @Transactional(readOnly = true)
    public InstitutionResponseDTO findById(Long id) {
        return institutionMapper.toResponseDto(findEntityById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InstitutionResponseDTO> findAll(Pageable pageable) {
        return institutionRepository.findAll(pageable)
                .map(institutionMapper::toResponseDto);
    }

    private Institution findEntityById(Long id) {
        return institutionRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Instituição", id));
    }

}
