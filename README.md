# DbD Stats Tracker

Une application de bureau moderne et immersive pour **Dead by Daylight**, conçue pour permettre aux joueurs de suivre leurs performances, gérer leurs builds et relever des défis communautaires populaires tels que le **Hardcore Mode** et le **Survivor Gauntlet**.

## 🚀 Fonctionnalités principales

### 📊 Suivi de Match (Tracker)

* Enregistrement détaillé des parties en Tueur ou Survivant.
* Saisie complète : personnage, build (perks/équipement), points de sang, générateurs, sacrifices, évasions, etc.
* Interface inspirée de Dead by Daylight avec portraits de personnages et emplacements de perks fidèles à l'expérience du jeu.

### 🏆 Modes de Jeu Spécifiques

#### Hardcore Mode

* Progression par grades et pips.
* Mort permanente des personnages pour la saison en cours.
* Restrictions automatiques des perks selon les personnages encore disponibles.

#### Survivor Gauntlet

* Défi de progression sur l'ensemble des survivants.
* Système de paliers de difficulté évolutifs.
* Gestion automatique des checkpoints et des échecs.
* Validation automatique des objectifs lors de l'enregistrement des parties.

### 📈 Statistiques & Historique

* Heatmap d'activité des sessions de jeu.
* Graphiques de performance détaillés.
* Analyse des personnages et builds favoris.
* Historique complet des parties.
* Export et import des données utilisateur.

### 🛠️ Gestion des Builds

* Création et sauvegarde de builds personnalisés.
* Bibliothèque de builds favoris.
* Chargement rapide dans le formulaire de suivi de match.

### ☁️ Synchronisation des Données

* Sauvegarde sécurisée via Supabase.
* Synchronisation entre plusieurs appareils.
* Gestion des profils utilisateurs.
* Mise à jour des données en temps réel.

## 💻 Installation

### Utilisateur final

1. Téléchargez la dernière version depuis la page Releases.
2. Exécutez le fichier `DbDStatsTracker.exe`.
3. Créez un compte ou connectez-vous.
4. Commencez à enregistrer vos parties.

Aucune installation de serveur local ou configuration technique n'est nécessaire.

## 🔄 Mises à jour

L'application vérifie automatiquement la disponibilité des nouvelles versions.

Les mises à jour sont distribuées via GitHub Releases et peuvent être installées directement depuis l'application.

## 🏗️ Technologies utilisées

* Frontend : React + TypeScript
* Desktop : Tauri
* Backend & Base de données : Supabase
* Authentification : Supabase Auth
* Graphiques : Chart.js
* Gestion de version : GitHub

## 📁 Structure du projet

* `/src` : Interface utilisateur et logique métier.
* `/assets` : Ressources graphiques.
* `/database` : Scripts et migrations Supabase.
* `/public` : Fichiers statiques.
* `/docs` : Documentation du projet.

## 🎨 Personnalisation des Icônes

L'application permet l'utilisation d'icônes personnalisées pour les personnages, perks, objets et add-ons.

Structure recommandée :

* `Icons/CharPortraits/`
* `Icons/Perks/`
* `Icons/ItemAddons/`
* `Icons/Items/`

Chaque dossier peut contenir un fichier `empty.png` utilisé comme ressource de secours lorsqu'une icône est absente.

## 📜 Licence

Ce projet est destiné à un usage personnel et communautaire.

Dead by Daylight, ses personnages, icônes et éléments visuels sont la propriété de Behaviour Interactive.

---

Développé pour la communauté Dead by Daylight.
