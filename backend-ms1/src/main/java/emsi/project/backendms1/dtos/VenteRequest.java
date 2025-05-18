package emsi.project.backendms1.dtos;


import java.util.List;


public class VenteRequest {
    private List<LigneVenteRequest> lignesVente;

    public List<LigneVenteRequest> getLignesVente() {
        return lignesVente;
    }

    public void setLignesVente(List<LigneVenteRequest> lignesVente) {
        this.lignesVente = lignesVente;
    }
}
