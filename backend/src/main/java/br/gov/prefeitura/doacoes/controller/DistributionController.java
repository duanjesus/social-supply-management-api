package br.gov.prefeitura.doacoes.controller;

import br.gov.prefeitura.doacoes.dto.request.DistributionRequestDTO;
import br.gov.prefeitura.doacoes.dto.response.DistributionResponseDTO;
import br.gov.prefeitura.doacoes.service.DistributionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/distributions")
@RequiredArgsConstructor
@Tag(name = "Distribuições", description = "Registro da distribuição de produtos do estoque para as instituições")
public class DistributionController {

    private final DistributionService distributionService;

    @PostMapping
    @Operation(summary = "Registrar distribuição")
    public ResponseEntity<DistributionResponseDTO> register(@Valid @RequestBody DistributionRequestDTO dto) {
        DistributionResponseDTO created = distributionService.register(dto);
        return ResponseEntity.created(URI.create("/api/v1/distributions/" + created.id())).body(created);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar distribuição por ID")
    public ResponseEntity<DistributionResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(distributionService.findById(id));
    }

    @GetMapping
    @Operation(summary = "Listar distribuições",
            description = "Filtros opcionais startDate/endDate (yyyy-MM-dd) e institutionId")
    public ResponseEntity<Page<DistributionResponseDTO>> findAll(
            @PageableDefault(size = 20, sort = "distributionDate") Pageable pageable,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long institutionId) {
        return ResponseEntity.ok(distributionService.findAll(pageable, startDate, endDate, institutionId));
    }

}
