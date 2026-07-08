package br.gov.prefeitura.doacoes.dto.response;

public record InstitutionResponseDTO(
        Long id,
        String name,
        String cnpj,
        String address,
        String phone,
        String email,
        String responsibleName,
        Integer familiesServed,
        Boolean active
) {
}
