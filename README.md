# Application Mobile de Gestion pour Centre Sportif

## Présentation du projet

Cette application mobile développée avec React Native et Expo permet aux centres sportifs de moderniser la gestion de leurs activités. Elle offre aux utilisateurs la possibilité de consulter les disponibilités, réserver des terrains, s'inscrire à des cours et recevoir des notifications.

![../media/authflow.png](../media/authflow.png)

## Fonctionnalités principales

- **Gestion des utilisateurs** : Création de compte, authentification sécurisée
- **Réservation de terrains** : Consultation des disponibilités et réservation de créneaux
- **Location d'équipements** : Possibilité d'ajouter des équipements à une réservation
- **Inscription aux cours** : Visualisation et inscription aux différents cours proposés
- **Notifications** : Rappels automatiques et confirmations de réservation
- **Interface administrative** : Gestion des ressources pour les administrateurs

## Technologies utilisées

- **Frontend** : React Native, Expo, TypeScript
- **Navigation** : React Navigation (Bottom Tabs + Stack)
- **Backend** : Supabase (PostgreSQL, Authentification)
- **UI Components** : Rapi UI
- **État global** : React Context API

## Installation et démarrage

1. Installer [Node.js](https://nodejs.org/fr/) (version 16 ou supérieure)
2. Installer Expo CLI
   ```bash
   npm install --global expo-cli
   ```
3. Cloner ce dépôt
4. Installer les dépendances
   ```bash
   npm install
   ```
5. Configurer Supabase
   - Créer un projet sur [Supabase.io](https://supabase.io)
   - Ajouter vos identifiants Supabase dans `./src/initSupabase.ts`
   ```typescript
   // Idéalement, stockez ces clés dans un fichier .env
   export const supabase = createClient(
     "votre_url_supabase", 
     "votre_clé_supabase",
     {
       localStorage: AsyncStorage as any,
     }
   );
   ```
6. Lancer l'application
   ```bash
   expo start
   ```

## Structure du projet

```
/src/
  /assets/          # Ressources médias (images, polices)
  /components/      # Composants réutilisables
    /common/        # Boutons, cartes, etc.
    /forms/         # Formulaires
    /utils/         # Composants utilitaires
  /navigation/      # Configuration React Navigation
  /provider/        # Contexte React (authentification, etc.)
  /screens/         # Écrans de l'application
    /auth/          # Authentification (login, inscription)
    /reservations/  # Gestion des réservations
    /courses/       # Gestion des cours
    /profile/       # Profil utilisateur
    /admin/         # Interface administrative
  /services/        # Services (API, notifications)
  /types/           # Types TypeScript
```

## Documentation complémentaire

Pour plus d'informations sur le projet, veuillez consulter :
- [Cahier de test](./Cahier%20de%20test.md) : Scénarios de test et validation
- [Dossier d'Architecture](./DA.md) : Architecture technique détaillée

## Captures d'écran

![MCD](./CaptureLooping%20MCD.PNG)
*Modèle Conceptuel des Données*

---

*Projet développé dans le cadre d'un BTS SIO SLAM - Épreuve E5*
