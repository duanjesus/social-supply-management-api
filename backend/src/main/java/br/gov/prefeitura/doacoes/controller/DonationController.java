package br.gov.prefeitura.doacoes.controller;

import br.gov.prefeitura.doacoes.dto.request.DonationRequestDTO;
import br.gov.prefeitura.doacoes.dto.response.DonationResponseDTO;
import br.gov.prefeitura.doacoes.service.DonationService;
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
@RequestMapping("/api/v1/donations")
@RequiredArgsConstructor
@Tag(name = "Doações", description = "Registro das doações recebidas para o estoque")
public class DonationController {

    private final DonationService donationService;

    @PostMapping
    @Operation(summary = "Registrar doação")
    public ResponseEntity<DonationResponseDTO> register(@Valid @RequestBody DonationRequestDTO dto) {
        DonationResponseDTO created = donationService.register(dto);
        return ResponseEntity.created(URI.create("/api/v1/donations/" + created.id())).body(created);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar doação por ID")
    public ResponseEntity<DonationResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(donationService.findById(id));
    }

    @GetMapping
    @Operation(summary = "Listar doações", description = "Filtros opcionais startDate/endDate (yyyy-MM-dd) por período")
    public ResponseEntity<Page<DonationResponseDTO>> findAll(
            @PageableDefault(size = 20, sort = "donationDate") Pageable pageable,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(donationService.findAll(pageable, startDate, endDate));
    }

}
