package br.gov.prefeitura.doacoes.entity;

import br.gov.prefeitura.doacoes.entity.enums.ProductCategory;
import br.gov.prefeitura.doacoes.entity.enums.ProductUnit;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.experimental.SuperBuilder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;

@Getter
@Setter
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "products")
public class Product extends BaseEntity {

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProductCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProductUnit unit;

    /**
     * Running stock balance: incremented on donation, decremented on distribution
     * (see DonationServiceImpl / DistributionServiceImpl). Never set directly by
     * the client — {@code columnDefinition} default lets ddl-auto=update backfill
     * existing rows when this column is first added.
     */
    @Column(name = "current_stock", nullable = false, precision = 19, scale = 3,
            columnDefinition = "numeric(19,3) default 0")
    @Builder.Default
    private BigDecimal currentStock = BigDecimal.ZERO;

    /** Optional alert threshold; null means no low-stock alert configured for this product. */
    @Column(name = "minimum_stock", precision = 19, scale = 3)
    private BigDecimal minimumStock;

}
