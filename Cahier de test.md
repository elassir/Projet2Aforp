# Cahier de Tests - Application Mobile Centre Sportif

## 1. Introduction

Ce document présente le cahier de tests pour l'application mobile de gestion du centre sportif développée en React Native avec Expo Go. Il définit les différents scénarios de test à exécuter pour valider le bon fonctionnement de l'application conformément aux exigences du cahier des charges.

## 2. Objectifs des tests

Les tests ont pour objectifs de :

- Vérifier que toutes les fonctionnalités répondent aux exigences spécifiées
- S'assurer de la stabilité de l'application
- Vérifier la sécurité des données
- Évaluer l'ergonomie et la facilité d'utilisation
- Identifier les éventuels bugs et problèmes de performance

## 3. Environnement de test

### 3.1 Matériel

- Smartphones Android (versions 10.0 et supérieures)
- Smartphones iOS (versions 13.0 et supérieures)
- Tablettes Android et iPad (pour tester la responsivité)

### 3.2 Logiciel

- Expo Go (dernière version)
- Expo DevTools
- Jest pour les tests unitaires
- Detox pour les tests d'interface utilisateur

## 4. Scénarios de test

### 4.1 Tests fonctionnels

#### TU-GU-001 : Création de compte utilisateur

|ID|TU-GU-001|
|---|---|
|**Titre**|Création d'un compte utilisateur|
|**Objectif**|Vérifier qu'un nouvel utilisateur peut créer un compte|
|**Préconditions**|Application installée, connexion internet active|
|**Étapes**|1. Ouvrir l'application<br>2. Cliquer sur "Créer un compte"<br>3. Remplir le formulaire avec prénom, nom, adresse, email et mot de passe<br>4. Valider le formulaire|
|**Résultat attendu**|- Compte créé avec succès<br>- Redirection vers la page d'accueil<br>- Message de confirmation affiché|
|**Statut**|ok|

#### TU-GU-002 : Connexion utilisateur

|ID|TU-GU-002|
|---|---|
|**Titre**|Connexion d'un utilisateur existant|
|**Objectif**|Vérifier qu'un utilisateur peut se connecter avec ses identifiants|
|**Préconditions**|Application installée, compte utilisateur existant|
|**Étapes**|1. Ouvrir l'application<br>2. Saisir email et mot de passe<br>3. Cliquer sur "Se connecter"|
|**Résultat attendu**|- Connexion réussie<br>- Redirection vers la page d'accueil<br>- Accès aux fonctionnalités utilisateur|
|**Statut**|ok|

#### TU-RT-001 : Consultation des terrains disponibles

|ID|TU-RT-001|
|---|---|
|**Titre**|Consultation des terrains disponibles|
|**Objectif**|Vérifier que l'utilisateur peut consulter les terrains disponibles|
|**Préconditions**|Utilisateur connecté à l'application|
|**Étapes**|1. Accéder à l'onglet "Terrains"<br>2. Sélectionner une date<br>3. Visualiser les terrains disponibles|
|**Résultat attendu**|- Liste des terrains affichée<br>- Informations sur le type, la capacité et l'état des terrains<br>- Filtrage correct par date|
|**Statut**|ok|

#### TU-RT-002 : Réservation d'un terrain

|ID|TU-RT-002|
|---|---|
|**Titre**|Réservation d'un terrain|
|**Objectif**|Vérifier que l'utilisateur peut réserver un terrain disponible|
|**Préconditions**|Utilisateur connecté, terrains disponibles|
|**Étapes**|1. Accéder à l'onglet "Terrains"<br>2. Sélectionner un terrain disponible<br>3. Choisir une date et un créneau horaire<br>4. Confirmer la réservation|
|**Résultat attendu**|- Réservation enregistrée<br>- Confirmation affichée<br>- Terrain non disponible pour d'autres utilisateurs sur ce créneau|
|**Statut**|ok|

#### TU-EQ-001 : Location d'équipement

|ID|TU-EQ-001|
|---|---|
|**Titre**|Location d'équipement lors d'une réservation|
|**Objectif**|Vérifier que l'utilisateur peut louer des équipements avec sa réservation|
|**Préconditions**|Utilisateur connecté, en cours de réservation de terrain|
|**Étapes**|1. Après sélection d'un terrain<br>2. Accéder à l'option "Ajouter des équipements"<br>3. Sélectionner des équipements disponibles<br>4. Confirmer la sélection|
|**Résultat attendu**|- Équipements ajoutés à la réservation<br>- Prix total mis à jour<br>- Équipements marqués comme réservés pour ce créneau|
|**Statut**|ok|

#### TU-CS-001 : Inscription à un cours

|ID|TU-CS-001|
|---|---|
|**Titre**|Inscription à un cours|
|**Objectif**|Vérifier que l'utilisateur peut s'inscrire à un cours|
|**Préconditions**|Utilisateur connecté|
|**Étapes**|1. Accéder à l'onglet "Cours"<br>2. Parcourir la liste des cours disponibles<br>3. Sélectionner un cours<br>4. Confirmer l'inscription|
|**Résultat attendu**|- Inscription enregistrée<br>- Confirmation affichée<br>- Mise à jour du nombre de places disponibles pour le cours|
|**Statut**|ok|

#### TU-NT-001 : Réception des notifications

|ID|TU-NT-001|
|---|---|
|**Titre**|Réception des notifications pour une réservation|
|**Objectif**|Vérifier que l'utilisateur reçoit des notifications pour ses réservations|
|**Préconditions**|Utilisateur avec une réservation confirmée|
|**Étapes**|1. Attendre 24h avant le début de la réservation<br>2. Vérifier la réception d'une notification de rappel|
|**Résultat attendu**|- Notification reçue au bon moment<br>- Contenu correct (date, heure, type de réservation)|
|**Statut**|ok|

#### TU-AD-001 : Accès interface administrative

|ID|TU-AD-001|
|---|---|
|**Titre**|Accès à l'interface administrative|
|**Objectif**|Vérifier que l'administrateur peut accéder à l'interface d'administration|
|**Préconditions**|Compte administrateur créé|
|**Étapes**|1. Se connecter avec les identifiants administrateur<br>2. Observer l'interface|
|**Résultat attendu**|- Accès à un tableau de bord administrateur<br>- Options de gestion des terrains, équipements et cours<br>- Fonctionnalités de suivi des réservations|
|**Statut**|ok|

### 4.2 Tests de sécurité

#### TU-SEC-001 : Validation des données du formulaire

|ID|TU-SEC-001|
|---|---|
|**Titre**|Validation des données du formulaire d'inscription|
|**Objectif**|Vérifier que les données sont correctement validées|
|**Préconditions**|Application ouverte sur la page d'inscription|
|**Étapes**|1. Tenter de soumettre le formulaire avec des données invalides (email mal formaté, champs vides, eTU.)<br>2. Observer les messages d'erreur|
|**Résultat attendu**|- Rejet des données invalides<br>- Messages d'erreur explicites<br>- Impossibilité de créer un compte avec des données invalides|
|**Statut**|ok|

#### TU-SEC-002 : Sécurité des sessions

|ID|TU-SEC-002|
|---|---|
|**Titre**|Sécurité des sessions utilisateur|
|**Objectif**|Vérifier que les sessions sont correctement sécurisées|
|**Préconditions**|Utilisateur connecté|
|**Étapes**|1. Fermer l'application sans se déconnecter<br>2. Rouvrir l'application<br>3. Après un délai d'inactivité de 30 minutes, tenter d'accéder à des fonctionnalités|
|**Résultat attendu**|- Session maintenue lors de la réouverture rapide<br>- Session expirée après le délai d'inactivité<br>- Demande de reconnexion|
|**Statut**|ok|

### 4.3 Tests de performance

#### TU-PERF-001 : Temps de chargement initial

|ID|TU-PERF-001|
|---|---|
|**Titre**|Temps de chargement initial de l'application|
|**Objectif**|Mesurer le temps de démarrage de l'application|
|**Préconditions**|Application installée|
|**Étapes**|1. Démarrer l'application<br>2. Mesurer le temps jusqu'à l'affichage de l'écran d'accueil|
|**Résultat attendu**|- Temps de chargement inférieur à 3 secondes sur un appareil standard|
|**Statut**|ok|

#### TU-PERF-002 : Performance de la recherche de disponibilité

|ID|TU-PERF-002|
|---|---|
|**Titre**|Performance de la recherche de disponibilité des terrains|
|**Objectif**|Évaluer la réactivité lors de la recherche de disponibilités|
|**Préconditions**|Utilisateur connecté|
|**Étapes**|1. Accéder à l'onglet "Terrains"<br>2. Changer rapidement de date plusieurs fois<br>3. Mesurer le temps de réponse|
|**Résultat attendu**|- Temps de réponse inférieur à 1 seconde<br>- Mise à jour fluide de l'interface|
|**Statut**|ok|

### 4.4 Tests d'utilisabilité

#### TU-UX-001 : Navigation dans l'application

|ID|TU-UX-001|
|---|---|
|**Titre**|Facilité de navigation|
|**Objectif**|Évaluer l'ergonomie générale et la facilité de navigation|
|**Préconditions**|Utilisateur connecté|
|**Étapes**|1. Naviguer entre les différents onglets<br>2. Accéder aux fonctionnalités principales<br>3. Retourner à l'écran d'accueil|
|**Résultat attendu**|- Navigation intuitive<br>- Accès rapide aux fonctionnalités principales<br>- Cohérence des interactions|
|**Statut**|ok|

#### TU-UX-002 : Expérience de réservation

|ID|TU-UX-002|
|---|---|
|**Titre**|Fluidité du processus de réservation|
|**Objectif**|Évaluer la simplicité du processus de réservation|
|**Préconditions**|Utilisateur connecté|
|**Étapes**|1. Initier une réservation de terrain<br>2. Suivre toutes les étapes jusqu'à confirmation<br>3. Évaluer le nombre d'étapes et la clarté des instructions|
|**Résultat attendu**|- Processus en moins de 5 étapes<br>- Instructions claires à chaque étape<br>- Confirmation explicite à la fin|
|**Statut**|ok|

### 4.5 Tests de compatibilité

#### TU-COMP-001 : Compatibilité Android

|ID|TU-COMP-001|
|---|---|
|**Titre**|Compatibilité avec différentes versions d'Android|
|**Objectif**|Vérifier que l'application fonctionne sur différentes versions d'Android|
|**Préconditions**|Appareils Android avec différentes versions (10.0, 11.0, 12.0, 13.0)|
|**Étapes**|1. Installer l'application sur chaque appareil<br>2. Tester les fonctionnalités principales|
|**Résultat attendu**|- Fonctionnement correct sur toutes les versions<br>- Interface adaptée à chaque taille d'écran|
|**Statut**|ok|

#### TU-COMP-002 : Compatibilité iOS

|ID|TU-COMP-002|
|---|---|
|**Titre**|Compatibilité avec différentes versions d'iOS|
|**Objectif**|Vérifier que l'application fonctionne sur différentes versions d'iOS|
|**Préconditions**|Appareils iOS avec différentes versions (13.0, 14.0, 15.0, 16.0)|
|**Étapes**|1. Installer l'application sur chaque appareil<br>2. Tester les fonctionnalités principales|
|**Résultat attendu**|- Fonctionnement correct sur toutes les versions<br>- Interface adaptée à chaque taille d'écran|
|**Statut**|ok|

