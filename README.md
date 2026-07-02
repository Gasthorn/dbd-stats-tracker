# DbD Stats Tracker

Une application de bureau moderne et immersive pour **Dead by Daylight**, conçue pour permettre aux joueurs de suivre leurs performances, gérer leurs builds et relever des défis communautaires populaires tels que le **Hardcore Mode**, le **Survivor Gauntlet** et la **World Cup des Tueurs**.

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

#### World Cup des Tueurs

* Tournoi entre tueurs débloqués, organisé en poules façon Coupe du Monde (chapeaux répartis un par poule pour équilibrer le tirage).
* Phase de poules jouée journée par journée (un tueur, un match par journée), départagée au nombre de crochets.
* Qualification des 32 meilleurs tueurs (toutes poules confondues) pour une phase à élimination directe à seeding serpent, jusqu'à la finale.
* Le tirage du World Cup suivant se base automatiquement sur le classement final du précédent.

### 📈 Statistiques & Historique

* Heatmap d'activité des sessions de jeu.
* Graphiques de performance (taux de réussite tueur/survivant) et répartition des rôles.
* Analyse des personnages et builds favoris.
* Historique complet des parties, modifiable et filtrable.

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

1. Téléchargez la dernière version (installeur `dbd-stats-tracker`) depuis la page Releases.
2. Lancez l'installeur puis l'application.
3. Créez un compte ou connectez-vous.
4. Commencez à enregistrer vos parties.

Aucune installation de serveur local ou configuration technique n'est nécessaire.

## 🔄 Mises à jour

L'application vérifie automatiquement la disponibilité d'une nouvelle version à chaque démarrage et propose de l'installer en un clic (téléchargement, installation puis redémarrage automatique).

Les mises à jour sont publiées via GitHub Releases : un tag `v*` déclenche une pipeline CI qui compile, signe et prépare la release ; voir `.github/workflows/release.yml`.

## 🏗️ Technologies utilisées

* Frontend : React + TypeScript (architecture par feature) + Zustand
* Desktop : Tauri (Rust)
* Backend & Base de données : Supabase (Postgres, Auth, RLS)
* Graphiques : composants maison (SVG/CSS), sans librairie externe
* Gestion de version & CI : GitHub / GitHub Actions

## 📁 Structure du projet

* `/dbd-stats-tracker` : application Tauri.
  * `/src` : interface utilisateur et logique métier, organisées par feature (auth, match-tracker, builds, hardcore-mode, survivor-gauntlet, world-cup, statistics, settings...).
  * `/src-tauri` : backend Tauri (Rust), configuration de l'app et ressources embarquées dans le build (dont le dossier d'icônes par défaut).
  * `/supabase/migrations` : schéma et migrations de la base de données.
* `/.github/workflows` : pipeline de build, signature et publication des releases.

## 🎨 Personnalisation des Icônes

L'application embarque un dossier d'icônes par défaut (personnages, perks, objets, add-ons), utilisable sans aucune configuration.

Tu peux pointer vers ton propre dossier `Icons` depuis la page d'accueil de l'app pour le remplacer. Structure attendue :

* `Icons/CharPortraits/`
* `Icons/Perks/`
* `Icons/ItemAddons/`
* `Icons/Items/`

Si une icône est absente de ton dossier personnalisé, l'application la récupère automatiquement depuis le dossier par défaut plutôt que de l'afficher vide. Chaque dossier peut aussi contenir un fichier `empty.png` utilisé comme ressource de secours ultime.

## 📜 Licence

Ce projet est destiné à un usage personnel et communautaire.

Dead by Daylight, ses personnages, icônes et éléments visuels sont la propriété de Behaviour Interactive.

---

Développé pour la communauté Dead by Daylight.
