package emsi.project.backend.dao;

import emsi.project.backend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserDao extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    User findByUsernameAndPassword(String username, String password);
    User findByUsername(String username);
}
