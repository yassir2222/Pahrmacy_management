package emsi.project.backendms1.service;

import emsi.project.backendms1.models.LotDeStock;
import emsi.project.backendms1.models.Produit;
import emsi.project.backendms1.repository.LotDeStockRepo;
import emsi.project.backendms1.repository.ProduitRepo;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

@Service
public class StockService {

    @Autowired
    private LotDeStockRepo stockLotRepository;

    @Autowired
    private ProduitRepo productRepository;

    @Autowired
    private ProduitService productService;

    public LotDeStock addStock(Long productId, String numeroLot, LocalDate dateExpiration,
                               int quantite, BigDecimal prixAchatHT) {
        // Validation des paramètres
        if (quantite <= 0) {
            throw new IllegalArgumentException("La quantité doit être positive");
        }

        if (dateExpiration.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("La date d'expiration ne peut pas être dans le passé");
        }

        Produit produit = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Produit non trouvé avec l'ID : " + productId));

        // Vérifier si le lot existe déjà
        Optional<LotDeStock> existingLotOpt = stockLotRepository.findByProduitIdAndNumeroLot(productId, numeroLot);
        if (existingLotOpt.isPresent()) {
            // Si le lot existe, mettre à jour sa quantité
            LotDeStock existingLot = existingLotOpt.get();
            // Vérifier que la date d'expiration correspond
            if (!existingLot.getDateExpiration().equals(dateExpiration)) {
                throw new IllegalStateException("Le lot " + numeroLot + " existe déjà avec une date d'expiration différente");
            }

            existingLot.setQuantite(existingLot.getQuantite() + quantite);
            LotDeStock updatedLot = stockLotRepository.save(existingLot);

            // Mettre à jour le stock total du produit
            updateProductTotalStock(productId);

            return updatedLot;
        }

        // Créer un nouveau lot de stock
        LotDeStock newLot = new LotDeStock();
        newLot.setNumeroLot(numeroLot);
        newLot.setDateExpiration(dateExpiration);
        newLot.setProduit(produit);
        newLot.setQuantite(quantite);
        newLot.setPrixAchatHT(prixAchatHT);
        newLot.setDateReception(LocalDate.now());

        LotDeStock savedLot = stockLotRepository.save(newLot);

        // Mettre à jour le stock total du produit
        updateProductTotalStock(productId);

        return savedLot;
    }

    private void updateProductTotalStock(Long productId) {
        Produit produit = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Produit non trouvé"));

        int totalStock = stockLotRepository.calculateTotalStockQuantityForProduct(productId);
        produit.setQuantiteTotaleEnStock(totalStock);
        productRepository.save(produit);
    }

    @Transactional
    public LotDeStock removeStockFromLot(Long lotId, int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }

        LotDeStock lot = stockLotRepository.findById(lotId)
                .orElseThrow(() -> new EntityNotFoundException("Stock non trouvé avec l'ID: " + lotId));

        if (lot.getQuantite() < quantity) {
            throw new IllegalArgumentException("Insufficient stock in lot. Available: " + lot.getQuantite());
        }

        lot.setQuantite(lot.getQuantite() - quantity);
        LotDeStock updatedLot = stockLotRepository.save(lot);

        // Mettre à jour le stock total du produit
        updateProductTotalStock(lot.getProduit().getId());

        return updatedLot;
    }

}
