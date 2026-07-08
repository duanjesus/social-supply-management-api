package br.gov.prefeitura.doacoes.service;

import br.gov.prefeitura.doacoes.dto.request.DonationRequestDTO;
import br.gov.prefeitura.doacoes.dto.response.DonationResponseDTO;
import br.gov.prefeitura.doacoes.dto.response.ProductResponseDTO;
import br.gov.prefeitura.doacoes.entity.Donation;
import br.gov.prefeitura.doacoes.entity.Product;
import br.gov.prefeitura.doacoes.entity.enums.ProductCategory;
import br.gov.prefeitura.doacoes.entity.enums.ProductUnit;
import br.gov.prefeitura.doacoes.exception.ResourceNotFoundException;
import br.gov.prefeitura.doacoes.mapper.DonationMapper;
import br.gov.prefeitura.doacoes.repository.DonationRepository;
import br.gov.prefeitura.doacoes.repository.ProductRepository;
import br.gov.prefeitura.doacoes.service.impl.DonationServiceImpl;
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
@DisplayName("DonationService")
class DonationServiceImplTest {

    @Mock
    private DonationRepository donationRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private DonationMapper donationMapper;

    @InjectMocks
    private DonationServiceImpl donationService;

    private DonationRequestDTO requestDTO;
    private Product product;
    private Donation donation;

    @BeforeEach
    void setUp() {
        requestDTO = new DonationRequestDTO(
                "João da Silva", "123.456.789-00", 1L,
                BigDecimal.valueOf(50), LocalDate.now(), "Doação mensal"
        );

        product = Product.builder()
                .id(1L)
                .name("Arroz")
                .category(ProductCategory.ALIMENTO)
                .unit(ProductUnit.KG)
                .build();

        donation = Donation.builder()
                .id(1L)
                .donorName(requestDTO.donorName())
                .donorDocument(requestDTO.donorDocument())
                .product(product)
                .quantity(requestDTO.quantity())
                .donationDate(requestDTO.donationDate())
                .description(requestDTO.description())
                .build();
    }

    @Test
    @DisplayName("Deve registrar doação com sucesso quando produto existe")
    void deveRegistrarDoacaoComSucesso() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(donationRepository.save(any(Donation.class))).thenReturn(donation);
        when(donationMapper.toResponseDto(donation)).thenReturn(
                new DonationResponseDTO(1L, requestDTO.donorName(), requestDTO.donorDocument(),
                        new ProductResponseDTO(1L, "Arroz", null, ProductCategory.ALIMENTO, ProductUnit.KG),
                        requestDTO.quantity(), requestDTO.donationDate(), requestDTO.description())
        );

        DonationResponseDTO response = donationService.register(requestDTO);

        assertThat(response).isNotNull();
        assertThat(response.donorName()).isEqualTo("João da Silva");
        verify(donationRepository, times(1)).save(any(Donation.class));
    }

    @Test
    @DisplayName("Deve lançar ResourceNotFoundException ao registrar doação com produto inexistente")
    void deveLancarExcecaoQuandoProdutoNaoExiste() {
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> donationService.register(requestDTO))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(donationRepository, never()).save(any(Donation.class));
    }

}
