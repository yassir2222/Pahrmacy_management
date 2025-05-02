package emsi.project.backendms1.service;


import emsi.project.backendms1.models.Produit;
import emsi.project.backendms1.repository.LotDeStockRepo;
import emsi.project.backendms1.repository.ProduitRepo;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service

public class ProduitService {
    @Autowired
    private ProduitRepo productRepository;

    @Autowired
    private LotDeStockRepo stockLotRepository;

    public List<Produit> findAllProducts() {
        return productRepository.findAll();
    }


    public Produit createProduct(Produit product) {

        product.setQuantiteTotaleEnStock(0);
        return productRepository.save(product);
    }

    public Produit updateProduct(Long id, Produit detailsProduit) {

        Produit produitExistant = productRepository.findById(id)

                .orElseThrow(() -> new EntityNotFoundException("Produit non trouvé avec l'ID : " + id));


        produitExistant.setNomMedicament(detailsProduit.getNomMedicament());
        produitExistant.setCodeEAN(detailsProduit.getCodeEAN());
        produitExistant.setPrixVenteTTC(detailsProduit.getPrixVenteTTC());
        produitExistant.setPrixAchatHT(detailsProduit.getPrixAchatHT());
        produitExistant.setSeuilStock(detailsProduit.getSeuilStock());
        produitExistant.setForme(detailsProduit.getForme());
        produitExistant.setDosage(detailsProduit.getDosage());

        return productRepository.save(produitExistant);
    }

    public void deleteProduct(Long id) {
        Produit product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Produit non trouvé avec l'id: " + id));

        // Vérifier s'il reste du stock avant de supprimer
        int remainingStock = stockLotRepository.calculateTotalStockQuantityForProduct(id);
        if (remainingStock > 0) {
            throw new IllegalStateException("Impossible de supprimer le produit : stock restant disponible (" + remainingStock + " unités)");
       }
        productRepository.delete(product);
    }

    public void updateTotalStock(Long productId) {
        Produit product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Produit non trouvé avec l'id: " + productId));

        int totalStock = stockLotRepository.calculateTotalStockQuantityForProduct(productId);
        product.setQuantiteTotaleEnStock(totalStock);

        productRepository.save(product);
    }

    //    public List<Product> searchProducts(String searchTerm) {
//        if (searchTerm == null || searchTerm.trim().isEmpty()) {
//            return productRepository.findAll();
//        }
//        return productRepository.searchProducts(searchTerm.trim());
//    }

//    public Product findProductById(Long id) {
//        return productRepository.findById(id)
//                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
//    }
//
//    public Product findProductByMedicineId(String medicineId) {
//        return productRepository.findByMedicineId(medicineId)
//                .orElseThrow(() -> new ResourceNotFoundException("Product not found with medicine ID: " + medicineId));
//    }
//public List<Product> findLowStockProducts() {
//    return productRepository.findProductsWithLowStock();
//}

}
