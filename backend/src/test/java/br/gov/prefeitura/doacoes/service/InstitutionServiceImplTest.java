package br.gov.prefeitura.doacoes.service;

import br.gov.prefeitura.doacoes.dto.request.InstitutionRequestDTO;
import br.gov.prefeitura.doacoes.dto.response.InstitutionResponseDTO;
import br.gov.prefeitura.doacoes.entity.Institution;
import br.gov.prefeitura.doacoes.exception.DuplicateResourceException;
import br.gov.prefeitura.doacoes.exception.ResourceNotFoundException;
import br.gov.prefeitura.doacoes.mapper.InstitutionMapper;
import br.gov.prefeitura.doacoes.repository.InstitutionRepository;
import br.gov.prefeitura.doacoes.service.impl.InstitutionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("InstitutionService")
class InstitutionServiceImplTest {

    @Mock
    private InstitutionRepository institutionRepository;

    @Mock
    private InstitutionMapper institutionMapper;

    @InjectMocks
    private InstitutionServiceImpl institutionService;

    private InstitutionRequestDTO requestDTO;
    private Institution institution;

    @BeforeEach
    void setUp() {
        requestDTO = new InstitutionRequestDTO(
                "Lar São Vicente",
                "12.345.678/0001-90",
                "Rua das Flores, 100",
                "(21) 99999-0000",
                "contato@larsaovicente.org",
                "Maria Silva",
                42,
                true
        );

        institution = Institution.builder()
                .id(1L)
                .name(requestDTO.name())
                .cnpj(requestDTO.cnpj())
                .address(requestDTO.address())
                .phone(requestDTO.phone())
                .email(requestDTO.email())
                .responsibleName(requestDTO.responsibleName())
                .familiesServed(requestDTO.familiesServed())
                .active(true)
                .build();
    }

    @Test
    @DisplayName("Deve cadastrar instituição com sucesso quando CNPJ não existe")
    void deveCadastrarInstituicaoComSucesso() {
        when(institutionRepository.existsByCnpj(requestDTO.cnpj())).thenReturn(false);
        when(institutionRepository.save(any(Institution.class))).thenReturn(institution);
        when(institutionMapper.toEntity(requestDTO)).thenReturn(institution);
        when(institutionMapper.toResponseDto(institution)).thenReturn(
                new InstitutionResponseDTO(1L, requestDTO.name(), requestDTO.cnpj(), requestDTO.address(),
                        requestDTO.phone(), requestDTO.email(), requestDTO.responsibleName(),
                        requestDTO.familiesServed(), true)
        );

        InstitutionResponseDTO response = institutionService.create(requestDTO);

        assertThat(response).isNotNull();
        assertThat(response.name()).isEqualTo("Lar São Vicente");
        verify(institutionRepository, times(1)).save(any(Institution.class));
    }

    @Test
    @DisplayName("Deve lançar DuplicateResourceException ao cadastrar CNPJ já existente")
    void deveLancarExcecaoAoCadastrarCnpjDuplicado() {
        when(institutionRepository.existsByCnpj(requestDTO.cnpj())).thenReturn(true);

        assertThatThrownBy(() -> institutionService.create(requestDTO))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining(requestDTO.cnpj());

        verify(institutionRepository, never()).save(any(Institution.class));
    }

    @Test
    @DisplayName("Deve lançar ResourceNotFoundException ao buscar instituição inexistente")
    void deveLancarExcecaoAoBuscarInstituicaoInexistente() {
        when(institutionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> institutionService.findById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    @DisplayName("Deve excluir instituição existente com sucesso")
    void deveExcluirInstituicaoComSucesso() {
        when(institutionRepository.findById(1L)).thenReturn(Optional.of(institution));
        doNothing().when(institutionRepository).delete(institution);

        institutionService.delete(1L);

        verify(institutionRepository, times(1)).delete(institution);
    }

    @Test
    @DisplayName("Não deve lançar exceção ao editar mantendo o mesmo CNPJ")
    void naoDeveLancarExcecaoAoEditarMantendoMesmoCnpj() {
        when(institutionRepository.findById(1L)).thenReturn(Optional.of(institution));
        when(institutionRepository.findByCnpj(requestDTO.cnpj())).thenReturn(Optional.of(institution));
        when(institutionRepository.save(any(Institution.class))).thenReturn(institution);
        when(institutionMapper.toResponseDto(institution)).thenReturn(
                new InstitutionResponseDTO(1L, requestDTO.name(), requestDTO.cnpj(), requestDTO.address(),
                        requestDTO.phone(), requestDTO.email(), requestDTO.responsibleName(),
                        requestDTO.familiesServed(), true)
        );

        InstitutionResponseDTO response = institutionService.update(1L, requestDTO);

        assertThat(response).isNotNull();
        verify(institutionMapper, times(1)).updateEntityFromDto(requestDTO, institution);
    }

}
