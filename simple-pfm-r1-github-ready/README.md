# Simple — Mon espace financier / Prototype MVP R1

Prototype React + TypeScript issu de la version Google AI Studio du 26 octobre 2026. **Il s'agit d'une démo avec données simulées**, pas d'une application bancaire connectée.

## Démarrage

```bash
npm install
npm run dev
```

Ouvrir l'URL de développement affichée par Vite (par défaut `http://localhost:3000`).

## Modes du prototype

Le panneau de démonstration propose deux modes :

- **MVP R1 (par défaut)** : navigation Dépenses / Budgets / Projets, avec les widgets correspondant au périmètre R1. Les principales actions non R1 sont masquées ou redirigées vers « Mon espace ».
- **Vision cible** : conserve les sections et parcours exploratoires initiaux, notamment Foyer, Communauté, Investissements, Défis et Simple Learn.

Le changement de mode revient à la Home et ne supprime pas les données de démonstration.

## Ce qui est inclus dans ce premier lot

- Copie fidèle de la base UI existante ; pas de refonte graphique.
- `src/config/pfmRelease.ts` : liste explicite des catégories, widgets et écrans autorisés en R1.
- Mode R1 / Vision cible piloté depuis `PFMContext.tsx` et `DemoControlsBar.tsx`.
- Navigation simplifiée et filtrage du catalogue des widgets.
- Onboarding concentré sur Comprendre / Budget / Épargne, avec microcopies adaptées au mode R1.
- Création de projet : choix limité aux versements ponctuels et programmés en mode R1.

Les fonctionnalités R1 détaillées **ne sont pas toutes finalisées**. La comparaison avec des profils similaires (F06), les vraies règles de personnalisation, les alertes budgets, les états et l'agent PFM restent à développer et à valider métier / technique. Voir `docs/ROADMAP_MVP_R1.md`.

## Fonctionnalités R1 de référence

F01 questionnaire ; F02 espace personnalisé ; F03 sous-agent PFM ; F04 vision analytique ; F05 évolutions significatives ; F06 comparaison profils similaires ; F07 abonnements et charges ; F10 budgets / alertes ; F11 projets ; F13 versements programmés ; F14 versements ponctuels.

Les 7 fonctionnalités à release non affectée (F08, F09, F12, F15–F18) sont hors mode R1. Aucune hypothèse UX de ce prototype n'équivaut à une validation bancaire.

## Qualité et confidentialité

La distribution source n'inclut ni `.aistudio/artifacts` ni fichiers `.env` locaux. Garder le dépôt GitHub **privé** tant que les visuels, contenus et conditions de diffusion n'ont pas été validés. Ne pas ajouter d'identifiants, transactions ou données clients réelles.

Commandes de vérification dans un environnement disposant des dépendances :

```bash
npm run lint
npm run build
```
