package emsi.project.backendms1.models;

import emsi.project.backendms1.enums.FormeEnum;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private int quantiteTotaleEnStock;

    @OneToMany(mappedBy = "produit", fetch = FetchType.LAZY)
    private List<LigneVente> ligneVentes= new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNomMedicament() {
        return nomMedicament;
    }

    public void setNomMedicament(String nomMedicament) {
        this.nomMedicament = nomMedicament;
    }

    public List<LotDeStock> getLotDeStocks() {
        return lotDeStocks;
    }

    public void setLotDeStocks(List<LotDeStock> lotDeStocks) {
        this.lotDeStocks = lotDeStocks;
    }

    public String getCodeEAN() {
        return codeEAN;
    }

    public void setCodeEAN(String codeEAN) {
        this.codeEAN = codeEAN;
    }

    public BigDecimal getPrixVenteTTC() {
        return prixVenteTTC;
    }

    public void setPrixVenteTTC(BigDecimal prixVenteTTC) {
        this.prixVenteTTC = prixVenteTTC;
    }

    public BigDecimal getPrixAchatHT() {
        return prixAchatHT;
    }

    public void setPrixAchatHT(BigDecimal prixAchatHT) {
        this.prixAchatHT = prixAchatHT;
    }

    public Integer getSeuilStock() {
        return seuilStock;
    }

    public void setSeuilStock(Integer seuilStock) {
        this.seuilStock = seuilStock;
    }

    public FormeEnum getForme() {
        return forme;
    }

    public void setForme(FormeEnum forme) {
        this.forme = forme;
    }

    public String getDosage() {
        return dosage;
    }

    public void setDosage(String dosage) {
        this.dosage = dosage;
    }

    public int getQuantiteTotaleEnStock() {
        return quantiteTotaleEnStock;
    }

    public void setQuantiteTotaleEnStock(int quantiteTotaleEnStock) {

        this.quantiteTotaleEnStock = quantiteTotaleEnStock;
    }

    public List<LigneVente> getLigneVentes() {
        return ligneVentes;
    }

    public void setLigneVentes(List<LigneVente> ligneVentes) {
        this.ligneVentes = ligneVentes;
    }
}
