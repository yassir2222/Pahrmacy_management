package emsi.project.backendms1.repository;

import emsi.project.backendms1.models.Produit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProduitRepo extends JpaRepository<Produit,Long> {
    Produit findByNomMedicament(String nomMedicament);
    Produit findByCodeEAN(String codeEAN);
    boolean existsByNomMedicament(String nomMedicament);
    boolean existsByCodeEAN(String codeEAN);
    Optional<Produit> findById(Long id);
}
