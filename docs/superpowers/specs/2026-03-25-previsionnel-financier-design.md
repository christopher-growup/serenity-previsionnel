# Prévisionnel Financier — Serenity Institut

## Contexte

Serenity Institut propose une formation en entrepreneuriat (Bloc 4) qui inclut la réalisation d'un prévisionnel financier. L'outil actuel est un fichier Excel vieillissant, incompatible Google Sheets, complexe pour des débutants, et ne gérant pas les spécificités des différents statuts juridiques.

L'objectif est de le remplacer par une **application web guidée (wizard)** qui accompagne les stagiaires pas à pas dans la construction de leur prévisionnel financier sur 3 ans, avec export PDF et Excel professionnels.

## Public cible

- Stagiaires débutants complets en gestion/finance
- Accès sur ordinateur via navigateur web
- Besoin de reprendre le travail sur plusieurs sessions
- Outil 100% autonome (pas de suivi formateur intégré)

## Approche retenue

Application web statique (React), sans backend ni base de données. Les données restent chez le stagiaire (localStorage + fichier de sauvegarde). Hébergée sur le VPS Hostinger existant de Serenity Institut.

---

## Parcours utilisateur — 8 étapes

### Étape 1 : Mon projet
- Nom du porteur de projet
- Nom de la société
- Date de création envisagée
- Activité principale
- **Type d'activité** : Vente de marchandises (BIC), Prestation de services (BIC), ou Activité libérale (BNC) — choix via cartes simples avec exemples concrets. Ce choix impacte les taux de cotisations, abattements fiscaux, plafonds CA et seuils TVA.
- Adresse de domiciliation
- Description de l'offre
- Description du marché
- Stratégie de développement
- Expérience professionnelle, compétences, motivations

### Étape 2 : Mon statut juridique
- Choix via **cartes visuelles** (pas un menu déroulant)
- Statuts disponibles : Micro-entreprise, EI, EURL, SARL, SASU, SAS
- Chaque carte affiche un résumé en langage simple
- Fiche détaillée au clic : cotisations, TVA, impôt, plafonds, dividendes
- **Pour EURL/SARL** : question supplémentaire "Êtes-vous gérant majoritaire ou minoritaire ?" avec explication simple de la différence
- **Pour micro-entreprise** : question "Optez-vous pour le versement libératoire de l'impôt sur le revenu ?" avec explication (taux simplifié : 1% vente, 1.7% BIC services, 2.2% BNC)
- Le choix impacte automatiquement les étapes suivantes (cotisations, TVA, etc.)
- Encadré récapitulatif du statut visible dans la barre latérale pour le reste du parcours

### Étape 3 : Mes offres
- Interface "Ajouter une offre" (bouton simple)
- Par offre : nom, prix unitaire HT, délai de paiement (mois), acompte (%), TVA applicable (champ masqué et fixé à 0% si micro-entreprise en franchise de TVA)
- Jusqu'à 10 offres
- Champs pré-remplis avec des exemples en placeholder

### Étape 4 : Mes investissements & financements
- **Investissements** : liste libre (description + montant + trimestre + année + durée d'amortissement en années). Durées par défaut : matériel informatique 3 ans, mobilier 5-10 ans, véhicule 4-5 ans, aménagements 10 ans. Le stagiaire peut ajuster.
- **Financements** : Capital, Apports personnels, Emprunt (montant + durée en mois + taux annuel — génère automatiquement un tableau d'amortissement avec séparation capital/intérêts pour le compte de résultat et la trésorerie), Subventions
- Total investissements vs total financements affiché en temps réel avec indicateur d'équilibre

### Étape 5 : Mes ventes prévisionnelles
- Par offre définie à l'étape 3 : nombre de ventes par mois sur 3 ans
- Interface simplifiée : saisie par trimestre possible (répartition automatique sur les mois)
- Graphique en temps réel montrant l'évolution du CA
- Alerte si micro-entreprise et dépassement du plafond CA

### Étape 6 : Mes charges
- **Micro-entreprise** : cette étape est présentée à titre informatif ("Pour votre information, même si ces charges ne sont pas déductibles fiscalement en micro-entreprise, les connaître vous aide à évaluer votre rentabilité réelle"). Les charges sont collectées mais un bandeau rappelle qu'elles ne réduisent pas le bénéfice fiscal.
- **Autres statuts** : charges déductibles normalement.
- **Charges fixes** : liste pré-remplie avec suggestions (loyer, assurance, logiciels, téléphone, marketing, honoraires comptables, frais bancaires, déplacements, etc.)
- Le stagiaire ajuste les montants ou supprime/ajoute des lignes
- **Charges variables** : liées aux offres (matières premières, sous-traitance), par offre
- Montant annuel + possibilité d'indiquer une évolution année 2 et 3

### Étape 7 : Ma rémunération
- **Micro-entreprise** : cette étape est simplifiée. Le CA est déjà saisi à l'étape 5 ; l'application calcule automatiquement le revenu net après cotisations sociales et impôt. Le stagiaire peut indiquer s'il prévoit de se verser la totalité ou une partie du revenu disponible.
- **EI / EURL / SARL** : rémunération du dirigeant en salaire brut annuel. Calcul automatique des cotisations selon le statut et le type de gérance.
- **SASU / SAS** : rémunération du président en salaire brut annuel. Calcul automatique des charges patronales (~54%) et salariales (~28%).
- Possibilité d'ajouter des salariés : poste, salaire brut, date d'embauche (trimestre + année), augmentation annuelle
- Affichage du coût total employeur en temps réel

### Étape 8 : Ma synthèse
Page récapitulative auto-générée, non modifiable, avec :
- **Compte de résultat prévisionnel** : CA, charges externes, charges de personnel, EBE, dotations aux amortissements, résultat d'exploitation, résultat net (après IS/IR selon statut)
- **Plan de trésorerie** : mois par mois année 1, par trimestre années 2-3
- **Indicateurs clés** : point mort (en euros et en mois), marge brute, EBE, résultat, ratio dette/capital, ratio dette/résultat
- **Conseils contextuels** : messages adaptés aux résultats (ex: "Votre point mort est atteint au mois X", "Attention, votre trésorerie est négative au mois Y")
- **Graphiques** : évolution du CA, de la trésorerie, répartition des charges
- **Boutons d'export** : PDF et Excel

---

## Gestion des statuts juridiques

### Classification d'activité (définie à l'étape 1)

Le type d'activité impacte de nombreux calculs. Trois types :
- **Vente de marchandises (BIC)** : achat-revente, fabrication
- **Prestation de services (BIC)** : artisans, services commerciaux
- **Activité libérale CIPAV (BNC)** : architectes, ingénieurs-conseils, psychologues, etc. (cotisations 23.2%)
- **Activité libérale hors CIPAV (BNC)** : consultants, coachs, formateurs, la plupart des professions libérales non réglementées (cotisations 25.6%)

Note : à l'étape 1, si le stagiaire choisit "Activité libérale", une sous-question demande s'il relève de la CIPAV ou non, avec des exemples concrets pour aider au choix.

### Règles par statut (barèmes 2026)

#### Cotisations sociales

| Statut | Taux |
|--------|------|
| Micro — Vente de marchandises (BIC) | 12.3% du CA |
| Micro — Prestations de services (BIC) | 21.2% du CA |
| Micro — Activité libérale CIPAV | 23.2% du CA |
| Micro — Activité libérale BNC hors CIPAV | 25.6% du CA |
| EI | ~45% du bénéfice (valeur exacte définie dans `baremes.ts`) |
| EURL/SARL — Gérant majoritaire | ~45% de la rémunération (valeur exacte définie dans `baremes.ts`) |
| EURL/SARL — Gérant minoritaire | ~65% du salaire brut, patronal + salarial (valeur exacte définie dans `baremes.ts`) |
| SASU/SAS — Président | ~82% du salaire net (~54% patronal + ~28% salarial sur le brut) |

#### TVA

| Statut | Régime |
|--------|--------|
| Micro-entreprise | Franchise en base : seuils 37 500€ (services/libéral) / 85 000€ (vente). Seuil majoré : 41 250€ / 93 500€. Dépassement du seuil de base → TVA applicable l'année suivante. Dépassement du seuil majoré → TVA applicable immédiatement. |
| EI, EURL, SARL, SASU, SAS | TVA collectée (régime réel) |

#### Impôt

| Statut | Régime |
|--------|--------|
| Micro-entreprise (sans versement libératoire) | IR barème progressif, après abattement : 71% (vente BIC), 50% (services BIC), 34% (BNC) |
| Micro-entreprise (versement libératoire) | Taux forfaitaire : 1% (vente), 1.7% (services BIC), 2.2% (BNC) |
| EI | IR barème progressif sur le bénéfice (option IS possible, non gérée pour simplifier) |
| EURL/SARL | IS : 15% jusqu'à 42 500€, 25% au-delà |
| SASU/SAS | IS : 15% jusqu'à 42 500€, 25% au-delà |

#### Barème IR progressif 2026 (pour EI et micro sans versement libératoire)

| Tranche | Taux |
|---------|------|
| Jusqu'à 11 294€ | 0% |
| 11 294€ à 28 797€ | 11% |
| 28 797€ à 82 341€ | 30% |
| 82 341€ à 177 106€ | 41% |
| Au-delà de 177 106€ | 45% |

Note : pour simplifier, l'application utilise une part fiscale unique (célibataire). Un message informe le stagiaire que sa situation familiale peut modifier le calcul.

#### Plafonds, dividendes, charges

| Élément | Micro-entreprise | EI | EURL/SARL | SASU/SAS |
|---------|-----------------|-----|-----------|----------|
| Plafond CA | 77 700€ (services+libéral) / 188 700€ (vente) | Non | Non | Non |
| Dividendes | Non applicable | Non applicable | Oui (cotisations sociales si gérant majoritaire au-delà de 10% du capital) | Oui (flat tax 31.4%) |
| Charges déductibles | Non | Oui | Oui | Oui |

### Alertes automatiques
- Dépassement plafond micro-entreprise (seuil de base ET seuil majoré)
- Dépassement seuil franchise TVA (avec distinction base/majoré)
- Trésorerie négative
- Ratio dette/résultat > 500%
- Résultat net négatif sur 3 ans

### Fichier de configuration
Tous les taux, seuils et barèmes sont centralisés dans `config/baremes.ts`. Mise à jour annuelle possible sans toucher au code métier. Le fichier inclut un champ `annee` pour traçabilité.

---

## Interface utilisateur

### Layout
- **Barre de progression** (haut) : 8 étapes numérotées, étape courante mise en évidence, étapes complétées cochées
- **Zone principale** (centre) : formulaire de l'étape en cours
- **Barre latérale** (droite, repliable) : récapitulatif statut + mini-synthèse temps réel (CA, charges, résultat)
- **Barre d'actions** (bas, toujours visible) : "Sauvegarder mon travail", "Étape précédente", "Étape suivante"

### Principes UX pour débutants
- Champs pré-remplis avec exemples en placeholder
- Infobulles (icône "?") sur chaque terme technique
- Validation douce (suggestions, pas d'erreurs bloquantes agressives)
- Graphiques en temps réel aux étapes 5 et 8
- Pas de jargon technique visible (pas de "JSON", "localStorage", etc.)
- Typographie grande, espaces aérés, couleurs douces et professionnelles

### Écran d'accueil
1. "Commencer un nouveau prévisionnel"
2. "Reprendre mon travail" (si données en localStorage)
3. "Charger un fichier sauvegardé" (import fichier .previsionnel)
- Mini-tutoriel au premier lancement (3 écrans) expliquant le fonctionnement et la sauvegarde

### Sauvegarde — Point critique
- Sauvegarde automatique en localStorage à chaque changement de champ
- Bouton "Sauvegarder mon travail" toujours visible : télécharge un fichier `.previsionnel`
- Nom du fichier : `Previsionnel-NomPrenom-YYYY-MM-DD.previsionnel`
- Rappel de sauvegarde à chaque fin d'étape
- Le mot "JSON" n'apparaît jamais. Le format est présenté comme "votre fichier de prévisionnel"
- Tutoriel dédié à la sauvegarde au premier lancement

---

## Exports

### PDF
Document professionnel, prêt pour transmission à banque/organisme/expert-comptable :
1. Page de garde (projet, porteur, date, statut, logo Serenity Institut optionnel)
2. Présentation du projet
3. Plan de financement (investissements + sources)
4. Compte de résultat prévisionnel sur 3 ans (tableau annuel)
5. Plan de trésorerie (mois par mois année 1, trimestriel années 2-3)
6. Indicateurs clés et ratios
- Mise en page soignée : en-têtes, pieds de page, numéros de page

### Excel (.xlsx)
Fichier structuré avec onglets :
- Formules présentes pour vérification par expert-comptable
- Cellules éditables identifiées par couleur de fond
- Cellules calculées protégées
- Onglets : Présentation, Investissements, Financement, CA, Charges, Rémunération, Compte de résultat, Trésorerie

---

## Modèle de données

Le fichier `.previsionnel` contient un objet JSON avec un champ `version` pour compatibilité future.

```typescript
interface Previsionnel {
  version: number; // 1
  dateCreation: string; // ISO date de création du fichier
  dateDerniereModification: string;
  etapeCourante: number; // 1-8

  // Étape 1
  projet: {
    nomPorteur: string;
    nomSociete: string;
    dateCreationEnvisagee: string;
    activitePrincipale: string;
    typeActivite: 'vente_bic' | 'services_bic' | 'liberale_cipav' | 'liberale_bnc_ssi';
    adresse: string;
    descriptionOffre: string;
    descriptionMarche: string;
    strategie: string;
    experience: string;
    competences: string;
    motivations: string;
  };

  // Étape 2
  statut: {
    statutJuridique: 'micro' | 'ei' | 'eurl' | 'sarl' | 'sasu' | 'sas';
    typeGerance?: 'majoritaire' | 'minoritaire'; // EURL/SARL uniquement
    versementLiberatoire?: boolean; // micro uniquement
  };

  // Étape 3
  offres: Array<{
    id: string;
    nom: string;
    prixUnitaireHT: number;
    delaiPaiementMois: number;
    acomptePourcent: number;
    tauxTVA: number; // 0 si micro en franchise
  }>;

  // Étape 4
  investissements: Array<{
    description: string;
    montant: number;
    trimestre: number; // 1-4
    annee: number; // 1-3
    dureeAmortissement: number; // en années
  }>;
  financements: {
    capital: number;
    apports: number;
    emprunts: Array<{ description: string; montant: number; dureeMois: number; tauxAnnuel: number }>; // Permet plusieurs emprunts (prêt bancaire, prêt d'honneur, etc.)
    subventions: number;
  };

  // Étape 5 — ventes[offreId][mois] = nombre de ventes
  ventes: Record<string, number[]>; // 36 mois (index 0-35)

  // Étape 6
  chargesFixes: Array<{
    description: string;
    montantAnnuel: number;
    evolutionAn2: number; // % d'évolution
    evolutionAn3: number;
  }>;
  chargesVariables: Array<{
    offreId: string;
    description: string;
    coutUnitaire: number;
  }>;

  // Étape 7
  remunerationDirigeant: {
    salaireBrutAnnuel: number; // 0 pour micro
    augmentationAnnuelle: number; // %
    partRevenusRetires?: number; // micro uniquement : % du revenu disponible que le stagiaire prévoit de se verser (défaut 100%)
  };
  salaries: Array<{
    poste: string;
    salaireBrutAnnuel: number;
    dateEmbauche: { trimestre: number; annee: number };
    augmentationAnnuelle: number;
  }>;
}
```

---

## Architecture technique

### Stack
- **Framework** : React + TypeScript
- **Styling** : Tailwind CSS
- **Graphiques** : Recharts
- **Export PDF** : jsPDF + jspdf-autotable
- **Export Excel** : SheetJS (xlsx)
- **Build** : Vite
- **Déploiement** : fichiers statiques servis par Nginx sur VPS Hostinger

### Structure du projet
```
src/
  components/         → Composants UI réutilisables (ProgressBar, Tooltip, Card, etc.)
  steps/              → Les 8 étapes du wizard (Step1Project.tsx, Step2Statut.tsx, etc.)
  config/
    baremes.ts        → Taux, seuils, cotisations par statut (mise à jour annuelle)
    statuts.ts        → Descriptions et règles par statut juridique
  utils/
    calculs.ts        → Moteur de calcul (CA, charges, trésorerie, ratios, point mort)
    export-pdf.ts     → Génération du PDF
    export-excel.ts   → Génération du fichier Excel
    storage.ts        → Sauvegarde/chargement (localStorage + fichier .previsionnel)
  types/
    index.ts          → Types TypeScript du modèle de données
  App.tsx             → Orchestration du wizard
  main.tsx            → Point d'entrée
```

### Caractéristiques
- Aucune base de données
- Aucun backend / API
- Poids < 2 Mo
- Données 100% côté client (pas de RGPD serveur)
- Mise à jour des barèmes via fichier de config sans toucher au code
- Navigateurs cibles : 2 dernières versions de Chrome, Firefox, Edge, Safari
- Gestion de la corruption localStorage : vérification d'intégrité au chargement, message clair si données corrompues avec proposition de charger un fichier .previsionnel de sauvegarde
- Un seul prévisionnel actif en localStorage à la fois (pour éviter les problèmes de quota)

---

## Hors périmètre (YAGNI)
- Comptes utilisateurs / authentification
- Base de données / backend
- Mode collaboratif / partage en temps réel
- Suivi formateur des prévisionnels stagiaires
- Application mobile native
- Mode hors-ligne avancé (service worker)
- Comparateur de statuts juridiques (pourrait être ajouté plus tard)
