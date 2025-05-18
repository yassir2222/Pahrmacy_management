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
import java.util.List;
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
    public LotDeStock updateStockLot(Long lotId, String numeroLot, LocalDate dateExpiration, int quantite, BigDecimal prixAchatHT) {
        LotDeStock lot = stockLotRepository.findById(lotId)
                .orElseThrow(() -> new EntityNotFoundException("Stock non trouvé avec l'ID: " + lotId));

        if (quantite < 0) {
            throw new IllegalArgumentException("La quantité ne peut pas être négative");
        }

        if (dateExpiration.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("La date d'expiration ne peut pas être dans le passé");
        }

        lot.setNumeroLot(numeroLot);
        lot.setDateExpiration(dateExpiration);
        lot.setQuantite(quantite);
        lot.setPrixAchatHT(prixAchatHT);

        LotDeStock updatedLot = stockLotRepository.save(lot);

        updateProductTotalStock(lot.getProduit().getId());

        return updatedLot;
    }

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

    public List<LotDeStock> findAllStocksByProduitId(Long produitId) {
        return stockLotRepository.findByProduitId(produitId);
    }

    @Transactional
    public void removeLot(Long lotId) {
        LotDeStock lot = stockLotRepository.findById(lotId)
                .orElseThrow(() -> new EntityNotFoundException("Lot non trouvé avec l'ID: " + lotId));

        Long produitId = lot.getProduit().getId();

        stockLotRepository.delete(lot);
        updateProductTotalStock(produitId);
    }


    @Transactional
    public void restituerStockAuxLots(Long produitId, int quantiteARestituer) {
        if (quantiteARestituer <= 0) {
            return;
        }

        // On cherche un lot pour ce produit, de préférence celui qui expire le plus tard.
        List<LotDeStock> lots = stockLotRepository.findByProduitIdOrderByDateExpirationDesc(produitId);

        if (lots.isEmpty()) {
            Produit produit = productRepository.findById(produitId)
                    .orElseThrow(() -> new EntityNotFoundException("Produit non trouvé: " + produitId + " lors de la tentative de restitution de stock à un lot inexistant."));
            throw new IllegalStateException("Impossible de restituer le stock pour le produit '" + produit.getNomMedicament() + "' (ID: " + produitId + ") car aucun lot de stock n'est associé à ce produit. Veuillez vérifier les données.");
        }

        // Ajouter la quantité au lot qui expire le plus tard (premier de la liste triée DESC)
        LotDeStock lotPourRestitution = lots.get(0);
        lotPourRestitution.setQuantite(lotPourRestitution.getQuantite() + quantiteARestituer);
        stockLotRepository.save(lotPourRestitution);

        // Mettre à jour le stock total du produit (basé sur la somme des quantités des lots)
        updateProductTotalStock(produitId);
    }

}
