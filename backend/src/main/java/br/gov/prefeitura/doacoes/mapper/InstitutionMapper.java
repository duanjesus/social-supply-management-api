package br.gov.prefeitura.doacoes.mapper;

import br.gov.prefeitura.doacoes.dto.request.InstitutionRequestDTO;
import br.gov.prefeitura.doacoes.dto.response.InstitutionResponseDTO;
import br.gov.prefeitura.doacoes.entity.Institution;
import org.springframework.stereotype.Component;

@Component
public class InstitutionMapper {

    public Institution toEntity(InstitutionRequestDTO dto) {
        return Institution.builder()
                .name(dto.name())
                .cnpj(dto.cnpj())
                .address(dto.address())
                .phone(dto.phone())
                .email(dto.email())
                .responsibleName(dto.responsibleName())
                .familiesServed(dto.familiesServed())
                .active(dto.active() != null ? dto.active() : Boolean.TRUE)
                .build();
    }

    public void updateEntityFromDto(InstitutionRequestDTO dto, Institution entity) {
        entity.setName(dto.name());
        entity.setCnpj(dto.cnpj());
        entity.setAddress(dto.address());
        entity.setPhone(dto.phone());
        entity.setEmail(dto.email());
        entity.setResponsibleName(dto.responsibleName());
        entity.setFamiliesServed(dto.familiesServed());
        if (dto.active() != null) {
            entity.setActive(dto.active());
        }
    }

    public InstitutionResponseDTO toResponseDto(Institution entity) {
        return new InstitutionResponseDTO(
                entity.getId(),
                entity.getName(),
                entity.getCnpj(),
                entity.getAddress(),
                entity.getPhone(),
                entity.getEmail(),
                entity.getResponsibleName(),
                entity.getFamiliesServed(),
                entity.getActive()
        );
    }

}
