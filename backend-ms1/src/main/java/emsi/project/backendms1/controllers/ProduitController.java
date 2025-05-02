package emsi.project.backendms1.controllers;

import emsi.project.backendms1.models.Produit;
import emsi.project.backendms1.service.ProduitService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/produits")
public class ProduitController {

    @Autowired
    private ProduitService produitService;


    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ROLE_USER')")
    public ResponseEntity<List<Produit>> getAllProduits() {
        return ResponseEntity.ok(produitService.findAllProducts());
    }

    @PostMapping("/add")
    @PreAuthorize("hasAnyRole('ROLE_USER')")
    public ResponseEntity<?> createProduit(@RequestBody Produit produit) {
        try {
            Produit produitn = new Produit();
            produitn.setNomMedicament(produit.getNomMedicament());
            produitn.setCodeEAN(produit.getCodeEAN());
            produitn.setPrixVenteTTC(produit.getPrixVenteTTC());
            produitn.setPrixAchatHT(produit.getPrixAchatHT());
            produitn.setSeuilStock(produit.getSeuilStock());
            produitn.setForme(produit.getForme());
            produitn.setDosage(produit.getDosage());
            produitn.setQuantiteTotaleEnStock(produit.getQuantiteTotaleEnStock());
            produitn.setId(produit.getId());
            Produit createdProduit = produitService.createProduct(produitn);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdProduit);
        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasAnyRole('ROLE_USER')")
    public ResponseEntity<?> updateProduit(@PathVariable Long id, @RequestBody Produit produit) {
        try {
            Produit updatedProduit = produitService.updateProduct(id, produit);
            return ResponseEntity.ok(updatedProduit);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAnyRole('ROLE_USER')")
    public ResponseEntity<?> deleteProduit(@PathVariable Long id) {
        try {
            produitService.deleteProduct(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
