package emsi.project.backendms1.models;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*; // Ou javax.persistence.*

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
@Entity
@Table(name = "lignes_vente")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LigneVente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vente_id", nullable = false)
    @JsonBackReference("vente-lignes")
    private Vente vente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "produit_id", nullable = false)
    @JsonIgnore
    private Produit produit;

    @Column(nullable = false)
    private Integer quantite;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal prixVenteTTC;

    @Column(length = 100)
    private String numeroLotStock;

    private LocalDate dateExpiration;

    public BigDecimal getMontantTotalLigne() {
        if (prixVenteTTC == null || quantite == null) {
            return BigDecimal.ZERO;
        }
        return prixVenteTTC.multiply(BigDecimal.valueOf(quantite));
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Vente getVente() {
        return vente;
    }

    public void setVente(Vente vente) {
        this.vente = vente;
    }

    public Produit getProduit() {
        return produit;
    }

    public void setProduit(Produit produit) {
        this.produit = produit;
    }

    public Integer getQuantite() {
        return quantite;
    }

    public void setQuantite(Integer quantite) {
        this.quantite = quantite;
    }

    public BigDecimal getPrixVenteTTC() {
        return prixVenteTTC;
    }

    public void setPrixVenteTTC(BigDecimal prixVenteTTC) {
        this.prixVenteTTC = prixVenteTTC;
    }

    public String getNumeroLotStock() {
        return numeroLotStock;
    }

    public void setNumeroLotStock(String numeroLotStock) {
        this.numeroLotStock = numeroLotStock;
    }

    public LocalDate getDateExpiration() {
        return dateExpiration;
    }

    public void setDateExpiration(LocalDate dateExpiration) {
        this.dateExpiration = dateExpiration;
    }
}