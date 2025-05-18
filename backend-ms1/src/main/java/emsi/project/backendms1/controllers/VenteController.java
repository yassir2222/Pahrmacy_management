package emsi.project.backendms1.controllers;


import emsi.project.backendms1.dtos.VenteRequest;
import emsi.project.backendms1.models.Vente;
import emsi.project.backendms1.service.VenteService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/ventes")
public class VenteController {

    @Autowired
    private VenteService venteService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_USER')")
    public ResponseEntity<?> creerVente( @RequestBody VenteRequest venteRequest) {
        try {
            Vente nouvelleVente = venteService.creerVente(venteRequest);
            return new ResponseEntity<>(nouvelleVente, HttpStatus.CREATED);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Une erreur interne est survenue lors de la création de la vente.");
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_USER')")
    public ResponseEntity<Vente> getVenteById(@PathVariable Long id) {
        Optional<Vente> vente = venteService.getVenteById(id);
        return vente.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_USER')")
    public ResponseEntity<List<Vente>> getAllVentes() {
        List<Vente> ventes = venteService.getAllVentes();
        if (ventes.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(ventes);
    }

}
