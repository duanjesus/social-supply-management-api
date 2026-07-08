package br.gov.prefeitura.doacoes.repository;

import br.gov.prefeitura.doacoes.entity.Institution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InstitutionRepository extends JpaRepository<Institution, Long> {

    boolean existsByCnpj(String cnpj);

    Optional<Institution> findByCnpj(String cnpj);

}
