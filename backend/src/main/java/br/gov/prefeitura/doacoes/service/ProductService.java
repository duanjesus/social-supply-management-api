package br.gov.prefeitura.doacoes.service;

import br.gov.prefeitura.doacoes.dto.request.ProductRequestDTO;
import br.gov.prefeitura.doacoes.dto.response.ProductResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductService {

    ProductResponseDTO create(ProductRequestDTO dto);

    ProductResponseDTO update(Long id, ProductRequestDTO dto);

    void delete(Long id);

    ProductResponseDTO findById(Long id);

    Page<ProductResponseDTO> findAll(Pageable pageable);

    List<ProductResponseDTO> findLowStock();

}
