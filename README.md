
# Application Pharmacie 🏥💊

Bienvenue dans le projet **Pharmacy Application** ! 🎉 Ce projet est une application complète pour la gestion de pharmacies, avec un backend en Spring Boot, un frontend en Angular et une application mobile développée avec Expo. Elle permet de gérer les stocks, les utilisateurs, et offre une recherche avancée et une interface mobile intuitive.

## 📂 Structure du Projet

-   **backend-ms1/** 🖥️ : Backend Spring Boot avec une base de données MySQL pour gérer les données de la pharmacie.
-   **Frontend/frontend/** 🌐 : Frontend Angular avec des fonctionnalités de recherche avancée, un nouveau design et des icônes modernes.
-   **mobile/Pharmacy_app/** 📱 : Application mobile développée avec Expo pour un accès facile en déplacement.
-   **.github/workflows/** 🚀 : Fichiers de configuration pour l'intégration et le déploiement continus (CI/CD) via GitHub Actions.
-   **README.md** 📜 : Ce fichier, qui contient toutes les instructions nécessaires.

## 🛠️ Prérequis

Avant de commencer, assurez-vous d'avoir les outils suivants installés sur votre machine :

-   **Java 17** ☕ : Nécessaire pour exécuter le backend Spring Boot.
-   **Node.js 18.x** 🟢 : Pour Angular et Expo.
-   **MySQL 8.0** 🗄️ : Base de données pour stocker les informations.
-   **Angular CLI** 🅰️ : Installez-le avec la commande `npm install -g @angular/cli`.
-   **Expo CLI** 📲 : Installez-le avec `npm install -g expo-cli`.
-   **Git** 🐙 : Pour cloner le projet depuis GitHub.

## ⚙️ Instructions d'Installation

### 1️⃣ Backend (Spring Boot) 🖥️

Le backend est construit avec Spring Boot et utilise MySQL pour stocker les données.

1.  Allez dans le dossier du backend :
    
    ```
    cd backend-ms1
    
    ```
    
2.  Configurez la base de données MySQL :
    -   Créez une base de données nommée `pharmacy_db` dans MySQL.
    -   Modifiez le fichier `src/main/resources/application.properties` avec vos identifiants MySQL :
        
        ```
        spring.datasource.url=jdbc:mysql://localhost:3306/pharmacy_db
        spring.datasource.username=root
        spring.datasource.password=votre_mot_de_passe
        spring.jpa.hibernate.ddl-auto=update
        
        ```
        
3.  Lancez le backend :
    
    ```
    ./mvnw spring-boot:run
    
    ```
    
    Le serveur démarrera sur `http://localhost:8083`.

### 2️⃣ Frontend (Angular) 🌐

Le frontend est une application Angular avec un design moderne et des fonctionnalités de recherche avancée.

1.  Allez dans le dossier du frontend :
    
    ```
    cd Frontend/frontend
    
    ```
    
2.  Installez les dépendances :
    
    ```
    npm install
    
    ```
    
3.  Lancez le serveur de développement Angular :
    
    ```
    ng serve
    
    ```
    
4.  Ouvrez votre navigateur et accédez à `http://localhost:4200` pour voir l'application. 🎨

### 3️⃣ Application Mobile (Expo) 📱

L'application mobile est développée avec Expo pour une expérience utilisateur fluide sur iOS et Android.

1.  Allez dans le dossier de l'application mobile :
    
    ```
    cd mobile/Pharmacy_app
    
    ```
    
2.  Installez les dépendances :
    
    ```
    npm install
    
    ```
    
3.  Lancez le serveur Expo :
    
    ```
    expo start
    
    ```
    
4.  Utilisez l'application **Expo Go** sur votre téléphone :
    -   Scannez le QR code affiché dans le terminal ou sur la page web qui s'ouvre.
    -   L'application se chargera automatiquement sur votre appareil. 🚀

## 🚀 CI/CD avec GitHub Actions

Ce projet utilise **GitHub Actions** pour automatiser l'intégration et le déploiement continus :

-   **refer-pipine-back-CD** 📦 : Déploie le backend sur l'environnement de production.
-   **Deployment CD** 📲 : Déploie l'application mobile.

Pour vérifier les déploiements, consultez les actions dans l'onglet "Actions" de votre dépôt GitHub. ✅

## 🌍 Déploiement

Le site est actuellement déployé et accessible ! 🎉 Vous pouvez y accéder via l'URL suivante : [http://46.202.171.246:4200/]. Assurez-vous d'avoir vos identifiants pour vous connecter à l'interface de gestion de pharmacie. 🖱️


## 🤝 Comment Contribuer ?

Nous accueillons les contributions avec plaisir ! Suivez ces étapes :

1.  Forkez le dépôt sur GitHub 🍴.
2.  Créez une nouvelle branche pour vos modifications :
    
    ```
    git checkout -b feature/votre-fonctionnalité
    
    ```
    
3.  Faites vos modifications et commitez-les :
    
    ```
    git commit -m "Ajout de votre fonctionnalité"
    
    ```
    
4.  Poussez vos changements sur votre fork :
    
    ```
    git push origin feature/votre-fonctionnalité
    
    ```
    
5.  Ouvrez une Pull Request sur GitHub. 📬

## 📜 Licence

Ce projet est sous licence **MIT**. Vous êtes libre de l'utiliser et de le modifier selon vos besoins. 🎉

## 📞 Contact

Pour toute question, contactez l'équipe via GitHub ou ouvrez une issue dans le dépôt. 💬

Bon développement ! 🚀


[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/kdIDrqMi)
[![Open in Codespaces](https://classroom.github.com/assets/launch-codespace-2972f46106e565e64193e422d61a12cf1da4916b45550586e14ef0a7c637dd04.svg)](https://classroom.github.com/open-in-codespaces?assignment_repo_id=19420982)
