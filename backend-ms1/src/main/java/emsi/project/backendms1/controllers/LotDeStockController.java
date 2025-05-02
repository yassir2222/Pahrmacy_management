package emsi.project.backendms1.controllers;

import emsi.project.backendms1.models.LotDeStock;
import emsi.project.backendms1.service.StockService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/stock")
public class LotDeStockController {

    @Autowired
    private StockService stockService;

    @PostMapping("/add")
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

    @PostMapping("/remove")
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
}
