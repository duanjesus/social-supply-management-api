package br.gov.prefeitura.doacoes.service;

import br.gov.prefeitura.doacoes.dto.request.LoginRequestDTO;
import br.gov.prefeitura.doacoes.dto.request.RegisterRequestDTO;
import br.gov.prefeitura.doacoes.dto.response.AuthResponseDTO;

public interface AuthService {

    AuthResponseDTO register(RegisterRequestDTO dto);

    AuthResponseDTO login(LoginRequestDTO dto);

}
