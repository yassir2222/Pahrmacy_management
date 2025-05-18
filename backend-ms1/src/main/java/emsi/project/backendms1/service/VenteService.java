package emsi.project.backendms1.service;
import emsi.project.backendms1.dtos.LigneVenteRequest;
import emsi.project.backendms1.dtos.VenteRequest;
import emsi.project.backendms1.models.*;
import emsi.project.backendms1.repository.LotDeStockRepo;
import emsi.project.backendms1.repository.ProduitRepo;
import emsi.project.backendms1.repository.UserRepository;
import emsi.project.backendms1.repository.VenteRepo;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
@Service
public class VenteService {

        @Autowired
        private VenteRepo venteRepository;

        @Autowired
        private ProduitRepo produitRepository;

        @Autowired
        private LotDeStockRepo lotDeStockRepository;

        @Autowired
        private StockService stockService;



        @Transactional
        public Vente creerVente(VenteRequest venteRequest) {
        User user = null;


        Vente vente = new Vente();
        vente.setDateVente(LocalDateTime.now());
        vente.setLignesVente(new ArrayList<>());
        vente.setMontantTotal(BigDecimal.ZERO);

        if (venteRequest.getLignesVente() == null || venteRequest.getLignesVente().isEmpty()) {
            throw new IllegalArgumentException("La liste des lignes de vente ne peut pas être vide.");
        }

        for (LigneVenteRequest itemDto : venteRequest.getLignesVente()) { // LigneVenteRequest is now imported
            Produit produit = produitRepository.findById(itemDto.getProduitId())
                    .orElseThrow(() -> new EntityNotFoundException("Produit non trouvé avec l'ID: " + itemDto.getProduitId()));

            if (itemDto.getQuantite() <= 0) {
                throw new IllegalArgumentException("La quantité vendue pour le produit ID " + itemDto.getProduitId() + " doit être positive.");
            }
            // Assuming prixUnitaireVenteTTC from DTO
            if (itemDto.getPrixUnitaireVenteTTC() == null || itemDto.getPrixUnitaireVenteTTC().compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("Le prix unitaire de vente TTC pour le produit ID " + itemDto.getProduitId() + " doit être positif ou nul.");
            }

            Produit currentProduitState = produitRepository.findById(produit.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Produit non trouvé avec l'ID: " + produit.getId()));

            if (currentProduitState.getQuantiteTotaleEnStock() < itemDto.getQuantite()) {
                throw new IllegalArgumentException("Stock insuffisant pour le produit: " + produit.getNomMedicament() +
                        ". Demandé: " + itemDto.getQuantite() + ", Disponible: " + currentProduitState.getQuantiteTotaleEnStock());
            }

            List<LotDeStock> lots = lotDeStockRepository.findByProduitIdOrderByDateExpirationAsc(produit.getId());

            if (lots.isEmpty() && itemDto.getQuantite() > 0) {
                throw new IllegalStateException("Aucun lot de stock trouvé pour le produit: " + produit.getNomMedicament() + " alors que le stock total est > 0. Incohérence de données possible.");
            }

            int quantiteRestanteAVendrePourProduit = itemDto.getQuantite();
            for (LotDeStock lot : lots) {
                if (quantiteRestanteAVendrePourProduit == 0) break;

                int quantiteAPrendreDuLot = Math.min(quantiteRestanteAVendrePourProduit, lot.getQuantite());
                if (quantiteAPrendreDuLot > 0) {
                    stockService.removeStockFromLot(lot.getId(), quantiteAPrendreDuLot);
                    quantiteRestanteAVendrePourProduit -= quantiteAPrendreDuLot;
                }
            }

            if (quantiteRestanteAVendrePourProduit > 0) {
                throw new IllegalStateException("N'a pas pu allouer la quantité totale pour le produit: " + produit.getNomMedicament() +
                        ". Quantité restante non allouée: " + quantiteRestanteAVendrePourProduit +
                        ". Cela peut être dû à une modification concurrente du stock. Veuillez réessayer.");
            }

            LigneVente ligneVente = new LigneVente();
            ligneVente.setProduit(produit);
            ligneVente.setQuantite(itemDto.getQuantite());
            ligneVente.setPrixVenteTTC(itemDto.getPrixUnitaireVenteTTC());
            ligneVente.setVente(vente);

            vente.getLignesVente().add(ligneVente);
            vente.setMontantTotal(vente.getMontantTotal().add(ligneVente.getMontantTotalLigne()));
        }

        return venteRepository.save(vente);
    }

    @Transactional
    public Vente modifierVente(Long venteId, VenteRequest venteRequest) {
        Vente venteAModifier = venteRepository.findById(venteId)
                .orElseThrow(() -> new EntityNotFoundException("Vente non trouvée avec l'ID: " + venteId));

        List<LigneVente> anciennesLignes = new ArrayList<>(venteAModifier.getLignesVente());

        for (LigneVente ancienneLigne : anciennesLignes) {
            stockService.restituerStockAuxLots(ancienneLigne.getProduit().getId(), ancienneLigne.getQuantite());
        }

        venteAModifier.getLignesVente().clear();
        venteAModifier.setMontantTotal(BigDecimal.ZERO);


        if (venteRequest.getLignesVente() == null || venteRequest.getLignesVente().isEmpty()) {
            throw new IllegalArgumentException("La liste des lignes de vente ne peut pas être vide pour une modification.");
        }

        for (LigneVenteRequest itemDto : venteRequest.getLignesVente()) {
            Produit produit = produitRepository.findById(itemDto.getProduitId())
                    .orElseThrow(() -> new EntityNotFoundException("Produit non trouvé avec l'ID: " + itemDto.getProduitId()));

            if (itemDto.getQuantite() <= 0) {
                throw new IllegalArgumentException("La quantité vendue pour le produit ID " + itemDto.getProduitId() + " doit être positive.");
            }
            if (itemDto.getPrixUnitaireVenteTTC() == null || itemDto.getPrixUnitaireVenteTTC().compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("Le prix unitaire de vente TTC pour le produit ID " + itemDto.getProduitId() + " doit être positif ou nul.");
            }

            Produit currentProduitState = produitRepository.findById(produit.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Produit non trouvé avec l'ID: " + produit.getId()));


            if (currentProduitState.getQuantiteTotaleEnStock() < itemDto.getQuantite()) {
                throw new IllegalArgumentException("Stock insuffisant après ajustement pour le produit: " + produit.getNomMedicament() +
                        ". Demandé: " + itemDto.getQuantite() + ", Disponible: " + currentProduitState.getQuantiteTotaleEnStock());
            }

            List<LotDeStock> lots = lotDeStockRepository.findByProduitIdOrderByDateExpirationAsc(produit.getId());
            if (lots.isEmpty() && itemDto.getQuantite() > 0) {
                throw new IllegalStateException("Aucun lot de stock trouvé pour le produit: " + produit.getNomMedicament() + " après restitution. Incohérence de données possible.");
            }

            int quantiteRestanteAVendrePourProduit = itemDto.getQuantite();
            for (LotDeStock lot : lots) {
                if (quantiteRestanteAVendrePourProduit == 0) break;

                int quantiteAPrendreDuLot = Math.min(quantiteRestanteAVendrePourProduit, lot.getQuantite());
                if (quantiteAPrendreDuLot > 0) {
                    stockService.removeStockFromLot(lot.getId(), quantiteAPrendreDuLot);
                    quantiteRestanteAVendrePourProduit -= quantiteAPrendreDuLot;
                }
            }

            if (quantiteRestanteAVendrePourProduit > 0) {
                throw new IllegalStateException("N'a pas pu allouer la quantité totale pour le produit (modification): " + produit.getNomMedicament() +
                        ". Quantité restante non allouée: " + quantiteRestanteAVendrePourProduit +
                        ". Cela peut être dû à une modification concurrente du stock. Veuillez réessayer.");
            }

            LigneVente nouvelleLigne = new LigneVente();
            nouvelleLigne.setProduit(produit);
            nouvelleLigne.setQuantite(itemDto.getQuantite());
            nouvelleLigne.setPrixVenteTTC(itemDto.getPrixUnitaireVenteTTC());
            nouvelleLigne.setVente(venteAModifier);

            venteAModifier.getLignesVente().add(nouvelleLigne);
            venteAModifier.setMontantTotal(venteAModifier.getMontantTotal().add(nouvelleLigne.getMontantTotalLigne()));
        }

        venteAModifier.setDateVente(LocalDateTime.now());

        return venteRepository.save(venteAModifier);
    }

    @Transactional
    public void supprimerVente(Long venteId) {
        Vente venteASupprimer = venteRepository.findById(venteId)
                .orElseThrow(() -> new EntityNotFoundException("Vente non trouvée avec l'ID: " + venteId));

        for (LigneVente ligne : venteASupprimer.getLignesVente()) {
            stockService.restituerStockAuxLots(ligne.getProduit().getId(), ligne.getQuantite());
        }
        venteRepository.delete(venteASupprimer);
    }

    public Optional<Vente> getVenteById(Long id) {
            return venteRepository.findById(id);
        }

        public List<Vente> getAllVentes() {
            return venteRepository.findAll();
        }
    }

