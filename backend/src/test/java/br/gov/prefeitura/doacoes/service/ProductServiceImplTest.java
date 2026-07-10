package br.gov.prefeitura.doacoes.service;

import br.gov.prefeitura.doacoes.dto.request.ProductRequestDTO;
import br.gov.prefeitura.doacoes.dto.response.ProductResponseDTO;
import br.gov.prefeitura.doacoes.entity.Product;
import br.gov.prefeitura.doacoes.entity.enums.ProductCategory;
import br.gov.prefeitura.doacoes.entity.enums.ProductUnit;
import br.gov.prefeitura.doacoes.exception.DuplicateResourceException;
import br.gov.prefeitura.doacoes.exception.ResourceNotFoundException;
import br.gov.prefeitura.doacoes.mapper.ProductMapper;
import br.gov.prefeitura.doacoes.repository.ProductRepository;
import br.gov.prefeitura.doacoes.service.impl.ProductServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProductService")
class ProductServiceImplTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductMapper productMapper;

    @InjectMocks
    private ProductServiceImpl productService;

    private ProductRequestDTO requestDTO;
    private Product product;

    @BeforeEach
    void setUp() {
        requestDTO = new ProductRequestDTO(
                "Arroz", "Arroz branco tipo 1", ProductCategory.ALIMENTO, ProductUnit.KG, BigDecimal.TEN);

        product = Product.builder()
                .id(1L)
                .name(requestDTO.name())
                .description(requestDTO.description())
                .category(requestDTO.category())
                .unit(requestDTO.unit())
                .currentStock(BigDecimal.ZERO)
                .minimumStock(requestDTO.minimumStock())
                .build();
    }

    @Test
    @DisplayName("Deve cadastrar produto com sucesso quando nome não existe")
    void deveCadastrarProdutoComSucesso() {
        when(productRepository.existsByNameIgnoreCase(requestDTO.name())).thenReturn(false);
        when(productMapper.toEntity(requestDTO)).thenReturn(product);
        when(productRepository.save(any(Product.class))).thenReturn(product);
        when(productMapper.toResponseDto(product)).thenReturn(
                new ProductResponseDTO(1L, requestDTO.name(), requestDTO.description(), requestDTO.category(),
                        requestDTO.unit(), BigDecimal.ZERO, requestDTO.minimumStock(), false)
        );

        ProductResponseDTO response = productService.create(requestDTO);

        assertThat(response).isNotNull();
        assertThat(response.name()).isEqualTo("Arroz");
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    @DisplayName("Deve retornar produtos com estoque igual ou abaixo do mínimo")
    void deveRetornarProdutosComEstoqueBaixo() {
        Product lowStockProduct = Product.builder()
                .id(2L)
                .name("Feijão")
                .category(ProductCategory.ALIMENTO)
                .unit(ProductUnit.KG)
                .currentStock(BigDecimal.valueOf(2))
                .minimumStock(BigDecimal.TEN)
                .build();

        when(productRepository.findLowStock()).thenReturn(List.of(lowStockProduct));
        when(productMapper.toResponseDto(lowStockProduct)).thenReturn(
                new ProductResponseDTO(2L, "Feijão", null, ProductCategory.ALIMENTO, ProductUnit.KG,
                        BigDecimal.valueOf(2), BigDecimal.TEN, true)
        );

        List<ProductResponseDTO> response = productService.findLowStock();

        assertThat(response).hasSize(1);
        assertThat(response.get(0).lowStock()).isTrue();
    }

    @Test
    @DisplayName("Deve lançar DuplicateResourceException ao cadastrar produto com nome já existente")
    void deveLancarExcecaoAoCadastrarNomeDuplicado() {
        when(productRepository.existsByNameIgnoreCase(requestDTO.name())).thenReturn(true);

        assertThatThrownBy(() -> productService.create(requestDTO))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining(requestDTO.name());

        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    @DisplayName("Deve lançar ResourceNotFoundException ao buscar produto inexistente")
    void deveLancarExcecaoAoBuscarProdutoInexistente() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.findById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    @DisplayName("Deve excluir produto existente com sucesso")
    void deveExcluirProdutoComSucesso() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        doNothing().when(productRepository).delete(product);

        productService.delete(1L);

        verify(productRepository, times(1)).delete(product);
    }

}
