package br.gov.prefeitura.doacoes.mapper;

import br.gov.prefeitura.doacoes.dto.response.UserResponseDTO;
import br.gov.prefeitura.doacoes.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponseDTO toResponseDto(User entity) {
        return new UserResponseDTO(
                entity.getId(),
                entity.getName(),
                entity.getEmail(),
                entity.getRole(),
                entity.getActive()
        );
    }

}
