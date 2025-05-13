package emsi.project.backendms1.service;

import emsi.project.backendms1.models.LotDeStock;
import emsi.project.backendms1.models.Produit;
import emsi.project.backendms1.repository.LotDeStockRepo;
import emsi.project.backendms1.repository.ProduitRepo;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class) // Active l'intégration de Mockito avec JUnit 5
class StockServiceTest {

    @Mock // Crée un mock pour LotDeStockRepo
    private LotDeStockRepo stockLotRepository;

    @Mock // Crée un mock pour ProduitRepo
    private ProduitRepo productRepository;

    // @Mock // Pas nécessaire ici car ProduitService n'est pas directement utilisé dans les méthodes testées
    // private ProduitService productService;

    @InjectMocks // Injecte les mocks créés ci-dessus dans StockService
    private StockService stockService;

    private Produit produitTest;
    private LotDeStock lotExistantTest;
    private Long produitId = 1L;
    private Long lotId = 10L;
    private String numeroLot = "LOT123";
    private LocalDate dateExpirationFuture = LocalDate.now().plusYears(1);
    private LocalDate dateExpirationPassee = LocalDate.now().minusDays(1);
    private int quantiteInitiale = 50;
    private int quantiteAjoutee = 20;
    private BigDecimal prixAchat = new BigDecimal("10.50");

    @BeforeEach
    void setUp() {
        // Initialisation d'un produit de test commun
        produitTest = new Produit();
        produitTest.setId(produitId);
        produitTest.setNomMedicament("Test Produit");
        produitTest.setQuantiteTotaleEnStock(quantiteInitiale); // Stock initial avant ajout/modif

        // Initialisation d'un lot de stock existant pour certains tests
        lotExistantTest = new LotDeStock();
        lotExistantTest.setId(lotId);
        lotExistantTest.setProduit(produitTest);
        lotExistantTest.setNumeroLot(numeroLot);
        lotExistantTest.setDateExpiration(dateExpirationFuture);
        lotExistantTest.setQuantite(quantiteInitiale);
        lotExistantTest.setPrixAchatHT(prixAchat);
        lotExistantTest.setDateReception(LocalDate.now().minusDays(5));
    }

    // ==================================
    // Tests pour la méthode addStock
    // ==================================

    @Test
    @DisplayName("Ajouter Stock - Cas Nominal : Ajout d'un nouveau lot")
    void ajouterStock_devraitAjouterNouveauLot_quandLotNexistePas() {
        // Configuration des Mocks
        when(productRepository.findById(produitId)).thenReturn(Optional.of(produitTest));
        when(stockLotRepository.findByProduitIdAndNumeroLot(produitId, numeroLot)).thenReturn(Optional.empty());
        // Simule la sauvegarde du nouveau lot
        when(stockLotRepository.save(any(LotDeStock.class))).thenAnswer(invocation -> {
            LotDeStock lotSauve = invocation.getArgument(0);
            if (lotSauve.getId() == null) { // Simule l'attribution d'un ID pour le nouveau lot
                lotSauve.setId(lotId + 1); // Donne un nouvel ID simulé
            }
            return lotSauve;
        });
        // Simule le calcul du stock total après ajout
        when(stockLotRepository.calculateTotalStockQuantityForProduct(produitId)).thenReturn(quantiteAjoutee); // Nouveau total = qté ajoutée
        when(productRepository.save(any(Produit.class))).thenReturn(produitTest); // Simule la sauvegarde du produit mis à jour

        // Appel de la méthode à tester
        LotDeStock resultat = stockService.addStock(produitId, numeroLot, dateExpirationFuture, quantiteAjoutee, prixAchat);

        // Assertions
        assertNotNull(resultat);
        assertEquals(numeroLot, resultat.getNumeroLot());
        assertEquals(dateExpirationFuture, resultat.getDateExpiration());
        assertEquals(quantiteAjoutee, resultat.getQuantite());
        assertEquals(prixAchat, resultat.getPrixAchatHT());
        assertEquals(produitTest, resultat.getProduit());
        assertNotNull(resultat.getDateReception()); // Vérifie que la date de réception est définie

        // Vérifications des interactions avec les mocks
        verify(productRepository,times(2)).findById(produitId);
        verify(stockLotRepository).findByProduitIdAndNumeroLot(produitId, numeroLot);
        // Doit sauvegarder le nouveau lot ET le produit mis à jour
        verify(stockLotRepository, times(1)).save(any(LotDeStock.class)); // Lot sauvegardé
        verify(stockLotRepository).calculateTotalStockQuantityForProduct(produitId);
        verify(productRepository, times(1)).save(any(Produit.class)); // Produit mis à jour

        // Vérification plus précise de la mise à jour du stock total du produit
        ArgumentCaptor<Produit> produitCaptor = ArgumentCaptor.forClass(Produit.class);
        verify(productRepository).save(produitCaptor.capture());
        assertEquals(quantiteAjoutee, produitCaptor.getValue().getQuantiteTotaleEnStock()); // Le stock total doit être le nouveau total calculé
    }

    @Test
    @DisplayName("Ajouter Stock - Cas Nominal : Mise à jour d'un lot existant")
    void ajouterStock_devraitMettreAJourLotExistant_quandLotExisteAvecMemeDateExp() {
        int quantiteTotaleAttendue = quantiteInitiale + quantiteAjoutee;

        // Configuration des Mocks
        when(productRepository.findById(produitId)).thenReturn(Optional.of(produitTest));
        // Le lot existe déjà avec le même numéro et la même date
        when(stockLotRepository.findByProduitIdAndNumeroLot(produitId, numeroLot)).thenReturn(Optional.of(lotExistantTest));
        // Simule la sauvegarde du lot mis à jour
        when(stockLotRepository.save(any(LotDeStock.class))).thenReturn(lotExistantTest); // Retourne le lot mis à jour
        // Simule le calcul du stock total après mise à jour
        when(stockLotRepository.calculateTotalStockQuantityForProduct(produitId)).thenReturn(quantiteTotaleAttendue);
        when(productRepository.save(any(Produit.class))).thenReturn(produitTest); // Simule la sauvegarde du produit mis à jour

        // Appel de la méthode à tester
        LotDeStock resultat = stockService.addStock(produitId, numeroLot, dateExpirationFuture, quantiteAjoutee, prixAchat);

        // Assertions
        assertNotNull(resultat);
        assertEquals(lotId, resultat.getId()); // Doit être le même lot
        assertEquals(quantiteTotaleAttendue, resultat.getQuantite()); // La quantité doit être additionnée
        assertEquals(numeroLot, resultat.getNumeroLot());
        assertEquals(dateExpirationFuture, resultat.getDateExpiration());

        // Vérifications des interactions
        verify(productRepository,times(2)).findById(produitId);
        verify(stockLotRepository).findByProduitIdAndNumeroLot(produitId, numeroLot);
        verify(stockLotRepository, times(1)).save(lotExistantTest); // Le lot existant est sauvegardé
        verify(stockLotRepository).calculateTotalStockQuantityForProduct(produitId);
        verify(productRepository, times(1)).save(any(Produit.class)); // Produit mis à jour

        // Vérification de la mise à jour du stock total du produit
        ArgumentCaptor<Produit> produitCaptor = ArgumentCaptor.forClass(Produit.class);
        verify(productRepository).save(produitCaptor.capture());
        assertEquals(quantiteTotaleAttendue, produitCaptor.getValue().getQuantiteTotaleEnStock());
    }

    @Test
    @DisplayName("Ajouter Stock - Erreur : Produit non trouvé")
    void ajouterStock_devraitLeverException_quandProduitNonTrouve() {
        // Configuration Mock : le produit n'est pas trouvé
        when(productRepository.findById(produitId)).thenReturn(Optional.empty());

        // Action & Assertion
        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () -> {
            stockService.addStock(produitId, numeroLot, dateExpirationFuture, quantiteAjoutee, prixAchat);
        });

        assertEquals("Produit non trouvé avec l'ID : " + produitId, exception.getMessage());

        // Vérification qu'aucune sauvegarde n'a eu lieu
        verify(stockLotRepository, never()).save(any(LotDeStock.class));
        verify(productRepository, never()).save(any(Produit.class));
    }

    @Test
    @DisplayName("Ajouter Stock - Erreur : Quantité négative ou nulle")
    void ajouterStock_devraitLeverException_quandQuantiteEstNegativeOuNulle() {
        // Action & Assertion pour quantité négative
        IllegalArgumentException exceptionNeg = assertThrows(IllegalArgumentException.class, () -> {
            stockService.addStock(produitId, numeroLot, dateExpirationFuture, -5, prixAchat);
        });
        assertEquals("La quantité doit être positive", exceptionNeg.getMessage());

        // Action & Assertion pour quantité nulle
        IllegalArgumentException exceptionZero = assertThrows(IllegalArgumentException.class, () -> {
            stockService.addStock(produitId, numeroLot, dateExpirationFuture, 0, prixAchat);
        });
        assertEquals("La quantité doit être positive", exceptionZero.getMessage());

        // Vérification qu'aucune recherche ou sauvegarde n'a eu lieu
        verify(productRepository, never()).findById(anyLong());
        verify(stockLotRepository, never()).save(any(LotDeStock.class));
        verify(productRepository, never()).save(any(Produit.class));
    }

    @Test
    @DisplayName("Ajouter Stock - Erreur : Date d'expiration passée")
    void ajouterStock_devraitLeverException_quandDateExpirationEstPassee() {
        // Action & Assertion
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            stockService.addStock(produitId, numeroLot, dateExpirationPassee, quantiteAjoutee, prixAchat);
        });

        assertEquals("La date d'expiration ne peut pas être dans le passé", exception.getMessage());

        // Vérification qu'aucune recherche ou sauvegarde n'a eu lieu
        verify(productRepository, never()).findById(anyLong());
        verify(stockLotRepository, never()).save(any(LotDeStock.class));
        verify(productRepository, never()).save(any(Produit.class));
    }

    @Test
    @DisplayName("Ajouter Stock - Erreur : Lot existant avec date d'expiration différente")
    void ajouterStock_devraitLeverException_quandLotExisteAvecDateExpirationDifferente() {
        LocalDate autreDateExpiration = dateExpirationFuture.plusMonths(6);
        // Le lot existant a la date 'dateExpirationFuture'
        lotExistantTest.setDateExpiration(dateExpirationFuture);

        // Configuration Mocks
        when(productRepository.findById(produitId)).thenReturn(Optional.of(produitTest));
        // Le lot existe déjà, on le retourne
        when(stockLotRepository.findByProduitIdAndNumeroLot(produitId, numeroLot)).thenReturn(Optional.of(lotExistantTest));

        // Action & Assertion : On essaie d'ajouter le même lot mais avec 'autreDateExpiration'
        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            stockService.addStock(produitId, numeroLot, autreDateExpiration, quantiteAjoutee, prixAchat);
        });

        assertEquals("Le lot " + numeroLot + " existe déjà avec une date d'expiration différente", exception.getMessage());

        // Vérification qu'aucune sauvegarde n'a eu lieu
        verify(stockLotRepository, never()).save(any(LotDeStock.class));
        verify(productRepository, never()).save(any(Produit.class));
    }


    // =====================================
    // Tests pour la méthode updateStockLot
    // =====================================

    @Test
    @DisplayName("Mettre à jour Lot - Cas Nominal")
    void mettreAJourLot_devraitModifierLotEtStockProduit() {
        String nouveauNumeroLot = "LOT456";
        LocalDate nouvelleDateExp = dateExpirationFuture.plusMonths(1);
        int nouvelleQuantite = 100;
        BigDecimal nouveauPrix = new BigDecimal("12.00");
        int stockTotalAttenduApresMaj = nouvelleQuantite; // Supposons que c'est le seul lot pour simplifier

        // Configuration Mocks
        when(stockLotRepository.findById(lotId)).thenReturn(Optional.of(lotExistantTest));
        when(stockLotRepository.save(any(LotDeStock.class))).thenAnswer(i -> i.getArgument(0)); // Retourne l'objet sauvegardé
        when(productRepository.findById(produitId)).thenReturn(Optional.of(produitTest)); // Pour updateProductTotalStock
        when(stockLotRepository.calculateTotalStockQuantityForProduct(produitId)).thenReturn(stockTotalAttenduApresMaj);
        when(productRepository.save(any(Produit.class))).thenReturn(produitTest); // Sauvegarde produit

        // Action
        LotDeStock resultat = stockService.updateStockLot(lotId, nouveauNumeroLot, nouvelleDateExp, nouvelleQuantite, nouveauPrix);

        // Assertions sur le lot retourné
        assertNotNull(resultat);
        assertEquals(lotId, resultat.getId());
        assertEquals(nouveauNumeroLot, resultat.getNumeroLot());
        assertEquals(nouvelleDateExp, resultat.getDateExpiration());
        assertEquals(nouvelleQuantite, resultat.getQuantite());
        assertEquals(nouveauPrix, resultat.getPrixAchatHT());

        // Vérification des interactions
        verify(stockLotRepository).findById(lotId);
        verify(stockLotRepository, times(1)).save(any(LotDeStock.class)); // Sauvegarde du lot mis à jour
        // Vérifications pour updateProductTotalStock
        verify(productRepository).findById(produitId);
        verify(stockLotRepository).calculateTotalStockQuantityForProduct(produitId);
        verify(productRepository, times(1)).save(any(Produit.class)); // Sauvegarde du produit

        // Vérification de la mise à jour du stock produit
        ArgumentCaptor<Produit> produitCaptor = ArgumentCaptor.forClass(Produit.class);
        verify(productRepository).save(produitCaptor.capture());
        assertEquals(stockTotalAttenduApresMaj, produitCaptor.getValue().getQuantiteTotaleEnStock());
    }

    @Test
    @DisplayName("Mettre à jour Lot - Erreur : Lot non trouvé")
    void mettreAJourLot_devraitLeverException_quandLotNonTrouve() {
        Long idInexistant = 999L;
        // Configuration Mock : lot non trouvé
        when(stockLotRepository.findById(idInexistant)).thenReturn(Optional.empty());

        // Action & Assertion
        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () -> {
            stockService.updateStockLot(idInexistant, numeroLot, dateExpirationFuture, quantiteAjoutee, prixAchat);
        });

        assertEquals("Stock non trouvé avec l'ID: " + idInexistant, exception.getMessage());

        // Vérification qu'aucune sauvegarde n'a eu lieu
        verify(stockLotRepository, never()).save(any(LotDeStock.class));
        verify(productRepository, never()).save(any(Produit.class));
    }

    @Test
    @DisplayName("Mettre à jour Lot - Erreur : Quantité négative")
    void mettreAJourLot_devraitLeverException_quandQuantiteEstNegative() {
        // Configuration Mock : trouve le lot
        when(stockLotRepository.findById(lotId)).thenReturn(Optional.of(lotExistantTest));

        // Action & Assertion
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            stockService.updateStockLot(lotId, numeroLot, dateExpirationFuture, -10, prixAchat);
        });

        assertEquals("La quantité ne peut pas être négative", exception.getMessage());

        // Vérification qu'aucune sauvegarde n'a eu lieu
        verify(stockLotRepository, never()).save(any(LotDeStock.class));
        verify(productRepository, never()).save(any(Produit.class));
    }

    @Test
    @DisplayName("Mettre à jour Lot - Erreur : Date d'expiration passée")
    void mettreAJourLot_devraitLeverException_quandDateExpirationEstPassee() {
        // Configuration Mock : trouve le lot
        when(stockLotRepository.findById(lotId)).thenReturn(Optional.of(lotExistantTest));

        // Action & Assertion
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            stockService.updateStockLot(lotId, numeroLot, dateExpirationPassee, quantiteAjoutee, prixAchat);
        });

        assertEquals("La date d'expiration ne peut pas être dans le passé", exception.getMessage());

        // Vérification qu'aucune sauvegarde n'a eu lieu
        verify(stockLotRepository, never()).save(any(LotDeStock.class));
        verify(productRepository, never()).save(any(Produit.class));
    }

    // =========================================
    // Tests pour la méthode removeStockFromLot
    // =========================================

    @Test
    @DisplayName("Retirer Stock - Cas Nominal")
    void retirerStockDuLot_devraitReduireQuantiteEtMajStockProduit() {
        int quantiteARetirer = 15;
        int quantiteRestanteAttendue = quantiteInitiale - quantiteARetirer;
        int stockTotalAttenduApresRetrait = quantiteRestanteAttendue; // Supposons un seul lot

        // Configuration Mocks
        when(stockLotRepository.findById(lotId)).thenReturn(Optional.of(lotExistantTest)); // Trouve le lot
        when(stockLotRepository.save(any(LotDeStock.class))).thenAnswer(i -> i.getArgument(0)); // Simule sauvegarde lot
        when(productRepository.findById(produitId)).thenReturn(Optional.of(produitTest)); // Pour updateProductTotalStock
        when(stockLotRepository.calculateTotalStockQuantityForProduct(produitId)).thenReturn(stockTotalAttenduApresRetrait);
        when(productRepository.save(any(Produit.class))).thenReturn(produitTest); // Simule sauvegarde produit

        // Action
        LotDeStock resultat = stockService.removeStockFromLot(lotId, quantiteARetirer);

        // Assertions sur le lot retourné
        assertNotNull(resultat);
        assertEquals(lotId, resultat.getId());
        assertEquals(quantiteRestanteAttendue, resultat.getQuantite()); // Vérifie la quantité réduite

        // Vérifications des interactions
        verify(stockLotRepository).findById(lotId);
        verify(stockLotRepository, times(1)).save(any(LotDeStock.class)); // Sauvegarde du lot mis à jour
        // Vérifications pour updateProductTotalStock
        verify(productRepository).findById(produitId);
        verify(stockLotRepository).calculateTotalStockQuantityForProduct(produitId);
        verify(productRepository, times(1)).save(any(Produit.class)); // Sauvegarde du produit

        // Vérification de la mise à jour du stock produit
        ArgumentCaptor<Produit> produitCaptor = ArgumentCaptor.forClass(Produit.class);
        verify(productRepository).save(produitCaptor.capture());
        assertEquals(stockTotalAttenduApresRetrait, produitCaptor.getValue().getQuantiteTotaleEnStock());
    }

    @Test
    @DisplayName("Retirer Stock - Erreur : Lot non trouvé")
    void retirerStockDuLot_devraitLeverException_quandLotNonTrouve() {
        Long idInexistant = 999L;
        // Configuration Mock : lot non trouvé
        when(stockLotRepository.findById(idInexistant)).thenReturn(Optional.empty());

        // Action & Assertion
        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () -> {
            stockService.removeStockFromLot(idInexistant, 10);
        });

        assertEquals("Stock non trouvé avec l'ID: " + idInexistant, exception.getMessage());

        // Vérification qu'aucune sauvegarde n'a eu lieu
        verify(stockLotRepository, never()).save(any(LotDeStock.class));
        verify(productRepository, never()).save(any(Produit.class));
    }

    @Test
    @DisplayName("Retirer Stock - Erreur : Quantité à retirer négative ou nulle")
    void retirerStockDuLot_devraitLeverException_quandQuantiteEstNegativeOuNulle() {
        // Action & Assertion pour quantité négative
        IllegalArgumentException exceptionNeg = assertThrows(IllegalArgumentException.class, () -> {
            stockService.removeStockFromLot(lotId, -5);
        });
        assertEquals("Quantity must be positive", exceptionNeg.getMessage()); // Message en anglais dans le code original

        // Action & Assertion pour quantité nulle
        IllegalArgumentException exceptionZero = assertThrows(IllegalArgumentException.class, () -> {
            stockService.removeStockFromLot(lotId, 0);
        });
        assertEquals("Quantity must be positive", exceptionZero.getMessage()); // Message en anglais dans le code original

        // Vérification qu'aucune recherche ou sauvegarde n'a eu lieu
        verify(stockLotRepository, never()).findById(anyLong());
        verify(stockLotRepository, never()).save(any(LotDeStock.class));
        verify(productRepository, never()).save(any(Produit.class));
    }

    @Test
    @DisplayName("Retirer Stock - Erreur : Stock insuffisant dans le lot")
    void retirerStockDuLot_devraitLeverException_quandStockInsuffisant() {
        int quantiteARetirerTropGrande = quantiteInitiale + 10; // Plus que disponible

        // Configuration Mock : trouve le lot
        when(stockLotRepository.findById(lotId)).thenReturn(Optional.of(lotExistantTest));

        // Action & Assertion
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            stockService.removeStockFromLot(lotId, quantiteARetirerTropGrande);
        });

        assertEquals("Insufficient stock in lot. Available: " + quantiteInitiale, exception.getMessage()); // Message en anglais

        // Vérification qu'aucune sauvegarde n'a eu lieu
        verify(stockLotRepository, never()).save(any(LotDeStock.class));
        verify(productRepository, never()).save(any(Produit.class));
    }
}