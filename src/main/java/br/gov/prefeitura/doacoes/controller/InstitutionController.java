package br.gov.prefeitura.doacoes.controller;

import br.gov.prefeitura.doacoes.dto.request.InstitutionRequestDTO;
import br.gov.prefeitura.doacoes.dto.response.InstitutionResponseDTO;
import br.gov.prefeitura.doacoes.service.InstitutionService;
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
@RequestMapping("/api/v1/institutions")
@RequiredArgsConstructor
@Tag(name = "Instituições", description = "Cadastro e gestão das instituições atendidas pela prefeitura")
public class InstitutionController {

    private final InstitutionService institutionService;

    @PostMapping
    @Operation(summary = "Cadastrar instituição")
    public ResponseEntity<InstitutionResponseDTO> create(@Valid @RequestBody InstitutionRequestDTO dto) {
        InstitutionResponseDTO created = institutionService.create(dto);
        return ResponseEntity.created(URI.create("/api/v1/institutions/" + created.id())).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Editar instituição")
    public ResponseEntity<InstitutionResponseDTO> update(@PathVariable Long id,
                                                          @Valid @RequestBody InstitutionRequestDTO dto) {
        return ResponseEntity.ok(institutionService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir instituição")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        institutionService.delete(id);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar instituição por ID")
    public ResponseEntity<InstitutionResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(institutionService.findById(id));
    }

    @GetMapping
    @Operation(summary = "Listar instituições")
    public ResponseEntity<Page<InstitutionResponseDTO>> findAll(@PageableDefault(size = 20, sort = "name") Pageable pageable) {
        return ResponseEntity.ok(institutionService.findAll(pageable));
    }

}
