package emsi.project.backendms1.dtos;



import java.math.BigDecimal;



public class LigneVenteRequest {
    Long produitId;
    Integer quantite;
    BigDecimal prixUnitaireVenteTTC;


    public Long getProduitId() {
        return produitId;
    }

    public void setProduitId(Long produitId) {
        this.produitId = produitId;
    }

    public Integer getQuantite() {
        return quantite;
    }

    public void setQuantite(Integer quantite) {
        this.quantite = quantite;
    }

    public BigDecimal getPrixUnitaireVenteTTC() {
        return prixUnitaireVenteTTC;
    }

    public void setPrixUnitaireVenteTTC(BigDecimal prixUnitaireVenteTTC) {
        this.prixUnitaireVenteTTC = prixUnitaireVenteTTC;
    }
}