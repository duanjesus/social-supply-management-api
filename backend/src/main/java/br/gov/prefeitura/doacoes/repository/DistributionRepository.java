package br.gov.prefeitura.doacoes.repository;

import br.gov.prefeitura.doacoes.entity.Distribution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface DistributionRepository extends JpaRepository<Distribution, Long>, JpaSpecificationExecutor<Distribution> {
}
