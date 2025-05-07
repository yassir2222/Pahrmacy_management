package emsi.project.backendms1.service;

import emsi.project.backendms1.models.Produit;
import emsi.project.backendms1.repository.LotDeStockRepo;
import emsi.project.backendms1.repository.ProduitRepo;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static emsi.project.backendms1.enums.FormeEnum.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProduitServiceTest {

    @Mock
    private ProduitRepo productRepository;

    @Mock
    private LotDeStockRepo stockLotRepository;

    @InjectMocks
    private ProduitService produitService;

    private Produit produit1;
    private Produit produit2;

    @BeforeEach
    void setUp() {

        produit1 = new Produit();
        produit1.setId(1L);
        produit1.setNomMedicament("Paracetamol");
        produit1.setCodeEAN("12345");
        produit1.setPrixVenteTTC(BigDecimal.valueOf(5.0));
        produit1.setPrixAchatHT(BigDecimal.valueOf(2.5));
        produit1.setSeuilStock(10);
        produit1.setForme(SACHET);
        produit1.setDosage("500mg");
        produit1.setQuantiteTotaleEnStock(0);

        produit2 = new Produit();
        produit2.setId(2L);
        produit2.setNomMedicament("Ibuprofen");
        produit1.setCodeEAN("14567");
        produit1.setPrixVenteTTC(BigDecimal.valueOf(125.0));
        produit1.setPrixAchatHT(BigDecimal.valueOf(100.5));
        produit1.setSeuilStock(10);
        produit1.setForme(SYRUP);
        produit1.setDosage("500mg");
        produit1.setQuantiteTotaleEnStock(0);
    }

    @Test
    void findAllProducts_shouldReturnListOfProducts() {
        List<Produit> expectedProducts = Arrays.asList(produit1, produit2);
        when(productRepository.findAll()).thenReturn(expectedProducts);
        List<Produit> actualProducts = produitService.findAllProducts();

        assertEquals(2, actualProducts.size());
        assertEquals(expectedProducts, actualProducts);
        verify(productRepository, times(1)).findAll();
    }

    @Test
    void createProduct_shouldSetInitialStockToZeroAndSave() {
        Produit newProduit = new Produit();
        newProduit.setNomMedicament("Amoxicilline");

        ArgumentCaptor<Produit> productCaptor = ArgumentCaptor.forClass(Produit.class);
        when(productRepository.save(productCaptor.capture())).thenAnswer(invocation -> invocation.getArgument(0));


        Produit createdProduct = produitService.createProduct(newProduit);

        assertNotNull(createdProduct);
        assertEquals(0, createdProduct.getQuantiteTotaleEnStock());
        assertEquals("Amoxicilline", createdProduct.getNomMedicament());
        verify(productRepository, times(1)).save(any(Produit.class));

        Produit capturedProduct = productCaptor.getValue();
        assertEquals(0, capturedProduct.getQuantiteTotaleEnStock());
    }

    @Test
    void updateProduct_whenProductExists_shouldUpdateAndReturnProduct() {
        // Arrange
        Long productId = 1L;
        Produit existingProduit = produit1;
        Produit detailsProduit = new Produit();
        detailsProduit.setNomMedicament("Paracetamol Forte");
        detailsProduit.setCodeEAN("54321");
        detailsProduit.setPrixVenteTTC(BigDecimal.valueOf(6.0));
        detailsProduit.setPrixAchatHT(BigDecimal.valueOf(3.0));
        detailsProduit.setSeuilStock(15);
        detailsProduit.setForme(CREAM);
        detailsProduit.setDosage("1000mg");

        when(productRepository.findById(productId)).thenReturn(Optional.of(existingProduit));
        when(productRepository.save(any(Produit.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Produit updatedProduct = produitService.updateProduct(productId, detailsProduit);

        assertNotNull(updatedProduct);
        assertEquals(productId, updatedProduct.getId());
        assertEquals("Paracetamol Forte", updatedProduct.getNomMedicament());
        assertEquals("54321", updatedProduct.getCodeEAN());
        assertEquals(BigDecimal.valueOf(6.0) , updatedProduct.getPrixVenteTTC());
        assertEquals(BigDecimal.valueOf(3.0), updatedProduct.getPrixAchatHT());
        assertEquals(15, updatedProduct.getSeuilStock());
        assertEquals(CREAM, updatedProduct.getForme());
        assertEquals("1000mg", updatedProduct.getDosage());
        assertEquals(produit1.getQuantiteTotaleEnStock(), updatedProduct.getQuantiteTotaleEnStock());

        verify(productRepository, times(1)).findById(productId);
        verify(productRepository, times(1)).save(existingProduit);
    }

    @Test
    void updateProduct_whenProductDoesNotExist_shouldThrowEntityNotFoundException() {
        Long productId = 99L;
        Produit detailsProduit = new Produit();
        when(productRepository.findById(productId)).thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () -> {
            produitService.updateProduct(productId, detailsProduit);
        });
        assertEquals("Produit non trouvé avec l'ID : " + productId, exception.getMessage());
        verify(productRepository, times(1)).findById(productId);
        verify(productRepository, never()).save(any(Produit.class));
    }

    @Test
    void deleteProduct_whenProductExistsAndNoStock_shouldDeleteProduct() {
        Long productId = 1L;
        Produit productToDelete = produit1;
        when(productRepository.findById(productId)).thenReturn(Optional.of(productToDelete));
        when(stockLotRepository.calculateTotalStockQuantityForProduct(productId)).thenReturn(0);
        doNothing().when(productRepository).delete(productToDelete);

        produitService.deleteProduct(productId);

        verify(productRepository, times(1)).findById(productId);
        verify(stockLotRepository, times(1)).calculateTotalStockQuantityForProduct(productId);
        verify(productRepository, times(1)).delete(productToDelete);
    }

    @Test
    void deleteProduct_whenProductExistsAndHasStock_shouldThrowIllegalStateException() {
        Long productId = 1L;
        Produit productToDelete = produit1;
        int remainingStock = 10;
        when(productRepository.findById(productId)).thenReturn(Optional.of(productToDelete));
        when(stockLotRepository.calculateTotalStockQuantityForProduct(productId)).thenReturn(remainingStock);

        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            produitService.deleteProduct(productId);
        });
        assertEquals("Impossible de supprimer le produit : stock restant disponible (" + remainingStock + " unités)", exception.getMessage());

        verify(productRepository, times(1)).findById(productId);
        verify(stockLotRepository, times(1)).calculateTotalStockQuantityForProduct(productId);
        verify(productRepository, never()).delete(any(Produit.class));
    }

    @Test
    void deleteProduct_whenProductDoesNotExist_shouldThrowEntityNotFoundException() {
        Long productId = 99L;
        when(productRepository.findById(productId)).thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () -> {
            produitService.deleteProduct(productId);
        });
        assertEquals("Produit non trouvé avec l'id: " + productId, exception.getMessage());

        verify(productRepository, times(1)).findById(productId);
        verify(stockLotRepository, never()).calculateTotalStockQuantityForProduct(anyLong());
        verify(productRepository, never()).delete(any(Produit.class));
    }

    @Test
    void updateTotalStock_whenProductExists_shouldUpdateStockAndSave() {
        Long productId = 1L;
        Produit productToUpdateStock = produit1;
        int newTotalStock = 50;
        productToUpdateStock.setQuantiteTotaleEnStock(5);

        when(productRepository.findById(productId)).thenReturn(Optional.of(productToUpdateStock));
        when(stockLotRepository.calculateTotalStockQuantityForProduct(productId)).thenReturn(newTotalStock);
        ArgumentCaptor<Produit> productCaptor = ArgumentCaptor.forClass(Produit.class);
        when(productRepository.save(productCaptor.capture())).thenReturn(productToUpdateStock);

        produitService.updateTotalStock(productId);

        verify(productRepository, times(1)).findById(productId);
        verify(stockLotRepository, times(1)).calculateTotalStockQuantityForProduct(productId);
        verify(productRepository, times(1)).save(any(Produit.class));

        Produit savedProduct = productCaptor.getValue();
        assertEquals(newTotalStock, savedProduct.getQuantiteTotaleEnStock());
        assertEquals(productId, savedProduct.getId());
    }

    @Test
    void updateTotalStock_whenProductDoesNotExist_shouldThrowEntityNotFoundException() {
        Long productId = 99L;
        when(productRepository.findById(productId)).thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () -> {
            produitService.updateTotalStock(productId);
        });
        assertEquals("Produit non trouvé avec l'id: " + productId, exception.getMessage());

        verify(productRepository, times(1)).findById(productId);
        verify(stockLotRepository, never()).calculateTotalStockQuantityForProduct(anyLong());
        verify(productRepository, never()).save(any(Produit.class));
    }
}