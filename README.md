# DbD Stats Tracker

Une application de bureau moderne et immersive pour **Dead by Daylight**, conçue pour permettre aux joueurs de suivre leurs performances, gérer leurs builds et relever des défis communautaires populaires tels que le **Hardcore Mode**, le **Survivor Gauntlet** et la **World Cup des Tueurs**.

## 🚀 Fonctionnalités principales

### 📊 Suivi de Match (Tracker)

* Enregistrement détaillé des parties en Tueur ou Survivant.
* Saisie complète : personnage, build (perks/équipement), points de sang, générateurs, sacrifices, évasions, etc.
* Sélection aléatoire du personnage en un clic (comme pour les perks en Chaos Shuffle).
* Distinction du sort du survivant : sacrifié (crochet) ou tué (mori).
* Association d'une équipe SWF à une partie survivant.
* Interface inspirée de Dead by Daylight avec portraits de personnages et emplacements de perks fidèles à l'expérience du jeu.

### 👥 Social

#### Amis

* Demandes d'ami par nom d'utilisateur, avec notification à l'ouverture de l'app chez le destinataire.
* Liste d'amis avec statut en ligne approximatif (dernière activité).

#### Équipes (SWF)

* Carnet d'équipes de jeu : jusqu'à 3 coéquipiers par équipe, en texte libre.
* Suggestions automatiques depuis la liste d'amis lors de la saisie des pseudos.
* Sélection de l'équipe au moment d'enregistrer une partie survivant, pour des statistiques par équipe.

### 🏆 Modes de Jeu Spécifiques

#### Hardcore Mode

* Progression par grades et pips.
* Mort permanente des personnages pour la saison en cours.
* Restrictions automatiques des perks selon les personnages encore disponibles.
* **Variante en équipe (survivant)** : formez une escouade avec des amis utilisant l'app (invitation + acceptation, une équipe active par joueur). Les morts de chaque coéquipier retirent le survivant du pool commun de l'équipe, sans jamais affecter les pips ni le classement personnel. Même cycle de saisons que le mode solo.

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

### 🌍 Langues & Apparence

* Interface disponible en 5 langues : Français, English, Deutsch, Italiano, Español.
* Mode sombre / mode clair, au choix dans les Paramètres.
* **Langue des noms du jeu** (réglage séparé) : affichez les noms de tueurs, perks, objets et add-ons dans la langue de votre choix, avec repli automatique sur l'anglais pour les noms sans traduction. Le nom anglais canonique reste utilisé en interne (stockage et icônes), le changement est purement visuel.
* Saisie multilingue : tapez un nom de perk ou d'add-on dans n'importe quelle langue supportée, l'app le reconnaît via une table d'équivalences (ex. « Fluch: Verderben » ⇒ Hex: Ruin).
* Préférences locales à l'appareil (thème, langue, langue des noms), appliquées sans redémarrage.

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
* Backend & Base de données : Supabase (Postgres, Auth, RLS, fonctions SQL `security definer` pour les fonctionnalités sociales)
* Internationalisation : i18next + react-i18next (5 langues), dictionnaires de noms du jeu maison
* Graphiques : composants maison (SVG/CSS), sans librairie externe
* Gestion de version & CI : GitHub / GitHub Actions

## 📁 Structure du projet

* `/dbd-stats-tracker` : application Tauri.
  * `/src` : interface utilisateur et logique métier, organisées par feature (auth, match-tracker, builds, hardcore-mode, hardcore-teams, survivor-gauntlet, world-cup, statistics, teams, friends, settings...).
  * `/src/shared/i18n` : ressources de traduction de l'interface (`locales/`) et dictionnaires des noms du jeu (`gameNames.ts`).
  * `/src-tauri` : backend Tauri (Rust), configuration de l'app et ressources embarquées dans le build (dont le dossier d'icônes par défaut).
  * `/supabase/migrations` : schéma et migrations de la base de données.
* `/.github/workflows` : pipeline de build, signature et publication des releases.

## 🎨 Personnalisation des Icônes

L'application embarque un dossier d'icônes par défaut (personnages, perks, objets, add-ons), utilisable sans aucune configuration.

Tu peux pointer vers ton propre dossier `Icons` depuis l'onglet Paramètres de l'app pour le remplacer. Structure attendue :

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
