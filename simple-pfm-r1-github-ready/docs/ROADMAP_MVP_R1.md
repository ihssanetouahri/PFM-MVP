# Roadmap de déclinaison du prototype PFM — R1

Document de travail UX/technique. Le tableur `PFM - Fonctionnalités à venir(2).xlsx` reste la référence fonctionnelle, non inclus au dépôt pour limiter les fichiers internes partagés.

| Lot | Périmètre | Statut |
| --- | --- | --- |
| 0. Audit / préparation | Conserver le prototype initial, enlever les artefacts temporaires, documenter la structure | Préparé |
| 1. Mode R1 | Toggle R1 / Vision cible, navigation conditionnelle, garde-fous de routage | Première implémentation |
| 2. Simplification | Filtrer les widgets hors R1 et garder les deux modes de versement R1 ; masquer Défis / Simple Learn autonomes | Première implémentation |
| 3. Onboarding & personnalisation (F01–F02) | Règles métier des choix, hiérarchie des widgets, états vides, modification des préférences | À concevoir |
| 4. Mes dépenses (F04–F07) | Cohérence analytique, variations, comparaison de profils (F06), abonnements | À concevoir |
| 5. Budgets (F10) | Création, suggestion, consommation, seuils 80 % et 100 %, erreurs | À concevoir |
| 6. Projets (F11/F13/F14) | Gestion des projets, versements ponctuels / programmés, progression et confirmations | À concevoir |
| 7. Sous-agent PFM (F03) | Cas d'usage limités aux données autorisées, réponses vérifiables et limites | À concevoir |
| 8. QA et tests UX | Test de bout en bout, premières visites, absence de données, navigation retour, robustesse | À faire |

## Règles d'intervention

1. Préserver le design et les composants existants, ne jamais écraser la vision cible.
2. Implémenter des changements ciblés, un périmètre par commit, vérifier le mode R1 **et** le mode cible.
3. Les widgets pédagogiques peuvent expliquer une donnée, sans leçons, quiz, badges ni points actifs en R1.
4. Comparaison de profils et assistant : ne pas inventer de données de production ou d'accès API.
5. Recatégorisation, projections du reste à vivre, défis et épargne intelligente ne sont pas considérés comme des capacités R1 livrées.

## Points à confirmer

- Questionnaire et hiérarchie des widgets (F01, F02).
- Algorithme, critères et confidentialité de la comparaison de profils (F06).
- Disponibilité des abonnements détectés et précision des échéances (F07).
- Notification budgétaire 80/100 % et données de référence (F10).
- Support et modalités des sous-comptes, mouvements et programmations (F11, F13, F14).
- Données et droits d'action du sous-agent PFM (F03).
