package br.gov.prefeitura.doacoes.controller;

import br.gov.prefeitura.doacoes.dto.request.ProductRequestDTO;
import br.gov.prefeitura.doacoes.dto.response.ProductResponseDTO;
import br.gov.prefeitura.doacoes.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Tag(name = "Produtos", description = "Cadastro e gestão dos produtos que compõem o estoque")
public class ProductController {

    private final ProductService productService;

    @PostMapping
    @Operation(summary = "Cadastrar produto")
    public ResponseEntity<ProductResponseDTO> create(@Valid @RequestBody ProductRequestDTO dto) {
        ProductResponseDTO created = productService.create(dto);
        return ResponseEntity.created(URI.create("/api/v1/products/" + created.id())).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Editar produto")
    public ResponseEntity<ProductResponseDTO> update(@PathVariable Long id,
                                                      @Valid @RequestBody ProductRequestDTO dto) {
        return ResponseEntity.ok(productService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir produto")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        productService.delete(id);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar produto por ID")
    public ResponseEntity<ProductResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.findById(id));
    }

    @GetMapping
    @Operation(summary = "Listar produtos")
    public ResponseEntity<Page<ProductResponseDTO>> findAll(@PageableDefault(size = 20, sort = "name") Pageable pageable) {
        return ResponseEntity.ok(productService.findAll(pageable));
    }

}
