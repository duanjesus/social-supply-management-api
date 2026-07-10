package br.gov.prefeitura.doacoes.service.impl;

import br.gov.prefeitura.doacoes.dto.request.ProductRequestDTO;
import br.gov.prefeitura.doacoes.dto.response.ProductResponseDTO;
import br.gov.prefeitura.doacoes.entity.Product;
import br.gov.prefeitura.doacoes.exception.DuplicateResourceException;
import br.gov.prefeitura.doacoes.exception.ResourceNotFoundException;
import br.gov.prefeitura.doacoes.mapper.ProductMapper;
import br.gov.prefeitura.doacoes.repository.ProductRepository;
import br.gov.prefeitura.doacoes.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    @Override
    public ProductResponseDTO create(ProductRequestDTO dto) {
        if (productRepository.existsByNameIgnoreCase(dto.name())) {
            throw new DuplicateResourceException("Já existe um produto cadastrado com o nome: " + dto.name());
        }

        Product product = productMapper.toEntity(dto);
        Product saved = productRepository.save(product);
        return productMapper.toResponseDto(saved);
    }

    @Override
    public ProductResponseDTO update(Long id, ProductRequestDTO dto) {
        Product product = findEntityById(id);

        if (!product.getName().equalsIgnoreCase(dto.name()) && productRepository.existsByNameIgnoreCase(dto.name())) {
            throw new DuplicateResourceException("Já existe um produto cadastrado com o nome: " + dto.name());
        }

        productMapper.updateEntityFromDto(dto, product);
        Product updated = productRepository.save(product);
        return productMapper.toResponseDto(updated);
    }

    @Override
    public void delete(Long id) {
        Product product = findEntityById(id);
        productRepository.delete(product);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponseDTO findById(Long id) {
        return productMapper.toResponseDto(findEntityById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponseDTO> findAll(Pageable pageable) {
        return productRepository.findAll(pageable)
                .map(productMapper::toResponseDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponseDTO> findLowStock() {
        return productRepository.findLowStock().stream()
                .map(productMapper::toResponseDto)
                .toList();
    }

    private Product findEntityById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Produto", id));
    }

}
