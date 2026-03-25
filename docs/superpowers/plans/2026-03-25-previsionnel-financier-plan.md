# Previsionnel Financier Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static React web wizard that guides beginner trainees through creating a 3-year financial forecast, with French legal status-specific calculations and PDF/Excel export.

**Architecture:** Single-page React app with 8 wizard steps, no backend. Data stored in localStorage + downloadable file. All calculations client-side. Configuration-driven tax rates in a dedicated file for annual updates.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS 4, Recharts, jsPDF + jspdf-autotable, SheetJS (xlsx), Vitest + React Testing Library

**Spec:** `docs/superpowers/specs/2026-03-25-previsionnel-financier-design.md`

---

## File Structure

```
previsionnel-app/
  package.json
  vite.config.ts
  tsconfig.json
  index.html
  public/
    favicon.ico
  src/
    main.tsx                          → App entry point
    App.tsx                           → Wizard orchestrator + routing
    types/
      index.ts                        → All TypeScript interfaces (Previsionnel, etc.)
    config/
      baremes.ts                      → Tax rates, thresholds, social contributions (2026)
      statuts.ts                      → Legal status descriptions & rules for UI cards
      charges-suggestions.ts          → Default charge items for Step 6
    utils/
      storage.ts                      → localStorage + .previsionnel file save/load
      calculs.ts                      → Core calculation engine (CA, charges, tresorerie, ratios)
      calculs-cotisations.ts          → Social contribution calculations per status
      calculs-impots.ts               → Tax calculations (IS, IR, versement liberatoire)
      calculs-emprunt.ts              → Loan amortization table (capital/interest split)
      calculs-amortissement.ts        → Investment depreciation calculations
      export-pdf.ts                   → PDF generation
      export-excel.ts                 → Excel generation
      defaults.ts                     → Factory function for empty Previsionnel
    components/
      ProgressBar.tsx                 → 8-step progress indicator
      Tooltip.tsx                     → "?" icon with popover explanation
      Card.tsx                        → Selectable card (for status/activity type)
      FormField.tsx                   → Labeled input with optional tooltip
      AlertBanner.tsx                 → Soft warning/info banner
      SaveReminder.tsx                → "Remember to save" banner shown at step transitions
      Sidebar.tsx                     → Right sidebar with status summary + live mini-synthesis
      ActionBar.tsx                   → Bottom bar: Save, Previous, Next buttons
      WelcomeScreen.tsx               → Landing page with 3 options + tutorial
      Tutorial.tsx                    → 3-screen onboarding overlay
    steps/
      Step1Project.tsx                → Mon projet
      Step2Statut.tsx                 → Mon statut juridique
      Step3Offres.tsx                 → Mes offres
      Step4Investissements.tsx        → Investissements & Financements
      Step5Ventes.tsx                 → Ventes previsionnelles
      Step6Charges.tsx                → Mes charges
      Step7Remuneration.tsx           → Ma remuneration
      Step8Synthese.tsx               → Synthese + exports
    __tests__/
      utils/
        calculs.test.ts
        calculs-cotisations.test.ts
        calculs-impots.test.ts
        calculs-emprunt.test.ts
        calculs-amortissement.test.ts
        storage.test.ts
```

---

## Phase 1: Foundation (Project Setup + Types + Config)

### Task 1: Scaffold the project

**Files:**
- Create: `previsionnel-app/package.json`
- Create: `previsionnel-app/vite.config.ts`
- Create: `previsionnel-app/tsconfig.json`
- Create: `previsionnel-app/index.html`
- Create: `previsionnel-app/src/main.tsx`
- Create: `previsionnel-app/src/App.tsx`

- [ ] **Step 1: Initialize git repository and create Vite + React + TypeScript project**

```bash
cd "/Users/growupconsulting/Documents/Serenity Institut/Prévisionnel Financier"
git init
npm create vite@latest previsionnel-app -- --template react-ts
```

- [ ] **Step 2: Install dependencies**

```bash
cd previsionnel-app
npm install recharts jspdf jspdf-autotable xlsx
npm install -D tailwindcss @tailwindcss/vite vitest @testing-library/react @testing-library/jest-dom jsdom @types/node
```

- [ ] **Step 3: Configure Tailwind CSS 4 with Vite plugin**

In `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

In `src/index.css`:
```css
@import "tailwindcss";
```

- [ ] **Step 4: Configure Vitest**

In `vite.config.ts`, add test config:
```typescript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
  },
})
```

Create `src/test-setup.ts`:
```typescript
import '@testing-library/jest-dom/vitest'
```

Update `tsconfig.json` to include `"types": ["vitest/globals"]` in `compilerOptions`.

- [ ] **Step 5: Create minimal App.tsx placeholder**

```tsx
function App() {
  return <div className="min-h-screen bg-gray-50">
    <h1 className="text-2xl font-bold text-center pt-10">Previsionnel Financier</h1>
  </div>
}
export default App
```

- [ ] **Step 6: Verify dev server starts**

```bash
npm run dev
```

Expected: App opens in browser with title visible, Tailwind styles working.

- [ ] **Step 7: Verify tests run**

```bash
npx vitest run
```

Expected: Test runner works (0 tests found is OK).

- [ ] **Step 8: Commit**

```bash
git add previsionnel-app/
git commit -m "chore: scaffold Vite + React + TypeScript + Tailwind project"
```

---

### Task 2: Define TypeScript types

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Write the types file**

Copy the `Previsionnel` interface from the spec (lines 222-305 of the design doc), plus add helper types:

```typescript
export type TypeActivite = 'vente_bic' | 'services_bic' | 'liberale_cipav' | 'liberale_bnc_ssi';
export type StatutJuridique = 'micro' | 'ei' | 'eurl' | 'sarl' | 'sasu' | 'sas';
export type TypeGerance = 'majoritaire' | 'minoritaire';

export interface Projet {
  nomPorteur: string;
  nomSociete: string;
  dateCreationEnvisagee: string;
  activitePrincipale: string;
  typeActivite: TypeActivite;
  adresse: string;
  descriptionOffre: string;
  descriptionMarche: string;
  strategie: string;
  experience: string;
  competences: string;
  motivations: string;
}

export interface Statut {
  statutJuridique: StatutJuridique;
  typeGerance?: TypeGerance;
  versementLiberatoire?: boolean;
}

export interface Offre {
  id: string;
  nom: string;
  prixUnitaireHT: number;
  delaiPaiementMois: number;
  acomptePourcent: number;
  tauxTVA: number;
}

export interface Investissement {
  description: string;
  montant: number;
  trimestre: number;
  annee: number;
  dureeAmortissement: number;
}

export interface Emprunt {
  description: string;
  montant: number;
  dureeMois: number;
  tauxAnnuel: number;
}

export interface Financements {
  capital: number;
  apports: number;
  emprunts: Emprunt[];
  subventions: number;
}

export interface ChargeFix {
  description: string;
  montantAnnuel: number;
  evolutionAn2: number;
  evolutionAn3: number;
}

export interface ChargeVariable {
  offreId: string;
  description: string;
  coutUnitaire: number;
}

export interface RemunerationDirigeant {
  salaireBrutAnnuel: number;
  augmentationAnnuelle: number;
  partRevenusRetires?: number;
}

export interface Salarie {
  poste: string;
  salaireBrutAnnuel: number;
  dateEmbauche: { trimestre: number; annee: number };
  augmentationAnnuelle: number;
}

export interface Previsionnel {
  version: number;
  dateCreation: string;
  dateDerniereModification: string;
  etapeCourante: number;
  projet: Projet;
  statut: Statut;
  offres: Offre[];
  investissements: Investissement[];
  financements: Financements;
  ventes: Record<string, number[]>;
  chargesFixes: ChargeFix[];
  chargesVariables: ChargeVariable[];
  remunerationDirigeant: RemunerationDirigeant;
  salaries: Salarie[];
}

// Calculated results for Step 8 / Exports
export interface ResultatAnnuel {
  annee: number;
  chiffreAffairesHT: number;
  chargesVariablesTotal: number;
  margeBrute: number;
  chargesExternesTotal: number;
  chargesPersonnelTotal: number;
  cotisationsDirigeant: number;
  ebe: number; // Excedent Brut d'Exploitation
  dotationsAmortissements: number;
  resultatExploitation: number;
  chargesFinancieres: number; // interets emprunt
  resultatAvantImpot: number;
  impot: number;
  resultatNet: number;
}

export interface TresorerieMensuelle {
  mois: number; // 0-35
  tresorerieDebut: number;
  encaissements: number;
  decaissementsCharges: number;
  decaissementsPersonnel: number;
  decaissementsInvestissements: number;
  remboursementsEmprunts: number;
  financementsRecus: number;
  tresorerieFin: number;
}

export interface IndicateursClés {
  pointMortEuros: number[];   // par annee
  pointMortMois: number | null; // mois ou l'activite devient rentable
  ratioDetteCapital: number[];
  ratioDetteResultat: number[];
}

export interface Synthese {
  resultatsAnnuels: ResultatAnnuel[];
  tresorerie: TresorerieMensuelle[];
  indicateurs: IndicateursClés;
  alertes: string[];
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/
git commit -m "feat: define TypeScript data model interfaces"
```

---

### Task 3: Write baremes and config files

**Files:**
- Create: `src/config/baremes.ts`
- Create: `src/config/statuts.ts`
- Create: `src/config/charges-suggestions.ts`

- [ ] **Step 1: Write baremes.ts with all 2026 rates**

```typescript
export const BAREMES = {
  annee: 2026,

  // Cotisations sociales micro-entreprise (% du CA)
  cotisationsMicro: {
    vente_bic: 0.123,
    services_bic: 0.212,
    liberale_cipav: 0.232,
    liberale_bnc_ssi: 0.256,
  },

  // Versement liberatoire (% du CA)
  versementLiberatoire: {
    vente_bic: 0.01,
    services_bic: 0.017,
    liberale_cipav: 0.022,
    liberale_bnc_ssi: 0.022,
  },

  // Cotisations autres statuts (% de la remuneration ou benefice)
  cotisationsEI: 0.45,
  cotisationsGerantMajoritaire: 0.45,
  cotisationsGerantMinoritaire: 0.65,  // patronal + salarial
  cotisationsSASU_patronal: 0.54,      // % du brut
  cotisationsSASU_salarial: 0.28,      // % du brut

  // Cotisations salaries (pour embauches)
  cotisationsSalarie_patronal: 0.45,
  cotisationsSalarie_salarial: 0.22,

  // TVA franchise en base (micro)
  tvaFranchise: {
    services: { seuilBase: 37500, seuilMajore: 41250 },
    vente: { seuilBase: 85000, seuilMajore: 93500 },
  },

  // Plafonds CA micro
  plafondsMicro: {
    services: 77700,   // services + liberal
    vente: 188700,
  },

  // Abattement forfaitaire micro (pour IR)
  abattementMicro: {
    vente_bic: 0.71,
    services_bic: 0.50,
    liberale_cipav: 0.34,
    liberale_bnc_ssi: 0.34,
  },

  // IS
  is: {
    tauxReduit: 0.15,
    seuilReduit: 42500,
    tauxNormal: 0.25,
  },

  // IR bareme progressif (1 part)
  irTranches: [
    { limite: 11294, taux: 0 },
    { limite: 28797, taux: 0.11 },
    { limite: 82341, taux: 0.30 },
    { limite: 177106, taux: 0.41 },
    { limite: Infinity, taux: 0.45 },
  ],

  // Flat tax dividendes
  flatTax: 0.314,

  // TVA standard
  tauxTVA: 0.20,
} as const;
```

- [ ] **Step 2: Write statuts.ts with UI descriptions**

```typescript
import { StatutJuridique } from '../types';

export interface StatutInfo {
  id: StatutJuridique;
  nom: string;
  resumeCourt: string;
  description: string;
  avantages: string[];
  inconvenients: string[];
  idealPour: string;
}

export const STATUTS: StatutInfo[] = [
  {
    id: 'micro',
    nom: 'Micro-entreprise',
    resumeCourt: 'Simple et rapide pour demarrer',
    description: 'Regime simplifie avec peu de formalites. Cotisations calculees sur le chiffre d\'affaires, pas de TVA en dessous des seuils.',
    avantages: ['Comptabilite simplifiee', 'Pas de TVA (sous seuils)', 'Charges proportionnelles au CA'],
    inconvenients: ['Plafond de CA', 'Charges non deductibles', 'Pas de dividendes'],
    idealPour: 'Demarrer seul avec peu d\'investissements',
  },
  {
    id: 'ei',
    nom: 'Entreprise Individuelle',
    resumeCourt: 'Seul avec charges deductibles',
    description: 'Statut individuel avec possibilite de deduire vos charges. Imposition a l\'IR sur le benefice.',
    avantages: ['Charges deductibles', 'Pas de plafond CA', 'Simplicite de gestion'],
    inconvenients: ['Cotisations sur benefice (~45%)', 'IR progressif', 'Pas de dividendes'],
    idealPour: 'Activite individuelle avec des charges significatives',
  },
  {
    id: 'eurl',
    nom: 'EURL',
    resumeCourt: 'Societe a associe unique',
    description: 'Societe a responsabilite limitee avec un seul associe. Regime IS par defaut, possibilite de dividendes.',
    avantages: ['Responsabilite limitee', 'IS avantageux', 'Dividendes possibles'],
    inconvenients: ['Formalites de creation', 'Comptabilite plus complexe'],
    idealPour: 'Entrepreneur seul souhaitant une societe',
  },
  {
    id: 'sarl',
    nom: 'SARL',
    resumeCourt: 'Societe a plusieurs associes',
    description: 'Societe a responsabilite limitee avec plusieurs associes. Regime IS, gerant majoritaire ou minoritaire.',
    avantages: ['Responsabilite limitee', 'Plusieurs associes', 'IS avantageux'],
    inconvenients: ['Formalites de creation', 'Rigidite des statuts'],
    idealPour: 'Projet a plusieurs associes avec cadre structure',
  },
  {
    id: 'sasu',
    nom: 'SASU',
    resumeCourt: 'Societe flexible a associe unique',
    description: 'Societe par actions simplifiee a associe unique. Le president est assimile salarie.',
    avantages: ['Grande flexibilite', 'Protection sociale president', 'Dividendes flat tax'],
    inconvenients: ['Charges sociales elevees sur salaire', 'Formalites de creation'],
    idealPour: 'Entrepreneur seul qui veut une societe flexible',
  },
  {
    id: 'sas',
    nom: 'SAS',
    resumeCourt: 'Societe flexible a plusieurs associes',
    description: 'Societe par actions simplifiee avec plusieurs associes. Grande liberte statutaire.',
    avantages: ['Grande flexibilite', 'Plusieurs associes', 'Dividendes flat tax'],
    inconvenients: ['Charges sociales elevees', 'Formalites de creation'],
    idealPour: 'Projet ambitieux a plusieurs associes',
  },
];
```

- [ ] **Step 3: Write charges-suggestions.ts**

```typescript
import { ChargeFix } from '../types';

export const CHARGES_SUGGESTIONS: Omit<ChargeFix, 'evolutionAn2' | 'evolutionAn3'>[] = [
  { description: 'Loyer et charges locatives', montantAnnuel: 0 },
  { description: 'Eau et electricite', montantAnnuel: 0 },
  { description: 'Assurance professionnelle', montantAnnuel: 0 },
  { description: 'Telephonie et internet', montantAnnuel: 0 },
  { description: 'Logiciels et abonnements', montantAnnuel: 0 },
  { description: 'Marketing et publicite', montantAnnuel: 0 },
  { description: 'Honoraires (comptable, avocat)', montantAnnuel: 0 },
  { description: 'Frais bancaires', montantAnnuel: 0 },
  { description: 'Frais de deplacement', montantAnnuel: 0 },
  { description: 'Fournitures et petit materiel', montantAnnuel: 0 },
];
```

- [ ] **Step 4: Commit**

```bash
git add src/config/
git commit -m "feat: add baremes 2026, legal status descriptions, and charge suggestions"
```

---

### Task 4: Write defaults factory and storage utils

**Files:**
- Create: `src/utils/defaults.ts`
- Create: `src/utils/storage.ts`
- Create: `src/__tests__/utils/storage.test.ts`

- [ ] **Step 1: Write defaults.ts**

```typescript
import { Previsionnel } from '../types';
import { CHARGES_SUGGESTIONS } from '../config/charges-suggestions';

export function createEmptyPrevisionnel(): Previsionnel {
  return {
    version: 1,
    dateCreation: new Date().toISOString(),
    dateDerniereModification: new Date().toISOString(),
    etapeCourante: 1,
    projet: {
      nomPorteur: '',
      nomSociete: '',
      dateCreationEnvisagee: '',
      activitePrincipale: '',
      typeActivite: 'services_bic',
      adresse: '',
      descriptionOffre: '',
      descriptionMarche: '',
      strategie: '',
      experience: '',
      competences: '',
      motivations: '',
    },
    statut: {
      statutJuridique: 'micro',
    },
    offres: [],
    investissements: [],
    financements: {
      capital: 0,
      apports: 0,
      emprunts: [],
      subventions: 0,
    },
    ventes: {},
    chargesFixes: CHARGES_SUGGESTIONS.map(s => ({
      ...s,
      evolutionAn2: 0,
      evolutionAn3: 0,
    })),
    chargesVariables: [],
    remunerationDirigeant: {
      salaireBrutAnnuel: 0,
      augmentationAnnuelle: 0,
      partRevenusRetires: 100,
    },
    salaries: [],
  };
}
```

- [ ] **Step 2: Write the failing test for storage**

```typescript
// src/__tests__/utils/storage.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveTolocalStorage, loadFromLocalStorage, exportToFile, importFromFile, STORAGE_KEY } from '../../utils/storage';
import { createEmptyPrevisionnel } from '../../utils/defaults';

beforeEach(() => {
  localStorage.clear();
});

describe('saveTolocalStorage', () => {
  it('saves previsionnel to localStorage', () => {
    const data = createEmptyPrevisionnel();
    saveTolocalStorage(data);
    const stored = localStorage.getItem(STORAGE_KEY);
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!).version).toBe(1);
  });
});

describe('loadFromLocalStorage', () => {
  it('returns null when nothing saved', () => {
    expect(loadFromLocalStorage()).toBeNull();
  });

  it('returns data when valid', () => {
    const data = createEmptyPrevisionnel();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    const loaded = loadFromLocalStorage();
    expect(loaded).not.toBeNull();
    expect(loaded!.version).toBe(1);
  });

  it('returns null on corrupted data', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json{{{');
    expect(loadFromLocalStorage()).toBeNull();
  });
});

describe('exportToFile', () => {
  it('generates filename with porteur name and date', () => {
    const data = createEmptyPrevisionnel();
    data.projet.nomPorteur = 'Jean Dupont';
    const { filename } = exportToFile(data);
    expect(filename).toMatch(/^Previsionnel-Jean-Dupont-\d{4}-\d{2}-\d{2}\.previsionnel$/);
  });
});

describe('importFromFile', () => {
  it('parses valid file content', () => {
    const data = createEmptyPrevisionnel();
    const json = JSON.stringify(data);
    const result = importFromFile(json);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.version).toBe(1);
  });

  it('rejects invalid JSON', () => {
    const result = importFromFile('not-json');
    expect(result.success).toBe(false);
  });

  it('rejects data without version field', () => {
    const result = importFromFile(JSON.stringify({ foo: 'bar' }));
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
npx vitest run src/__tests__/utils/storage.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 4: Implement storage.ts**

```typescript
import { Previsionnel } from '../types';

export const STORAGE_KEY = 'serenity-previsionnel';

export function saveTolocalStorage(data: Previsionnel): void {
  const toSave = { ...data, dateDerniereModification: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
}

export function loadFromLocalStorage(): Previsionnel | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.version) return null;
    return parsed as Previsionnel;
  } catch {
    return null;
  }
}

export function clearLocalStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportToFile(data: Previsionnel): { filename: string; content: string } {
  const name = data.projet.nomPorteur
    ? data.projet.nomPorteur.replace(/\s+/g, '-')
    : 'SansNom';
  const date = new Date().toISOString().slice(0, 10);
  return {
    filename: `Previsionnel-${name}-${date}.previsionnel`,
    content: JSON.stringify(data, null, 2),
  };
}

export function importFromFile(content: string): { success: true; data: Previsionnel } | { success: false; error: string } {
  try {
    const parsed = JSON.parse(content);
    if (!parsed.version) {
      return { success: false, error: 'Fichier invalide : pas de version.' };
    }
    return { success: true, data: parsed as Previsionnel };
  } catch {
    return { success: false, error: 'Le fichier est illisible. Verifiez qu\'il s\'agit bien d\'un fichier .previsionnel.' };
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npx vitest run src/__tests__/utils/storage.test.ts
```

Expected: All PASS.

- [ ] **Step 6: Commit**

```bash
git add src/utils/defaults.ts src/utils/storage.ts src/__tests__/utils/storage.test.ts
git commit -m "feat: add storage utils (localStorage + file import/export)"
```

---

## Phase 2: Calculation Engine (TDD)

### Task 5: Loan amortization calculator

**Files:**
- Create: `src/utils/calculs-emprunt.ts`
- Create: `src/__tests__/utils/calculs-emprunt.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { calculerTableauEmprunt } from '../../utils/calculs-emprunt';

describe('calculerTableauEmprunt', () => {
  it('returns empty array for zero amount', () => {
    expect(calculerTableauEmprunt({ description: '', montant: 0, dureeMois: 12, tauxAnnuel: 0.05 })).toEqual([]);
  });

  it('computes correct total repayment', () => {
    const tableau = calculerTableauEmprunt({ description: 'Pret', montant: 6500, dureeMois: 60, tauxAnnuel: 0.05 });
    expect(tableau).toHaveLength(60);
    const totalCapital = tableau.reduce((s, m) => s + m.capital, 0);
    expect(totalCapital).toBeCloseTo(6500, 0);
  });

  it('first payment has more interest than last', () => {
    const tableau = calculerTableauEmprunt({ description: 'Pret', montant: 10000, dureeMois: 36, tauxAnnuel: 0.06 });
    expect(tableau[0].interets).toBeGreaterThan(tableau[35].interets);
  });

  it('monthly payment is constant', () => {
    const tableau = calculerTableauEmprunt({ description: 'Pret', montant: 10000, dureeMois: 24, tauxAnnuel: 0.04 });
    const mensualite = tableau[0].mensualite;
    tableau.forEach(m => expect(m.mensualite).toBeCloseTo(mensualite, 2));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/__tests__/utils/calculs-emprunt.test.ts
```

- [ ] **Step 3: Implement calculs-emprunt.ts**

```typescript
import { Emprunt } from '../types';

export interface MensualiteEmprunt {
  mois: number;
  mensualite: number;
  capital: number;
  interets: number;
  capitalRestantDu: number;
}

export function calculerTableauEmprunt(emprunt: Emprunt): MensualiteEmprunt[] {
  if (emprunt.montant === 0) return [];

  const { montant, dureeMois, tauxAnnuel } = emprunt;
  const tauxMensuel = tauxAnnuel / 12;

  let mensualite: number;
  if (tauxMensuel === 0) {
    mensualite = montant / dureeMois;
  } else {
    mensualite = montant * (tauxMensuel * Math.pow(1 + tauxMensuel, dureeMois)) /
      (Math.pow(1 + tauxMensuel, dureeMois) - 1);
  }

  const tableau: MensualiteEmprunt[] = [];
  let capitalRestant = montant;

  for (let i = 0; i < dureeMois; i++) {
    const interets = capitalRestant * tauxMensuel;
    const capital = mensualite - interets;
    capitalRestant -= capital;
    tableau.push({
      mois: i,
      mensualite: Math.round(mensualite * 100) / 100,
      capital: Math.round(capital * 100) / 100,
      interets: Math.round(interets * 100) / 100,
      capitalRestantDu: Math.max(0, Math.round(capitalRestant * 100) / 100),
    });
  }
  return tableau;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/__tests__/utils/calculs-emprunt.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/utils/calculs-emprunt.ts src/__tests__/utils/calculs-emprunt.test.ts
git commit -m "feat: add loan amortization calculator with TDD"
```

---

### Task 6: Investment depreciation calculator

**Files:**
- Create: `src/utils/calculs-amortissement.ts`
- Create: `src/__tests__/utils/calculs-amortissement.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { calculerAmortissements } from '../../utils/calculs-amortissement';
import { Investissement } from '../../types';

describe('calculerAmortissements', () => {
  it('returns [0, 0, 0] for empty investments', () => {
    expect(calculerAmortissements([])).toEqual([0, 0, 0]);
  });

  it('computes linear depreciation over 3 years (Q1 start = full year)', () => {
    const inv: Investissement[] = [
      { description: 'PC', montant: 3000, trimestre: 1, annee: 1, dureeAmortissement: 3 },
    ];
    const result = calculerAmortissements(inv);
    expect(result[0]).toBe(1000); // year 1: full year (Q1)
    expect(result[1]).toBe(1000); // year 2
    expect(result[2]).toBe(1000); // year 3
  });

  it('applies prorata temporis for Q3 start', () => {
    const inv: Investissement[] = [
      { description: 'PC', montant: 3600, trimestre: 3, annee: 1, dureeAmortissement: 3 },
    ];
    const result = calculerAmortissements(inv);
    // 3600 / 3 = 1200/year, Q3 start = 6 months remaining = 600 for year 1
    expect(result[0]).toBe(600);
    expect(result[1]).toBe(1200); // full year 2
    expect(result[2]).toBe(1200); // full year 3
  });

  it('handles investment starting in year 2', () => {
    const inv: Investissement[] = [
      { description: 'Vehicule', montant: 5000, trimestre: 1, annee: 2, dureeAmortissement: 5 },
    ];
    const result = calculerAmortissements(inv);
    expect(result[0]).toBe(0);    // year 1: nothing
    expect(result[1]).toBe(1000); // year 2
    expect(result[2]).toBe(1000); // year 3
  });

  it('sums multiple investments', () => {
    const inv: Investissement[] = [
      { description: 'PC', montant: 3000, trimestre: 1, annee: 1, dureeAmortissement: 3 },
      { description: 'Bureau', montant: 6000, trimestre: 1, annee: 1, dureeAmortissement: 6 },
    ];
    const result = calculerAmortissements(inv);
    expect(result[0]).toBe(2000); // 1000 + 1000
    expect(result[1]).toBe(2000);
    expect(result[2]).toBe(2000);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/__tests__/utils/calculs-amortissement.test.ts
```

- [ ] **Step 3: Implement calculs-amortissement.ts**

Uses linear depreciation (amortissement lineaire) with prorata temporis for the first year based on the quarter the investment starts. Returns dotations for each of the 3 forecast years.

```typescript
import { Investissement } from '../types';

/** Returns [year1, year2, year3] depreciation amounts */
export function calculerAmortissements(investissements: Investissement[]): [number, number, number] {
  const dotations: [number, number, number] = [0, 0, 0];

  for (const inv of investissements) {
    const dotationAnnuelle = inv.montant / inv.dureeAmortissement;
    // Prorata temporis: months remaining in the first year based on quarter
    const moisRestantsPremAnnee = 12 - (inv.trimestre - 1) * 3;
    const prorataPremiereAnnee = moisRestantsPremAnnee / 12;

    for (let annee = inv.annee; annee <= 3; annee++) {
      const anneesEcoulees = annee - inv.annee;
      if (anneesEcoulees >= inv.dureeAmortissement) continue; // fully depreciated

      let dotation = dotationAnnuelle;
      if (annee === inv.annee) {
        dotation = dotationAnnuelle * prorataPremiereAnnee;
      }
      dotations[annee - 1] += Math.round(dotation * 100) / 100;
    }
  }

  return dotations;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/__tests__/utils/calculs-amortissement.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/utils/calculs-amortissement.ts src/__tests__/utils/calculs-amortissement.test.ts
git commit -m "feat: add investment depreciation calculator"
```

---

### Task 7: Social contributions calculator

**Files:**
- Create: `src/utils/calculs-cotisations.ts`
- Create: `src/__tests__/utils/calculs-cotisations.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { calculerCotisationsDirigeant } from '../../utils/calculs-cotisations';
import { Statut, TypeActivite } from '../../types';

describe('calculerCotisationsDirigeant', () => {
  it('micro vente_bic: 12.3% of CA', () => {
    const statut: Statut = { statutJuridique: 'micro' };
    expect(calculerCotisationsDirigeant(statut, 'vente_bic', 100000, 0)).toBeCloseTo(12300);
  });

  it('micro services_bic: 21.2% of CA', () => {
    const statut: Statut = { statutJuridique: 'micro' };
    expect(calculerCotisationsDirigeant(statut, 'services_bic', 50000, 0)).toBeCloseTo(10600);
  });

  it('micro liberale_bnc_ssi: 25.6% of CA', () => {
    const statut: Statut = { statutJuridique: 'micro' };
    expect(calculerCotisationsDirigeant(statut, 'liberale_bnc_ssi', 40000, 0)).toBeCloseTo(10240);
  });

  it('EI: 45% of benefit', () => {
    const statut: Statut = { statutJuridique: 'ei' };
    // benefice = 0 (not used for EI), salaire brut = 30000
    // For EI, cotisations are on the benefice, passed as CA param
    expect(calculerCotisationsDirigeant(statut, 'services_bic', 30000, 0)).toBeCloseTo(13500);
  });

  it('SASU: ~82% of net = patronal + salarial on brut', () => {
    const statut: Statut = { statutJuridique: 'sasu' };
    // salaireBrut = 45000, patronal 54% + salarial 28% = 82% of brut
    const result = calculerCotisationsDirigeant(statut, 'services_bic', 0, 45000);
    expect(result).toBeCloseTo(45000 * 0.82, -1); // ~36900
  });

  it('SARL gerant majoritaire: 45%', () => {
    const statut: Statut = { statutJuridique: 'sarl', typeGerance: 'majoritaire' };
    expect(calculerCotisationsDirigeant(statut, 'services_bic', 0, 40000)).toBeCloseTo(18000);
  });

  it('SARL gerant minoritaire: 65%', () => {
    const statut: Statut = { statutJuridique: 'sarl', typeGerance: 'minoritaire' };
    expect(calculerCotisationsDirigeant(statut, 'services_bic', 0, 40000)).toBeCloseTo(26000);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/__tests__/utils/calculs-cotisations.test.ts
```

- [ ] **Step 3: Implement calculs-cotisations.ts**

```typescript
import { Statut, TypeActivite } from '../types';
import { BAREMES } from '../config/baremes';

/**
 * Calculate director social contributions for one year.
 * @param statut - Legal status
 * @param typeActivite - Activity type
 * @param baseCA - Annual CA (used for micro-entreprise)
 * @param salaireBrut - Annual gross salary (used for EI, EURL, SARL, SASU, SAS)
 */
export function calculerCotisationsDirigeant(
  statut: Statut,
  typeActivite: TypeActivite,
  baseCA: number,
  salaireBrut: number,
): number {
  switch (statut.statutJuridique) {
    case 'micro':
      return baseCA * BAREMES.cotisationsMicro[typeActivite];

    case 'ei':
      return baseCA * BAREMES.cotisationsEI; // baseCA = benefice for EI

    case 'eurl':
    case 'sarl': {
      const taux = statut.typeGerance === 'minoritaire'
        ? BAREMES.cotisationsGerantMinoritaire
        : BAREMES.cotisationsGerantMajoritaire;
      return salaireBrut * taux;
    }

    case 'sasu':
    case 'sas':
      return salaireBrut * (BAREMES.cotisationsSASU_patronal + BAREMES.cotisationsSASU_salarial);

    default:
      return 0;
  }
}

/** Calculate employer cost for a salaried employee */
export function calculerCoutEmployeur(salaireBrut: number): number {
  return salaireBrut * (1 + BAREMES.cotisationsSalarie_patronal);
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/__tests__/utils/calculs-cotisations.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/utils/calculs-cotisations.ts src/__tests__/utils/calculs-cotisations.test.ts
git commit -m "feat: add social contributions calculator per legal status"
```

---

### Task 8: Tax calculator (IS + IR + versement liberatoire)

**Files:**
- Create: `src/utils/calculs-impots.ts`
- Create: `src/__tests__/utils/calculs-impots.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { calculerIS, calculerIR, calculerImpotMicro } from '../../utils/calculs-impots';

describe('calculerIS', () => {
  it('applies 15% up to 42500', () => {
    expect(calculerIS(42500)).toBeCloseTo(6375);
  });

  it('applies 25% above 42500', () => {
    expect(calculerIS(100000)).toBeCloseTo(6375 + (100000 - 42500) * 0.25);
  });

  it('returns 0 for negative result', () => {
    expect(calculerIS(-5000)).toBe(0);
  });
});

describe('calculerIR', () => {
  it('returns 0 below first bracket', () => {
    expect(calculerIR(10000)).toBe(0);
  });

  it('applies progressive brackets', () => {
    // 20000: 0 on first 11294, 11% on 8706 = 957.66
    expect(calculerIR(20000)).toBeCloseTo(957.66, 0);
  });

  it('handles high income with multiple brackets', () => {
    const result = calculerIR(100000);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(100000 * 0.45);
  });
});

describe('calculerImpotMicro', () => {
  it('with versement liberatoire: flat rate on CA', () => {
    expect(calculerImpotMicro(50000, 'services_bic', true)).toBeCloseTo(850); // 1.7%
  });

  it('without versement liberatoire: IR after abattement', () => {
    // CA 50000, services_bic abattement 50% -> revenu imposable 25000
    // IR on 25000: 0 on 11294 + 11% on 13706 = 1507.66
    const result = calculerImpotMicro(50000, 'services_bic', false);
    expect(result).toBeCloseTo(1507.66, 0);
  });

  it('vente_bic with versement liberatoire: 1%', () => {
    expect(calculerImpotMicro(100000, 'vente_bic', true)).toBeCloseTo(1000);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/__tests__/utils/calculs-impots.test.ts
```

- [ ] **Step 3: Implement calculs-impots.ts**

```typescript
import { TypeActivite } from '../types';
import { BAREMES } from '../config/baremes';

export function calculerIS(resultatAvantImpot: number): number {
  if (resultatAvantImpot <= 0) return 0;
  if (resultatAvantImpot <= BAREMES.is.seuilReduit) {
    return resultatAvantImpot * BAREMES.is.tauxReduit;
  }
  return BAREMES.is.seuilReduit * BAREMES.is.tauxReduit +
    (resultatAvantImpot - BAREMES.is.seuilReduit) * BAREMES.is.tauxNormal;
}

export function calculerIR(revenuImposable: number): number {
  if (revenuImposable <= 0) return 0;
  let impot = 0;
  let restant = revenuImposable;
  let limitePrec = 0;

  for (const tranche of BAREMES.irTranches) {
    const assiette = Math.min(restant, tranche.limite - limitePrec);
    if (assiette <= 0) break;
    impot += assiette * tranche.taux;
    restant -= assiette;
    limitePrec = tranche.limite;
  }

  return Math.round(impot * 100) / 100;
}

export function calculerImpotMicro(
  ca: number,
  typeActivite: TypeActivite,
  versementLiberatoire: boolean,
): number {
  if (versementLiberatoire) {
    return ca * BAREMES.versementLiberatoire[typeActivite];
  }
  const abattement = BAREMES.abattementMicro[typeActivite];
  const revenuImposable = ca * (1 - abattement);
  return calculerIR(revenuImposable);
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/__tests__/utils/calculs-impots.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/utils/calculs-impots.ts src/__tests__/utils/calculs-impots.test.ts
git commit -m "feat: add IS, IR, and micro-entreprise tax calculators"
```

---

### Task 9: Core calculation engine (CA, synthesis, alerts)

**Files:**
- Create: `src/utils/calculs.ts`
- Create: `src/__tests__/utils/calculs.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { calculerSynthese, calculerCAMensuel, calculerChargesAnnuelles } from '../../utils/calculs';
import { createEmptyPrevisionnel } from '../../utils/defaults';
import { Previsionnel } from '../../types';

function makeTestData(): Previsionnel {
  const data = createEmptyPrevisionnel();
  data.projet.typeActivite = 'services_bic';
  data.statut = { statutJuridique: 'sasu' };
  data.offres = [
    { id: 'o1', nom: 'Coaching', prixUnitaireHT: 150, delaiPaiementMois: 0, acomptePourcent: 0, tauxTVA: 0.2 },
  ];
  // 5 sales per month for 36 months
  data.ventes = { o1: Array(36).fill(5) };
  data.chargesFixes = [
    { description: 'Loyer', montantAnnuel: 6000, evolutionAn2: 0.05, evolutionAn3: 0.05 },
  ];
  data.remunerationDirigeant = { salaireBrutAnnuel: 30000, augmentationAnnuelle: 0.05 };
  return data;
}

describe('calculerCAMensuel', () => {
  it('computes monthly CA from ventes and offres', () => {
    const data = makeTestData();
    const caMensuel = calculerCAMensuel(data);
    expect(caMensuel).toHaveLength(36);
    expect(caMensuel[0]).toBe(750); // 5 * 150
    expect(caMensuel[11]).toBe(750);
  });
});

describe('calculerChargesAnnuelles', () => {
  it('applies evolution rates for years 2 and 3', () => {
    const data = makeTestData();
    const charges = calculerChargesAnnuelles(data.chargesFixes);
    expect(charges[0]).toBe(6000);
    expect(charges[1]).toBeCloseTo(6300); // +5%
    expect(charges[2]).toBeCloseTo(6615); // +5% on 6300
  });
});

describe('calculerSynthese', () => {
  it('returns 3 annual results', () => {
    const data = makeTestData();
    const synthese = calculerSynthese(data);
    expect(synthese.resultatsAnnuels).toHaveLength(3);
  });

  it('computes positive CA for non-empty sales', () => {
    const data = makeTestData();
    const synthese = calculerSynthese(data);
    expect(synthese.resultatsAnnuels[0].chiffreAffairesHT).toBe(9000); // 750 * 12
  });

  it('returns 36 months of tresorerie', () => {
    const data = makeTestData();
    const synthese = calculerSynthese(data);
    expect(synthese.tresorerie).toHaveLength(36);
  });

  it('generates alert for negative tresorerie', () => {
    const data = makeTestData();
    data.ventes = { o1: Array(36).fill(0) }; // no sales
    data.remunerationDirigeant.salaireBrutAnnuel = 50000;
    const synthese = calculerSynthese(data);
    expect(synthese.alertes.some(a => a.includes('tresorerie'))).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/__tests__/utils/calculs.test.ts
```

- [ ] **Step 3: Implement calculs.ts**

This is the largest utility. It orchestrates all sub-calculators to produce the full `Synthese`.

```typescript
import { Previsionnel, Synthese, ResultatAnnuel, TresorerieMensuelle, IndicateursClés } from '../types';
import { calculerCotisationsDirigeant, calculerCoutEmployeur } from './calculs-cotisations';
import { calculerIS, calculerIR, calculerImpotMicro } from './calculs-impots';
import { calculerAmortissements } from './calculs-amortissement';
import { calculerTableauEmprunt } from './calculs-emprunt';
import { BAREMES } from '../config/baremes';
import { ChargeFix } from '../types';

/** Monthly CA (earned revenue) for 36 months */
export function calculerCAMensuel(data: Previsionnel): number[] {
  const ca = Array(36).fill(0);
  for (const offre of data.offres) {
    const ventes = data.ventes[offre.id] || Array(36).fill(0);
    for (let m = 0; m < 36; m++) {
      ca[m] += (ventes[m] || 0) * offre.prixUnitaireHT;
    }
  }
  return ca;
}

/** Monthly cash receipts (encaissements) accounting for payment delays and deposits */
export function calculerEncaissementsMensuels(data: Previsionnel): number[] {
  const encaissements = Array(36).fill(0);
  for (const offre of data.offres) {
    const ventes = data.ventes[offre.id] || Array(36).fill(0);
    for (let m = 0; m < 36; m++) {
      const montantTotal = (ventes[m] || 0) * offre.prixUnitaireHT;
      if (montantTotal === 0) continue;
      // Deposit received immediately
      const acompte = montantTotal * offre.acomptePourcent;
      encaissements[m] += acompte;
      // Balance received after payment delay
      const solde = montantTotal - acompte;
      const moisEncaissement = m + offre.delaiPaiementMois;
      if (moisEncaissement < 36) {
        encaissements[moisEncaissement] += solde;
      }
      // Revenue beyond 36 months is lost from the forecast
    }
  }
  return encaissements;
}

/** Monthly variable charges for 36 months */
function calculerChargesVariablesMensuelles(data: Previsionnel): number[] {
  const charges = Array(36).fill(0);
  for (const cv of data.chargesVariables) {
    const ventesOffre = data.ventes[cv.offreId] || Array(36).fill(0);
    for (let m = 0; m < 36; m++) {
      charges[m] += (ventesOffre[m] || 0) * cv.coutUnitaire;
    }
  }
  return charges;
}

/** Annual charge totals [year1, year2, year3] with evolution */
export function calculerChargesAnnuelles(chargesFixes: ChargeFix[]): [number, number, number] {
  const totals: [number, number, number] = [0, 0, 0];
  for (const charge of chargesFixes) {
    totals[0] += charge.montantAnnuel;
    totals[1] += charge.montantAnnuel * (1 + charge.evolutionAn2);
    totals[2] += charge.montantAnnuel * (1 + charge.evolutionAn2) * (1 + charge.evolutionAn3);
  }
  return totals;
}

/** Annual variable charges */
function calculerChargesVariablesAnnuelles(data: Previsionnel, caMensuel: number[]): [number, number, number] {
  const totals: [number, number, number] = [0, 0, 0];
  for (const cv of data.chargesVariables) {
    const offre = data.offres.find(o => o.id === cv.offreId);
    if (!offre) continue;
    const ventesOffre = data.ventes[cv.offreId] || Array(36).fill(0);
    for (let m = 0; m < 36; m++) {
      const annee = Math.floor(m / 12);
      totals[annee] += (ventesOffre[m] || 0) * cv.coutUnitaire;
    }
  }
  return totals;
}

/** Annual personnel costs (director + employees).
 *  For EI, cotisations are on benefice (profit), not salary.
 *  chargesAnnuelles and chargesVarAnnuelles are needed to estimate EI profit. */
function calculerPersonnelAnnuel(
  data: Previsionnel,
  caAnnuel: number[],
  chargesExtAnnuelles: [number, number, number],
  chargesVarAnnuelles: [number, number, number],
): [number, number, number] {
  const totals: [number, number, number] = [0, 0, 0];

  // Director
  for (let a = 0; a < 3; a++) {
    const salaire = data.remunerationDirigeant.salaireBrutAnnuel *
      Math.pow(1 + data.remunerationDirigeant.augmentationAnnuelle, a);

    if (data.statut.statutJuridique === 'micro') {
      // Micro: cotisations on CA, no salary
      totals[a] += calculerCotisationsDirigeant(data.statut, data.projet.typeActivite, caAnnuel[a], 0);
    } else if (data.statut.statutJuridique === 'ei') {
      // EI: cotisations are ~45% of benefice (profit).
      // Estimate profit = CA - charges externes - charges variables
      // Then cotisations = 45% of profit. This is iterative since cotisations reduce profit,
      // but we use the pre-cotisations profit as an approximation (standard practice for forecasts).
      const beneficeEstime = Math.max(0, caAnnuel[a] - chargesExtAnnuelles[a] - chargesVarAnnuelles[a]);
      const cotisations = calculerCotisationsDirigeant(data.statut, data.projet.typeActivite, beneficeEstime, 0);
      totals[a] += cotisations; // EI has no "salary" — the benefice IS the remuneration
    } else {
      totals[a] += salaire + calculerCotisationsDirigeant(data.statut, data.projet.typeActivite, 0, salaire);
    }
  }

  // Employees
  for (const sal of data.salaries) {
    for (let a = 0; a < 3; a++) {
      const anneeProjet = a + 1;
      if (anneeProjet < sal.dateEmbauche.annee) continue;
      const anneesExperience = anneeProjet - sal.dateEmbauche.annee;
      const salaire = sal.salaireBrutAnnuel * Math.pow(1 + sal.augmentationAnnuelle, anneesExperience);

      // Prorata if hired mid-year
      let prorata = 1;
      if (anneeProjet === sal.dateEmbauche.annee) {
        prorata = (5 - sal.dateEmbauche.trimestre) / 4;
      }
      totals[a] += calculerCoutEmployeur(salaire) * prorata;
    }
  }

  return totals;
}

export function calculerSynthese(data: Previsionnel): Synthese {
  const caMensuel = calculerCAMensuel(data);
  const caAnnuel = [0, 1, 2].map(a =>
    caMensuel.slice(a * 12, (a + 1) * 12).reduce((s, v) => s + v, 0)
  );

  const encaissementsMensuels = calculerEncaissementsMensuels(data);
  const chargesVarMensuelles = calculerChargesVariablesMensuelles(data);
  const chargesExternes = calculerChargesAnnuelles(data.chargesFixes);
  const chargesVariables: [number, number, number] = [0, 1, 2].map(a =>
    chargesVarMensuelles.slice(a * 12, (a + 1) * 12).reduce((s, v) => s + v, 0)
  ) as [number, number, number];
  const personnel = calculerPersonnelAnnuel(data, caAnnuel, chargesExternes, chargesVariables);
  const amortissements = calculerAmortissements(data.investissements);

  // Loan interest aggregated by year
  const interetsAnnuels: [number, number, number] = [0, 0, 0];
  const remboursementsMensuels = Array(36).fill(0);
  for (const emprunt of data.financements.emprunts) {
    const tableau = calculerTableauEmprunt(emprunt);
    for (let m = 0; m < Math.min(tableau.length, 36); m++) {
      const annee = Math.floor(m / 12);
      interetsAnnuels[annee] += tableau[m].interets;
      remboursementsMensuels[m] += tableau[m].mensualite;
    }
  }

  // Build annual results
  const resultatsAnnuels: ResultatAnnuel[] = [0, 1, 2].map(a => {
    const ca = caAnnuel[a];
    const cv = chargesVariables[a];
    const margeBrute = ca - cv;
    const ce = chargesExternes[a];
    const cp = personnel[a];
    const ebe = margeBrute - ce - cp;
    const dot = amortissements[a];
    const rex = ebe - dot;
    const cf = interetsAnnuels[a];
    const rai = rex - cf;

    let impot = 0;
    if (data.statut.statutJuridique === 'micro') {
      impot = calculerImpotMicro(ca, data.projet.typeActivite, data.statut.versementLiberatoire || false);
    } else if (data.statut.statutJuridique === 'ei') {
      impot = calculerIR(Math.max(0, rai));
    } else {
      impot = calculerIS(rai);
    }

    return {
      annee: a + 1,
      chiffreAffairesHT: ca,
      chargesVariablesTotal: cv,
      margeBrute,
      chargesExternesTotal: ce,
      chargesPersonnelTotal: cp,
      cotisationsDirigeant: 0, // included in personnel
      ebe,
      dotationsAmortissements: dot,
      resultatExploitation: rex,
      chargesFinancieres: cf,
      resultatAvantImpot: rai,
      impot,
      resultatNet: rai - impot,
    };
  });

  // Monthly cash flow
  const totalFinancements = data.financements.capital + data.financements.apports +
    data.financements.emprunts.reduce((s, e) => s + e.montant, 0) + data.financements.subventions;

  const tresorerie: TresorerieMensuelle[] = [];
  let tresoDebut = 0;

  for (let m = 0; m < 36; m++) {
    const annee = Math.floor(m / 12);
    // Use encaissements (with payment delays and deposits) instead of raw CA
    const encaissements = encaissementsMensuels[m];
    const decCharges = chargesExternes[annee] / 12;
    const decPersonnel = personnel[annee] / 12;
    const decChargesVar = chargesVarMensuelles[m]; // variable charges in treasury

    // Investments: quarterly lump sums
    let decInvest = 0;
    const trimestre = Math.floor((m % 12) / 3) + 1;
    const anneeProjet = annee + 1;
    if (m % 3 === 0) { // first month of quarter
      decInvest = data.investissements
        .filter(i => i.annee === anneeProjet && i.trimestre === trimestre)
        .reduce((s, i) => s + i.montant, 0);
    }

    // Financing: received month 0
    const financements = m === 0 ? totalFinancements : 0;

    const tresoFin = tresoDebut + financements + encaissements - decCharges - decPersonnel - decChargesVar - decInvest - remboursementsMensuels[m];

    tresorerie.push({
      mois: m,
      tresorerieDebut: Math.round(tresoDebut * 100) / 100,
      encaissements,
      decaissementsCharges: decCharges,
      decaissementsPersonnel: decPersonnel,
      decaissementsInvestissements: decInvest,
      remboursementsEmprunts: remboursementsMensuels[m],
      financementsRecus: financements,
      tresorerieFin: Math.round(tresoFin * 100) / 100,
    });

    tresoDebut = tresoFin;
  }

  // Indicators
  const pointMortEuros = resultatsAnnuels.map(r => {
    const chargesFixes = r.chargesExternesTotal + r.chargesPersonnelTotal + r.dotationsAmortissements + r.chargesFinancieres;
    if (r.chiffreAffairesHT === 0) return Infinity;
    const tauxMarge = r.margeBrute / r.chiffreAffairesHT;
    return tauxMarge > 0 ? chargesFixes / tauxMarge : Infinity;
  });

  let pointMortMois: number | null = null;
  let cumul = 0;
  for (let m = 0; m < 36; m++) {
    const annee = Math.floor(m / 12);
    cumul += caMensuel[m] - (chargesExternes[annee] + personnel[annee] + chargesVariables[annee]) / 12;
    if (cumul > 0 && pointMortMois === null) {
      pointMortMois = m + 1;
    }
  }

  const totalDette = data.financements.emprunts.reduce((s, e) => s + e.montant, 0);
  const ratioDetteCapital = resultatsAnnuels.map(() =>
    data.financements.capital > 0 ? totalDette / data.financements.capital : 0
  );
  const ratioDetteResultat = resultatsAnnuels.map(r =>
    r.resultatExploitation > 0 ? totalDette / r.resultatExploitation : 0
  );

  // Alerts
  const alertes: string[] = [];
  if (tresorerie.some(t => t.tresorerieFin < 0)) {
    const premierMoisNegatif = tresorerie.find(t => t.tresorerieFin < 0)!.mois + 1;
    alertes.push(`Attention, votre tresorerie devient negative au mois ${premierMoisNegatif}.`);
  }
  if (resultatsAnnuels.every(r => r.resultatNet < 0)) {
    alertes.push('Votre resultat net est negatif sur les 3 annees. Revoyez vos hypotheses de ventes ou de charges.');
  }
  if (ratioDetteResultat.some(r => r > 5)) {
    alertes.push('Votre ratio dette/resultat depasse 500%. Cela peut poser probleme pour obtenir un financement.');
  }

  // Micro: check CA ceiling
  if (data.statut.statutJuridique === 'micro') {
    const plafond = data.projet.typeActivite === 'vente_bic'
      ? BAREMES.plafondsMicro.vente
      : BAREMES.plafondsMicro.services;
    for (let a = 0; a < 3; a++) {
      if (caAnnuel[a] > plafond) {
        alertes.push(`Annee ${a + 1} : votre CA (${caAnnuel[a].toLocaleString('fr-FR')} EUR) depasse le plafond micro-entreprise (${plafond.toLocaleString('fr-FR')} EUR).`);
      }
    }

    // TVA franchise threshold alerts
    const tvaConfig = data.projet.typeActivite === 'vente_bic'
      ? BAREMES.tvaFranchise.vente
      : BAREMES.tvaFranchise.services;
    for (let a = 0; a < 3; a++) {
      if (caAnnuel[a] > tvaConfig.seuilMajore) {
        alertes.push(`Annee ${a + 1} : votre CA depasse le seuil majore de franchise TVA (${tvaConfig.seuilMajore.toLocaleString('fr-FR')} EUR). La TVA s'applique immediatement.`);
      } else if (caAnnuel[a] > tvaConfig.seuilBase) {
        alertes.push(`Annee ${a + 1} : votre CA depasse le seuil de base de franchise TVA (${tvaConfig.seuilBase.toLocaleString('fr-FR')} EUR). La TVA s'appliquera l'annee suivante.`);
      }
    }
  }

  // Contextual advice (positive/informational messages)
  if (pointMortMois !== null) {
    alertes.push(`Bonne nouvelle : votre point mort est atteint au mois ${pointMortMois}. C'est le moment ou votre activite devient rentable.`);
  }
  const premierAnneeRentable = resultatsAnnuels.findIndex(r => r.resultatNet > 0);
  if (premierAnneeRentable >= 0) {
    alertes.push(`Votre premiere annee avec un resultat net positif est l'annee ${premierAnneeRentable + 1}.`);
  }

  return {
    resultatsAnnuels,
    tresorerie,
    indicateurs: { pointMortEuros, pointMortMois, ratioDetteCapital, ratioDetteResultat },
    alertes,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/__tests__/utils/calculs.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/utils/calculs.ts src/__tests__/utils/calculs.test.ts
git commit -m "feat: add core calculation engine with synthesis, tresorerie, and alerts"
```

---

## Phase 3: Reusable UI Components

### Task 10: Build shared UI components

**Files:**
- Create: `src/components/ProgressBar.tsx`
- Create: `src/components/Tooltip.tsx`
- Create: `src/components/Card.tsx`
- Create: `src/components/FormField.tsx`
- Create: `src/components/AlertBanner.tsx`
- Create: `src/components/SaveReminder.tsx`
- Create: `src/components/ActionBar.tsx`
- Create: `src/components/Sidebar.tsx`

- [ ] **Step 1: Write ProgressBar.tsx**

8-step horizontal progress indicator. Props: `currentStep: number`, `completedSteps: number[]`. Each step shows number + label, highlighted if current, checkmark if completed.

```tsx
const STEP_LABELS = [
  'Mon projet', 'Mon statut', 'Mes offres', 'Investissements',
  'Mes ventes', 'Mes charges', 'Remuneration', 'Synthese'
];

interface Props {
  currentStep: number;
  onStepClick: (step: number) => void;
}

export function ProgressBar({ currentStep, onStepClick }: Props) {
  return (
    <nav className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 overflow-x-auto">
      {STEP_LABELS.map((label, i) => {
        const step = i + 1;
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;
        return (
          <button
            key={step}
            onClick={() => onStepClick(step)}
            className={`flex flex-col items-center min-w-[80px] px-2 py-1 rounded transition-colors ${
              isActive ? 'text-blue-700 font-semibold' :
              isCompleted ? 'text-green-600' : 'text-gray-400'
            }`}
          >
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm mb-1 ${
              isActive ? 'bg-blue-700 text-white' :
              isCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-100'
            }`}>
              {isCompleted ? '\u2713' : step}
            </span>
            <span className="text-xs text-center leading-tight">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 2: Write Tooltip.tsx**

"?" icon that shows explanation on hover/click.

```tsx
import { useState } from 'react';

interface Props {
  text: string;
}

export function Tooltip({ text }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-block ml-1">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 text-xs flex items-center justify-center hover:bg-blue-100 hover:text-blue-700"
        aria-label="Aide"
      >?</button>
      {open && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-white border border-gray-200 rounded-lg shadow-lg text-sm text-gray-700">
          {text}
        </div>
      )}
    </span>
  );
}
```

- [ ] **Step 3: Write Card.tsx**

Selectable card for status/activity type selection.

```tsx
interface Props {
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
  badge?: string;
}

export function Card({ selected, onClick, title, description, badge }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-4 rounded-xl border-2 transition-all ${
        selected
          ? 'border-blue-600 bg-blue-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {badge && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{badge}</span>}
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </button>
  );
}
```

- [ ] **Step 4: Write FormField.tsx**

Labeled input with optional tooltip.

```tsx
import { Tooltip } from './Tooltip';

interface Props {
  label: string;
  tooltip?: string;
  type?: 'text' | 'number' | 'date' | 'textarea';
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  suffix?: string;
}

export function FormField({ label, tooltip, type = 'text', value, onChange, placeholder, suffix }: Props) {
  const id = label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {tooltip && <Tooltip text={tooltip} />}
      </label>
      <div className="flex items-center gap-2">
        {type === 'textarea' ? (
          <textarea
            id={id}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            rows={3}
          />
        ) : (
          <input
            id={id}
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          />
        )}
        {suffix && <span className="text-sm text-gray-500 whitespace-nowrap">{suffix}</span>}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Write AlertBanner.tsx**

```tsx
interface Props {
  type: 'warning' | 'info' | 'error';
  message: string;
}

export function AlertBanner({ type, message }: Props) {
  const styles = {
    warning: 'bg-amber-50 border-amber-300 text-amber-800',
    info: 'bg-blue-50 border-blue-300 text-blue-800',
    error: 'bg-red-50 border-red-300 text-red-800',
  };
  return (
    <div className={`px-4 py-3 rounded-lg border ${styles[type]} text-sm`}>
      {message}
    </div>
  );
}
```

- [ ] **Step 6: Write SaveReminder.tsx**

Shown at step transitions.

```tsx
interface Props {
  onSave: () => void;
}

export function SaveReminder({ onSave }: Props) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center justify-between">
      <p className="text-sm text-blue-800">Pensez a sauvegarder votre travail regulierement.</p>
      <button
        onClick={onSave}
        className="text-sm font-medium text-blue-700 hover:text-blue-900 underline"
      >Sauvegarder maintenant</button>
    </div>
  );
}
```

- [ ] **Step 7: Write ActionBar.tsx**

Bottom bar with Save, Previous, Next.

```tsx
interface Props {
  currentStep: number;
  onPrevious: () => void;
  onNext: () => void;
  onSave: () => void;
  canGoNext?: boolean;
}

export function ActionBar({ currentStep, onPrevious, onNext, onSave, canGoNext = true }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between z-40">
      <button
        onClick={onSave}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
      >Sauvegarder mon travail</button>
      <div className="flex gap-3">
        {currentStep > 1 && (
          <button onClick={onPrevious} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
            Etape precedente
          </button>
        )}
        {currentStep < 8 && (
          <button
            onClick={onNext}
            disabled={!canGoNext}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
          >Etape suivante</button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Write Sidebar.tsx**

Right sidebar: status summary + live mini-synthesis.

```tsx
import { Previsionnel, Synthese } from '../types';
import { STATUTS } from '../config/statuts';

interface Props {
  data: Previsionnel;
  synthese: Synthese | null;
}

export function Sidebar({ data, synthese }: Props) {
  const statutInfo = STATUTS.find(s => s.id === data.statut.statutJuridique);

  return (
    <aside className="w-72 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto hidden lg:block">
      {statutInfo && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Votre statut</h3>
          <p className="font-medium text-gray-900">{statutInfo.nom}</p>
          <p className="text-sm text-gray-600">{statutInfo.resumeCourt}</p>
        </div>
      )}
      {synthese && synthese.resultatsAnnuels.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Apercu annee 1</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">CA</span>
              <span className="font-medium">{synthese.resultatsAnnuels[0].chiffreAffairesHT.toLocaleString('fr-FR')} EUR</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Charges</span>
              <span className="font-medium">{(synthese.resultatsAnnuels[0].chargesExternesTotal + synthese.resultatsAnnuels[0].chargesPersonnelTotal).toLocaleString('fr-FR')} EUR</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-600">Resultat net</span>
              <span className={`font-semibold ${synthese.resultatsAnnuels[0].resultatNet >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                {synthese.resultatsAnnuels[0].resultatNet.toLocaleString('fr-FR')} EUR
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
```

- [ ] **Step 9: Verify app still builds**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 10: Commit**

```bash
git add src/components/
git commit -m "feat: add all shared UI components (ProgressBar, Tooltip, Card, FormField, AlertBanner, SaveReminder, ActionBar, Sidebar)"
```

---

## Phase 4: Wizard Steps

### Task 11: Welcome screen + tutorial

**Files:**
- Create: `src/components/WelcomeScreen.tsx`
- Create: `src/components/Tutorial.tsx`

- [ ] **Step 1: Write Tutorial.tsx**

3-screen overlay explaining the app and save mechanism.

```tsx
import { useState } from 'react';

const SCREENS = [
  {
    title: 'Bienvenue dans votre previsionnel financier',
    body: 'Cet outil va vous guider pas a pas pour construire votre previsionnel financier sur 3 ans. Il suffit de repondre aux questions, etape par etape.',
  },
  {
    title: 'Comment ca marche ?',
    body: 'Vous avancez a votre rythme dans 8 etapes simples. A chaque etape, remplissez les informations demandees. Les calculs se font automatiquement. Vous pouvez revenir en arriere a tout moment.',
  },
  {
    title: 'Sauvegardez votre travail',
    body: 'Votre travail est enregistre automatiquement dans votre navigateur. Mais pour ne pas le perdre, cliquez regulierement sur "Sauvegarder mon travail" en bas de page. Un fichier sera telecharge sur votre ordinateur. Vous pourrez le recharger plus tard pour reprendre ou vous en etiez.',
  },
];

interface Props { onComplete: () => void }

export function Tutorial({ onComplete }: Props) {
  const [screen, setScreen] = useState(0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 p-8">
        <div className="flex gap-2 mb-6 justify-center">
          {SCREENS.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i === screen ? 'bg-blue-600' : 'bg-gray-300'}`} />
          ))}
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-3">{SCREENS[screen].title}</h2>
        <p className="text-gray-600 mb-8 leading-relaxed">{SCREENS[screen].body}</p>
        <div className="flex justify-between">
          <button
            onClick={onComplete}
            className="text-sm text-gray-500 hover:text-gray-700"
          >Passer</button>
          <button
            onClick={() => screen < SCREENS.length - 1 ? setScreen(screen + 1) : onComplete()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >{screen < SCREENS.length - 1 ? 'Suivant' : 'Commencer'}</button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write WelcomeScreen.tsx**

```tsx
interface Props {
  hasExistingData: boolean;
  onNew: () => void;
  onResume: () => void;
  onImport: (file: File) => void;
}

export function WelcomeScreen({ hasExistingData, onNew, onResume, onImport }: Props) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImport(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Previsionnel Financier</h1>
          <p className="text-gray-600">Serenity Institut</p>
        </div>
        <div className="space-y-4">
          <button
            onClick={onNew}
            className="w-full p-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-lg shadow-sm"
          >Commencer un nouveau previsionnel</button>

          {hasExistingData && (
            <button
              onClick={onResume}
              className="w-full p-4 bg-white border-2 border-blue-200 text-blue-700 rounded-xl hover:bg-blue-50 font-medium"
            >Reprendre mon travail</button>
          )}

          <label className="block w-full p-4 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer text-center">
            <span className="font-medium text-gray-700">Charger un fichier sauvegarde</span>
            <input type="file" accept=".previsionnel" onChange={handleFileChange} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/WelcomeScreen.tsx src/components/Tutorial.tsx
git commit -m "feat: add welcome screen and 3-step tutorial overlay"
```

---

### Task 12: App.tsx wizard orchestrator

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Implement App.tsx with wizard state management**

App.tsx manages: current screen (welcome/wizard), current step, Previsionnel data state, auto-save, and file import/export. Renders ProgressBar, current step component, Sidebar, ActionBar.

```tsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Previsionnel, Synthese } from './types';
import { createEmptyPrevisionnel } from './utils/defaults';
import { saveTolocalStorage, loadFromLocalStorage, exportToFile, importFromFile, clearLocalStorage } from './utils/storage';
import { calculerSynthese } from './utils/calculs';
import { ProgressBar } from './components/ProgressBar';
import { ActionBar } from './components/ActionBar';
import { Sidebar } from './components/Sidebar';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Tutorial } from './components/Tutorial';
import { SaveReminder } from './components/SaveReminder';
import { Step1Project } from './steps/Step1Project';
import { Step2Statut } from './steps/Step2Statut';
import { Step3Offres } from './steps/Step3Offres';
import { Step4Investissements } from './steps/Step4Investissements';
import { Step5Ventes } from './steps/Step5Ventes';
import { Step6Charges } from './steps/Step6Charges';
import { Step7Remuneration } from './steps/Step7Remuneration';
import { Step8Synthese } from './steps/Step8Synthese';

type Screen = 'welcome' | 'tutorial' | 'wizard';

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [data, setData] = useState<Previsionnel>(createEmptyPrevisionnel);
  const [showSaveReminder, setShowSaveReminder] = useState(false);

  const hasExistingData = useMemo(() => loadFromLocalStorage() !== null, []);

  // Auto-save to localStorage on data change
  useEffect(() => {
    if (screen === 'wizard') saveTolocalStorage(data);
  }, [data, screen]);

  // Compute synthesis (memoized)
  const synthese = useMemo<Synthese | null>(() => {
    if (data.offres.length === 0) return null;
    try { return calculerSynthese(data); } catch { return null; }
  }, [data]);

  const updateData = useCallback((partial: Partial<Previsionnel>) => {
    setData(prev => ({ ...prev, ...partial }));
  }, []);

  const handleNew = () => {
    setData(createEmptyPrevisionnel());
    clearLocalStorage();
    setScreen('tutorial');
  };

  const handleResume = () => {
    const saved = loadFromLocalStorage();
    if (saved) setData(saved);
    setScreen('wizard');
  };

  const handleImport = async (file: File) => {
    const text = await file.text();
    const result = importFromFile(text);
    if (result.success) {
      setData(result.data);
      setScreen('wizard');
    } else {
      alert(result.error);
    }
  };

  const handleSave = () => {
    const { filename, content } = exportToFile(data);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setShowSaveReminder(false);
  };

  const goToStep = (step: number) => {
    setShowSaveReminder(true);
    updateData({ etapeCourante: step });
    setTimeout(() => setShowSaveReminder(false), 5000);
  };

  if (screen === 'welcome') {
    return <WelcomeScreen hasExistingData={hasExistingData} onNew={handleNew} onResume={handleResume} onImport={handleImport} />;
  }

  if (screen === 'tutorial') {
    return <Tutorial onComplete={() => setScreen('wizard')} />;
  }

  const stepComponents: Record<number, React.ReactNode> = {
    1: <Step1Project data={data} updateData={updateData} />,
    2: <Step2Statut data={data} updateData={updateData} />,
    3: <Step3Offres data={data} updateData={updateData} />,
    4: <Step4Investissements data={data} updateData={updateData} />,
    5: <Step5Ventes data={data} updateData={updateData} />,
    6: <Step6Charges data={data} updateData={updateData} />,
    7: <Step7Remuneration data={data} updateData={updateData} />,
    8: <Step8Synthese data={data} synthese={synthese} onSave={handleSave} />,
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ProgressBar currentStep={data.etapeCourante} onStepClick={goToStep} />
      <div className="flex flex-1">
        <main className="flex-1 max-w-3xl mx-auto px-6 py-8 pb-24">
          {showSaveReminder && <div className="mb-4"><SaveReminder onSave={handleSave} /></div>}
          {stepComponents[data.etapeCourante]}
        </main>
        <Sidebar data={data} synthese={synthese} />
      </div>
      <ActionBar
        currentStep={data.etapeCourante}
        onPrevious={() => goToStep(data.etapeCourante - 1)}
        onNext={() => goToStep(data.etapeCourante + 1)}
        onSave={handleSave}
      />
    </div>
  );
}
```

- [ ] **Step 2: Create placeholder step files**

Create `src/steps/Step1Project.tsx` through `Step8Synthese.tsx` as minimal placeholder components so the app compiles:

```tsx
// Template for each step (replace N, Name, etc.)
import { Previsionnel } from '../types';

interface Props {
  data: Previsionnel;
  updateData: (partial: Partial<Previsionnel>) => void;
}

export function StepNName({ data, updateData }: Props) {
  return <div><h2 className="text-2xl font-bold mb-6">Etape N — Name</h2><p className="text-gray-500">A venir...</p></div>;
}
```

Step8 has different props: `data: Previsionnel; synthese: Synthese | null; onSave: () => void`.

- [ ] **Step 3: Verify app builds and runs**

```bash
npm run build && npm run dev
```

Expected: App shows welcome screen, clicking "Commencer" shows tutorial, then wizard with steps.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/steps/
git commit -m "feat: add wizard orchestrator and placeholder step components"
```

---

### Task 13: Step 1 — Mon projet

**Files:**
- Modify: `src/steps/Step1Project.tsx`

- [ ] **Step 1: Implement Step1Project.tsx**

Form with all project fields + activity type selection via cards. Uses FormField, Card, and Tooltip components.

Fields: nomPorteur, nomSociete, dateCreationEnvisagee, activitePrincipale, typeActivite (4 cards), adresse, descriptionOffre, descriptionMarche, strategie, experience, competences, motivations.

The `typeActivite` cards:
- "Vente de marchandises" — "Achat-revente, fabrication de produits"
- "Prestation de services" — "Artisanat, services commerciaux, restauration"
- "Activite liberale (CIPAV)" — "Architectes, ingenieurs-conseils, psychologues"
- "Activite liberale (hors CIPAV)" — "Coaching, conseil, formation, consulting"

Each field updates `data.projet` via `updateData`.

- [ ] **Step 2: Verify in browser**

Navigate to step 1, fill out some fields, verify they persist when going to step 2 and back.

- [ ] **Step 3: Commit**

```bash
git add src/steps/Step1Project.tsx
git commit -m "feat: implement Step 1 — Mon Projet with activity type cards"
```

---

### Task 14: Step 2 — Mon statut juridique

**Files:**
- Modify: `src/steps/Step2Statut.tsx`

- [ ] **Step 1: Implement Step2Statut.tsx**

6 status cards using Card component + STATUTS config. When EURL/SARL selected, show gerance question. When Micro selected, show versement liberatoire question. Each card shows `idealPour` as badge. Detailed info panel on card click.

- [ ] **Step 2: Verify in browser**

Select different statuts, verify sub-questions appear/disappear correctly.

- [ ] **Step 3: Commit**

```bash
git add src/steps/Step2Statut.tsx
git commit -m "feat: implement Step 2 — Statut Juridique with visual cards and sub-questions"
```

---

### Task 15: Step 3 — Mes offres

**Files:**
- Modify: `src/steps/Step3Offres.tsx`

- [ ] **Step 1: Implement Step3Offres.tsx**

List of offres with "Ajouter une offre" button. Each offre shows: nom, prixUnitaireHT, delaiPaiementMois, acomptePourcent, tauxTVA. TVA field hidden if micro-entreprise. Delete button per offre. Max 10 offres. UUID generation for offre IDs (use `crypto.randomUUID()`).

- [ ] **Step 2: Verify in browser**

Add/remove offres, verify TVA field visibility changes with status.

- [ ] **Step 3: Commit**

```bash
git add src/steps/Step3Offres.tsx
git commit -m "feat: implement Step 3 — Mes Offres with add/remove and TVA auto-hide"
```

---

### Task 16: Step 4 — Investissements & Financements

**Files:**
- Modify: `src/steps/Step4Investissements.tsx`

- [ ] **Step 1: Implement Step4Investissements.tsx**

Two sections:
- **Investissements**: add/remove rows (description, montant, trimestre dropdown, annee dropdown, dureeAmortissement with defaults)
- **Financements**: capital, apports, list of emprunts (add/remove: description, montant, dureeMois, tauxAnnuel), subventions
- Live total comparison: "Total investissements: X EUR / Total financements: Y EUR" with visual indicator (green if balanced, amber if not)

- [ ] **Step 2: Verify in browser**

Add investments and financing, verify totals update in real time.

- [ ] **Step 3: Commit**

```bash
git add src/steps/Step4Investissements.tsx
git commit -m "feat: implement Step 4 — Investissements & Financements with live balance"
```

---

### Task 17: Step 5 — Ventes previsionnelles

**Files:**
- Modify: `src/steps/Step5Ventes.tsx`

- [ ] **Step 1: Implement Step5Ventes.tsx**

For each offre (from step 3): grid of 36 months (grouped by year, 12 columns). Offer to input by trimester (auto-splits into 3 equal months). Show CA total per row and per column. Include a Recharts AreaChart showing cumulative CA over 36 months. AlertBanner if micro and CA exceeds plafond.

This is the most complex UI step. Use a responsive table with horizontal scroll. Input cells are small number inputs.

- [ ] **Step 2: Verify in browser**

Enter sales numbers, verify chart updates in real time, verify plafond alert.

- [ ] **Step 3: Commit**

```bash
git add src/steps/Step5Ventes.tsx
git commit -m "feat: implement Step 5 — Ventes Previsionnelles with chart and alerts"
```

---

### Task 18: Step 6 — Mes charges

**Files:**
- Modify: `src/steps/Step6Charges.tsx`

- [ ] **Step 1: Implement Step6Charges.tsx**

AlertBanner for micro-entreprise explaining charges are informational only. Pre-filled list of charges from suggestions. Each row: description (editable), montantAnnuel, evolutionAn2 (%), evolutionAn3 (%). Add/remove rows. Section for charges variables linked to offres.

- [ ] **Step 2: Verify in browser**

Verify micro-entreprise banner appears, charges pre-filled, editable.

- [ ] **Step 3: Commit**

```bash
git add src/steps/Step6Charges.tsx
git commit -m "feat: implement Step 6 — Charges with suggestions and micro-entreprise info banner"
```

---

### Task 19: Step 7 — Ma remuneration

**Files:**
- Modify: `src/steps/Step7Remuneration.tsx`

- [ ] **Step 1: Implement Step7Remuneration.tsx**

Adapts based on statut:
- **Micro**: show calculated revenue breakdown (CA - cotisations - impot = revenu disponible). Slider or input for partRevenusRetires.
- **Others**: salaireBrutAnnuel input, auto-calculated cotisations shown, augmentationAnnuelle input.
- Salaries section: add/remove rows (poste, salaireBrut, dateEmbauche trimestre+annee, augmentationAnnuelle). Show cout employeur per salarie.

- [ ] **Step 2: Verify in browser**

Switch between statuts and verify the form adapts correctly.

- [ ] **Step 3: Commit**

```bash
git add src/steps/Step7Remuneration.tsx
git commit -m "feat: implement Step 7 — Remuneration adapting to legal status"
```

---

### Task 20: Step 8 — Synthese

**Files:**
- Modify: `src/steps/Step8Synthese.tsx`

- [ ] **Step 1: Implement Step8Synthese.tsx**

Read-only synthesis page showing:
1. **Compte de resultat** table (3 columns for 3 years): CA, charges variables, marge brute, charges externes, personnel, EBE, amortissements, resultat exploitation, charges financieres, resultat avant impot, impot, resultat net.
2. **Tresorerie** table: monthly for year 1 (12 cols), quarterly for years 2-3 (4+4 cols).
3. **Indicateurs**: point mort, ratios, with colored badges (green/amber/red).
4. **Alertes**: list of AlertBanner components from synthese.alertes.
5. **Graphiques**: Recharts AreaChart for CA evolution, BarChart for charges breakdown, LineChart for tresorerie.
6. **Export buttons**: "Telecharger le PDF" and "Telecharger le fichier Excel".

- [ ] **Step 2: Verify in browser**

With test data, verify all tables, charts, and alerts render correctly.

- [ ] **Step 3: Commit**

```bash
git add src/steps/Step8Synthese.tsx
git commit -m "feat: implement Step 8 — Synthese with tables, charts, indicators, and alerts"
```

---

## Phase 5: Exports

### Task 21: PDF export

**Files:**
- Create: `src/utils/export-pdf.ts`

- [ ] **Step 1: Implement export-pdf.ts**

Uses jsPDF + jspdf-autotable to generate a professional multi-page PDF:
1. Page de garde: title, porteur, societe, date, statut
2. Presentation: project description fields
3. Plan de financement: investments + financing table
4. Compte de resultat: 3-year table from ResultatAnnuel
5. Tresorerie: monthly year 1, quarterly years 2-3
6. Indicateurs: key ratios and point mort

Each page has header ("Previsionnel Financier — [Societe]") and footer ("Page X / Y — Serenity Institut").

Function signature: `export function generatePDF(data: Previsionnel, synthese: Synthese): void` — triggers download.

- [ ] **Step 2: Test manually in browser**

Fill in test data, click export, verify PDF opens with correct content.

- [ ] **Step 3: Commit**

```bash
git add src/utils/export-pdf.ts
git commit -m "feat: add PDF export with professional multi-page layout"
```

---

### Task 22: Excel export

**Files:**
- Create: `src/utils/export-excel.ts`

- [ ] **Step 1: Implement export-excel.ts**

Uses SheetJS to generate .xlsx with tabs:
- Presentation (project info)
- Investissements (with formulas)
- Financement
- Chiffre d'affaires (monthly)
- Charges
- Remuneration
- Compte de resultat (with formulas: SUM, etc.)
- Tresorerie (monthly with formulas)

Cell formatting: editable cells with light blue background, calculated cells with light gray + protection. Currency format for EUR amounts.

Function signature: `export function generateExcel(data: Previsionnel, synthese: Synthese): void` — triggers download.

- [ ] **Step 2: Test manually in browser**

Export, open in Excel/Google Sheets, verify formulas work and formatting is clean.

- [ ] **Step 3: Commit**

```bash
git add src/utils/export-excel.ts
git commit -m "feat: add Excel export with formulas, formatting, and multiple tabs"
```

---

## Phase 6: Integration & Polish

### Task 23: Wire exports into Step 8

**Files:**
- Modify: `src/steps/Step8Synthese.tsx`
- Modify: `src/App.tsx` (if needed)

- [ ] **Step 1: Connect export buttons to generatePDF and generateExcel**

Import both export functions in Step8Synthese, call them on button click with current data + synthese.

- [ ] **Step 2: Test both exports end-to-end**

Fill complete data through all 8 steps, export PDF and Excel, verify both are correct.

- [ ] **Step 3: Commit**

```bash
git add src/steps/Step8Synthese.tsx
git commit -m "feat: wire PDF and Excel export buttons in synthesis step"
```

---

### Task 24: End-to-end manual testing + polish

**Files:** Various (fixes only)

- [ ] **Step 1: Full flow test — Micro-entreprise**

Create a new previsionnel as micro-entreprise (services BIC), fill all 8 steps, verify:
- Cotisations computed correctly (21.2% of CA)
- No TVA field on offres
- Step 6 shows info banner
- Step 7 shows revenue breakdown
- Plafond alert if CA > 77 700
- PDF and Excel export work

- [ ] **Step 2: Full flow test — SASU**

Create as SASU, fill all 8 steps, verify:
- TVA fields visible
- Charges deductibles
- Cotisations on salary (~82%)
- IS computed (15% / 25%)
- Dividends possible at flat tax 31.4%

- [ ] **Step 3: Save/resume flow test**

1. Start a previsionnel, fill steps 1-4
2. Click "Sauvegarder mon travail" — verify .previsionnel file downloads
3. Close browser tab
4. Reopen — verify "Reprendre mon travail" appears and loads correctly
5. Clear localStorage — verify "Charger un fichier" with the downloaded file works

- [ ] **Step 4: Fix any issues found**

Address any bugs or visual issues found during testing.

- [ ] **Step 5: Commit fixes**

```bash
git add -A
git commit -m "fix: address issues found during end-to-end testing"
```

---

### Task 25: Production build + deployment prep

**Files:**
- Create: `previsionnel-app/nginx.conf` (example)

- [ ] **Step 1: Build for production**

```bash
cd previsionnel-app
npm run build
```

Verify `dist/` folder is < 2 MB.

- [ ] **Step 2: Create nginx config example**

```nginx
server {
    listen 80;
    server_name previsionnel.serenity-institut.fr;
    root /var/www/previsionnel/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

- [ ] **Step 3: Commit**

```bash
git add previsionnel-app/nginx.conf previsionnel-app/dist/
git commit -m "chore: add production build and nginx config for VPS deployment"
```

---

## Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1 — Foundation | 1-4 | Project setup, types, config, storage |
| 2 — Calculations | 5-9 | Loan, depreciation, cotisations, tax, synthesis (all TDD) |
| 3 — UI Components | 10-11 | Shared components, welcome screen, tutorial |
| 4 — Wizard Steps | 12-20 | App orchestrator + all 8 steps |
| 5 — Exports | 21-22 | PDF and Excel generation |
| 6 — Integration | 23-25 | Wiring, testing, deployment prep |

**Total: 25 tasks, ~150 steps**

### Deferred to V2
- **Dividend calculations**: The flat tax rate (31.4%) is in the config but dividend simulation (how much to distribute, impact on IS/IR) is not implemented in V1. The synthesis mentions dividends as possible but does not compute optimal distribution.
- **UI component tests**: V1 focuses TDD on calculation utilities. Component render tests can be added in V2.
- **Print stylesheet**: Direct browser printing (Ctrl+P) with a dedicated CSS stylesheet.
