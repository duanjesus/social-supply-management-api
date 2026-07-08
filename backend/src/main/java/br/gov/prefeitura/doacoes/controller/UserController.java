package br.gov.prefeitura.doacoes.controller;

import br.gov.prefeitura.doacoes.dto.request.UpdateUserRoleRequestDTO;
import br.gov.prefeitura.doacoes.dto.response.UserResponseDTO;
import br.gov.prefeitura.doacoes.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Usuários", description = "Gestão de usuários e papéis — restrito a ADMIN")
public class UserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Listar usuários")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserResponseDTO>> findAll(@PageableDefault(size = 20, sort = "name") Pageable pageable) {
        return ResponseEntity.ok(userService.findAll(pageable));
    }

    @PatchMapping("/{id}/role")
    @Operation(summary = "Alterar o papel (ADMIN/OPERATOR) de um usuário")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDTO> updateRole(@PathVariable Long id,
                                                        @Valid @RequestBody UpdateUserRoleRequestDTO dto,
                                                        Authentication authentication) {
        return ResponseEntity.ok(userService.updateRole(id, dto.role(), authentication.getName()));
    }

}
