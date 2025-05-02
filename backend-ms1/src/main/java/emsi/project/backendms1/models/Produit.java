package emsi.project.backendms1.models;

import emsi.project.backendms1.enums.FormeEnum;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.antlr.v4.runtime.misc.NotNull;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Produit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nomMedicament;

    @Column(nullable = true)
    @OneToMany(mappedBy = "produit", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<LotDeStock> lotDeStocks = new ArrayList<>();

    @Column(length = 13)
    private String codeEAN;

    private BigDecimal prixVenteTTC;

    private BigDecimal prixAchatHT;

    @Column(nullable = false)
    private Integer seuilStock;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FormeEnum forme;

    private String dosage;

    @Column(nullable = false)
    private int quantiteTotaleEnStock = 0;


}
