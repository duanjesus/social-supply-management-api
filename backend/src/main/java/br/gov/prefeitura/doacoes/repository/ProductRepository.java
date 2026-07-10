package br.gov.prefeitura.doacoes.repository;

import br.gov.prefeitura.doacoes.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    boolean existsByNameIgnoreCase(String name);

    @Query("SELECT p FROM Product p WHERE p.minimumStock IS NOT NULL AND p.currentStock <= p.minimumStock ORDER BY p.name")
    List<Product> findLowStock();

}
