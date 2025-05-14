package emsi.project.backendms1.controllers;

import emsi.project.backendms1.models.LotDeStock;
import emsi.project.backendms1.models.Produit;
import emsi.project.backendms1.service.ProduitService;
import emsi.project.backendms1.service.StockService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/stock")
public class LotDeStockController {

    @Autowired
    private StockService stockService;

    @Autowired
    private ProduitService produitService;

    @PostMapping("/add")
    @PreAuthorize("hasAnyRole('ROLE_USER')")
    public ResponseEntity<?> addStock(
            @RequestParam Long productId,
            @RequestParam String numeroLot,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateExpiration,
            @RequestParam int quantite,
            @RequestParam BigDecimal prixAchatHT) {

        try {
            LotDeStock newStock = stockService.addStock(productId, numeroLot, dateExpiration, quantite, prixAchatHT);
            return ResponseEntity.status(HttpStatus.CREATED).body(newStock);
        } catch (IllegalArgumentException | EntityNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }
    @PostMapping("/update")
    @PreAuthorize("hasAnyRole('ROLE_USER')")
    public ResponseEntity<?> updateStock(
            @RequestParam Long lotId,
            @RequestParam String numeroLot,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateExpiration,
            @RequestParam int quantite,
            @RequestParam BigDecimal prixAchatHT) {

        try {
            LotDeStock updatedStock = stockService.updateStockLot(lotId, numeroLot, dateExpiration, quantite, prixAchatHT);
            return ResponseEntity.ok(updatedStock);
        } catch (IllegalArgumentException | EntityNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
            @PostMapping("/remove")
            @PreAuthorize("hasAnyRole('ROLE_USER')")
    public ResponseEntity<?> removeStock(@RequestParam Long lotId, @RequestParam int quantity) {
        try {
            LotDeStock updatedStock = stockService.removeStockFromLot(lotId, quantity);
            return ResponseEntity.ok(updatedStock);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }


    @GetMapping("/{produitId}/stocks")
    @PreAuthorize("hasAnyRole('ROLE_USER')")
    public ResponseEntity<List<LotDeStock>> getAllStocksForProduit(@PathVariable Long produitId) {
         Produit produit = produitService.getProduitById(produitId);
         if (produit == null) {
            return ResponseEntity.notFound().build();
        }
        List<LotDeStock> stocks = stockService.findAllStocksByProduitId(produitId);
        if (stocks.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(stocks);
    }

    @DeleteMapping("/lot/{lotId}")
    @PreAuthorize("hasAnyRole('ROLE_USER')")
    public ResponseEntity<?> removeLot(@PathVariable Long lotId) {
        try {
            stockService.removeLot(lotId);
            return ResponseEntity.ok().body("Lot supprimé avec succès");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la suppression du lot: " + e.getMessage());
        }
    }
}
