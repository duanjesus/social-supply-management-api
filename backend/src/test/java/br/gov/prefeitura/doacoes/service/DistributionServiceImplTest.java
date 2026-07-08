package br.gov.prefeitura.doacoes.service;

import br.gov.prefeitura.doacoes.dto.request.DistributionRequestDTO;
import br.gov.prefeitura.doacoes.dto.response.DistributionResponseDTO;
import br.gov.prefeitura.doacoes.dto.response.InstitutionResponseDTO;
import br.gov.prefeitura.doacoes.dto.response.ProductResponseDTO;
import br.gov.prefeitura.doacoes.entity.Distribution;
import br.gov.prefeitura.doacoes.entity.Institution;
import br.gov.prefeitura.doacoes.entity.Product;
import br.gov.prefeitura.doacoes.entity.enums.ProductCategory;
import br.gov.prefeitura.doacoes.entity.enums.ProductUnit;
import br.gov.prefeitura.doacoes.exception.ResourceNotFoundException;
import br.gov.prefeitura.doacoes.mapper.DistributionMapper;
import br.gov.prefeitura.doacoes.repository.DistributionRepository;
import br.gov.prefeitura.doacoes.repository.InstitutionRepository;
import br.gov.prefeitura.doacoes.repository.ProductRepository;
import br.gov.prefeitura.doacoes.service.impl.DistributionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("DistributionService")
class DistributionServiceImplTest {

    @Mock
    private DistributionRepository distributionRepository;

    @Mock
    private InstitutionRepository institutionRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private DistributionMapper distributionMapper;

    @InjectMocks
    private DistributionServiceImpl distributionService;

    private DistributionRequestDTO requestDTO;
    private Institution institution;
    private Product product;
    private Distribution distribution;

    @BeforeEach
    void setUp() {
        requestDTO = new DistributionRequestDTO(
                1L, 1L, BigDecimal.valueOf(20), LocalDate.now(), "Ana Souza", "Entrega mensal"
        );

        institution = Institution.builder().id(1L).name("Lar São Vicente").cnpj("12345678000190").active(true).build();
        product = Product.builder().id(1L).name("Arroz").category(ProductCategory.ALIMENTO).unit(ProductUnit.KG).build();

        distribution = Distribution.builder()
                .id(1L)
                .institution(institution)
                .product(product)
                .quantity(requestDTO.quantity())
                .distributionDate(requestDTO.distributionDate())
                .responsibleName(requestDTO.responsibleName())
                .observation(requestDTO.observation())
                .build();
    }

    @Test
    @DisplayName("Deve registrar distribuição com sucesso quando instituição e produto existem")
    void deveRegistrarDistribuicaoComSucesso() {
        when(institutionRepository.findById(1L)).thenReturn(Optional.of(institution));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(distributionRepository.save(any(Distribution.class))).thenReturn(distribution);
        when(distributionMapper.toResponseDto(distribution)).thenReturn(
                new DistributionResponseDTO(1L,
                        new InstitutionResponseDTO(1L, "Lar São Vicente", "12345678000190", null, null, null, null, null, true),
                        new ProductResponseDTO(1L, "Arroz", null, ProductCategory.ALIMENTO, ProductUnit.KG),
                        requestDTO.quantity(), requestDTO.distributionDate(), requestDTO.responsibleName(), requestDTO.observation())
        );

        DistributionResponseDTO response = distributionService.register(requestDTO);

        assertThat(response).isNotNull();
        assertThat(response.quantity()).isEqualByComparingTo(BigDecimal.valueOf(20));
        verify(distributionRepository, times(1)).save(any(Distribution.class));
    }

    @Test
    @DisplayName("Deve lançar ResourceNotFoundException quando instituição não existe")
    void deveLancarExcecaoQuandoInstituicaoNaoExiste() {
        when(institutionRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> distributionService.register(requestDTO))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(distributionRepository, never()).save(any(Distribution.class));
    }

    @Test
    @DisplayName("Deve lançar ResourceNotFoundException quando produto não existe")
    void deveLancarExcecaoQuandoProdutoNaoExiste() {
        when(institutionRepository.findById(1L)).thenReturn(Optional.of(institution));
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> distributionService.register(requestDTO))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(distributionRepository, never()).save(any(Distribution.class));
    }

}
