package emsi.project.backendms1.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.antlr.v4.runtime.misc.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class LotDeStock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(nullable = false, length = 100)
    private String numeroLot;

    @Column(nullable = false)
    private LocalDate dateExpiration;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false) // Clé étrangère dans la table stock_lots
    private Produit produit;

    @Column(nullable = false)
    private int quantite;

    @Column(precision = 10, scale = 2)
    private BigDecimal prixAchatHT;

    private LocalDate dateReception;
}
