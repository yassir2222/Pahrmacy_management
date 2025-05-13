package emsi.project.backendms1.service;

import emsi.project.backendms1.models.User; // Assurez-vous que le chemin d'importation est correct
import emsi.project.backendms1.repository.UserRepository; // Assurez-vous que le chemin d'importation est correct
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;


import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class) // Active l'intégration de Mockito avec JUnit 5
class CustomUserDetailsServiceTest {

    @Mock // Crée un mock pour UserRepository
    private UserRepository userRepository;

    @InjectMocks // Injecte le mock userRepository dans customUserDetailsService
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @DisplayName("Charger Utilisateur par Nom - Cas Nominal : Utilisateur trouvé avec rôle préfixé")
    void chargerUtilisateurParNom_devraitRetournerUserDetails_quandUtilisateurExisteAvecRolePrefixe() {
        // --- Arrange (Préparation) ---
        String username = "utilisateurTest";
        String password = "motDePasseCrypte"; // Le mot de passe stocké dans la base
        String roleAvecPrefixe = "ROLE_ADMIN";

        // Créer un utilisateur simulé retourné par le repository
        User mockUser = new User();
        mockUser.setUsername(username);
        mockUser.setPassword(password);
        mockUser.setRole(roleAvecPrefixe); // Rôle déjà correctement formaté

        // Configurer le mock repository pour retourner notre utilisateur simulé
        when(userRepository.findByUsername(username)).thenReturn(mockUser);

        // --- Act (Action) ---
        // Appeler la méthode à tester
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);

        // --- Assert (Vérification) ---
        assertNotNull(userDetails, "UserDetails ne devrait pas être null");
        assertEquals(username, userDetails.getUsername(), "Le nom d'utilisateur doit correspondre");
        assertEquals(password, userDetails.getPassword(), "Le mot de passe doit correspondre");

        // Vérifier les autorités (rôles)
        assertNotNull(userDetails.getAuthorities(), "Les autorités ne devraient pas être null");
        assertEquals(1, userDetails.getAuthorities().size(), "Il devrait y avoir une seule autorité");
        assertTrue(
                userDetails.getAuthorities().contains(new SimpleGrantedAuthority(roleAvecPrefixe)),
                "L'autorité doit être " + roleAvecPrefixe
        );

        // Vérifier que la méthode findByUsername du repository a bien été appelée une fois
        verify(userRepository, times(1)).findByUsername(username);
        // Vérifier qu'aucune autre interaction n'a eu lieu avec le mock (optionnel mais utile)
        verifyNoMoreInteractions(userRepository);
    }

    @Test
    @DisplayName("Charger Utilisateur par Nom - Cas Nominal : Utilisateur trouvé avec rôle non préfixé")
    void chargerUtilisateurParNom_devraitRetournerUserDetailsAvecRolePrefixe_quandUtilisateurExisteSansPrefixeRole() {
        // --- Arrange (Préparation) ---
        String username = "autreUtilisateur";
        String password = "autreMotDePasse";
        String roleSansPrefixe = "USER"; // Rôle sans le préfixe "ROLE_"
        String roleAttendu = "ROLE_USER"; // Le rôle attendu dans UserDetails

        User mockUser = new User();
        mockUser.setUsername(username);
        mockUser.setPassword(password);
        mockUser.setRole(roleSansPrefixe);

        when(userRepository.findByUsername(username)).thenReturn(mockUser);

        // --- Act (Action) ---
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);

        // --- Assert (Vérification) ---
        assertNotNull(userDetails);
        assertEquals(username, userDetails.getUsername());
        assertEquals(password, userDetails.getPassword());

        // Vérifier que le préfixe "ROLE_" a été ajouté
        assertNotNull(userDetails.getAuthorities());
        assertEquals(1, userDetails.getAuthorities().size());
        assertTrue(
                userDetails.getAuthorities().contains(new SimpleGrantedAuthority(roleAttendu)),
                "L'autorité devrait être " + roleAttendu + " (préfixe ajouté)"
        );

        // Vérifier l'appel au repository
        verify(userRepository).findByUsername(username);
    }


    @Test
    @DisplayName("Charger Utilisateur par Nom - Cas Erreur : Utilisateur non trouvé")
    void chargerUtilisateurParNom_devraitLeverUsernameNotFoundException_quandUtilisateurNexistePas() {
        // --- Arrange (Préparation) ---
        String usernameInexistant = "utilisateurInconnu";

        // Configurer le mock repository pour retourner null (utilisateur non trouvé)
        when(userRepository.findByUsername(usernameInexistant)).thenReturn(null);

        // --- Act & Assert (Action & Vérification) ---
        // Vérifier qu'une exception UsernameNotFoundException est levée
        UsernameNotFoundException exception = assertThrows(
                UsernameNotFoundException.class,
                () -> {
                    // Appel de la méthode qui devrait lever l'exception
                    customUserDetailsService.loadUserByUsername(usernameInexistant);
                },
                "Une UsernameNotFoundException aurait dû être levée"
        );

        // Vérifier le message de l'exception
        assertEquals(
                "User not found with username: " + usernameInexistant,
                exception.getMessage(),
                "Le message de l'exception ne correspond pas"
        );

        // Vérifier que la méthode findByUsername a été appelée
        verify(userRepository).findByUsername(usernameInexistant);
    }
}