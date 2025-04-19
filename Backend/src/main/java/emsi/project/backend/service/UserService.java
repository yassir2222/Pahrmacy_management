package emsi.project.backend.service;

import emsi.project.backend.dao.UserDao;
import emsi.project.backend.models.User;
import jakarta.transaction.Transactional;
import org.hibernate.annotations.DynamicUpdate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@DynamicUpdate
public class UserService {

    @Autowired
    private UserDao userRepository;
    public User createUser(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("Nom d'utilisateur déjà utilisé.");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email déjà utilisé.");
        }
        return userRepository.save(user);
    }
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public User updateUser(Long id, User updatedUser) {
        Optional<User> existingUser = userRepository.findById(id);
        if (existingUser.isPresent()) {
            return userRepository.save(updatedUser);
        } else {
            throw new IllegalArgumentException("Utilisateur non trouvé avec l'ID : " + id);
        }
    }
    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("Utilisateur non trouvé avec l'ID : " + id);
        }
        userRepository.deleteById(id);
    }

}
