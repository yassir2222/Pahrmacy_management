package emsi.project.backendms1.repository;

import emsi.project.backendms1.models.Vente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VenteRepo extends JpaRepository<Vente, Long> {
}
