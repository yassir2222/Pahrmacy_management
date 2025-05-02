package emsi.project.backendms1.repository;

import emsi.project.backendms1.models.LotDeStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository

public interface LotDeStockRepo extends JpaRepository<LotDeStock,Long> {

    @Query("SELECT SUM(sl.quantite) FROM LotDeStock sl WHERE sl.produit.id = :productId")
    int calculateTotalStockQuantityForProduct(@Param("productId") Long productId);

    Optional<LotDeStock> findByProduitIdAndNumeroLot(Long produitId, String numeroLot);
}
