import { Previsionnel, Synthese, ResultatAnnuel, TresorerieMensuelle, IndicateursClés, ChargeFix } from '../types';
import { calculerCotisationsDirigeant, calculerCoutEmployeur } from './calculs-cotisations';
import { calculerIS, calculerIR, calculerImpotMicro } from './calculs-impots';
import { calculerAmortissements } from './calculs-amortissement';
import { calculerTableauEmprunt } from './calculs-emprunt';
import { BAREMES } from '../config/baremes';

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

export function calculerEncaissementsMensuels(data: Previsionnel): number[] {
  const encaissements = Array(36).fill(0);
  for (const offre of data.offres) {
    const ventes = data.ventes[offre.id] || Array(36).fill(0);
    for (let m = 0; m < 36; m++) {
      const montantTotal = (ventes[m] || 0) * offre.prixUnitaireHT;
      if (montantTotal === 0) continue;
      const acompte = montantTotal * offre.acomptePourcent;
      encaissements[m] += acompte;
      const solde = montantTotal - acompte;
      const moisEncaissement = m + offre.delaiPaiementMois;
      if (moisEncaissement < 36) {
        encaissements[moisEncaissement] += solde;
      }
    }
  }
  return encaissements;
}

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

export function calculerChargesAnnuelles(chargesFixes: ChargeFix[]): [number, number, number] {
  const totals: [number, number, number] = [0, 0, 0];
  for (const charge of chargesFixes) {
    totals[0] += charge.montantAnnuel;
    totals[1] += charge.montantAnnuel * (1 + charge.evolutionAn2);
    totals[2] += charge.montantAnnuel * (1 + charge.evolutionAn2) * (1 + charge.evolutionAn3);
  }
  return totals;
}

function calculerPersonnelAnnuel(
  data: Previsionnel,
  caAnnuel: number[],
  chargesExtAnnuelles: [number, number, number],
  chargesVarAnnuelles: [number, number, number],
): [number, number, number] {
  const totals: [number, number, number] = [0, 0, 0];

  for (let a = 0; a < 3; a++) {
    const salaire = data.remunerationDirigeant.salaireBrutAnnuel *
      Math.pow(1 + data.remunerationDirigeant.augmentationAnnuelle, a);

    if (data.statut.statutJuridique === 'micro') {
      totals[a] += calculerCotisationsDirigeant(data.statut, data.projet.typeActivite, caAnnuel[a], 0);
    } else if (data.statut.statutJuridique === 'ei') {
      const beneficeEstime = Math.max(0, caAnnuel[a] - chargesExtAnnuelles[a] - chargesVarAnnuelles[a]);
      const cotisations = calculerCotisationsDirigeant(data.statut, data.projet.typeActivite, beneficeEstime, 0);
      totals[a] += cotisations;
    } else {
      totals[a] += salaire + calculerCotisationsDirigeant(data.statut, data.projet.typeActivite, 0, salaire);
    }
  }

  for (const sal of data.salaries) {
    for (let a = 0; a < 3; a++) {
      const anneeProjet = a + 1;
      if (anneeProjet < sal.dateEmbauche.annee) continue;
      const anneesExperience = anneeProjet - sal.dateEmbauche.annee;
      const salaire = sal.salaireBrutAnnuel * Math.pow(1 + sal.augmentationAnnuelle, anneesExperience);
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
      cotisationsDirigeant: 0,
      ebe,
      dotationsAmortissements: dot,
      resultatExploitation: rex,
      chargesFinancieres: cf,
      resultatAvantImpot: rai,
      impot,
      resultatNet: rai - impot,
    };
  });

  const totalFinancements = data.financements.capital + data.financements.apports +
    data.financements.emprunts.reduce((s, e) => s + e.montant, 0) + data.financements.subventions;

  const tresorerie: TresorerieMensuelle[] = [];
  let tresoDebut = 0;

  for (let m = 0; m < 36; m++) {
    const annee = Math.floor(m / 12);
    const encaissements = encaissementsMensuels[m];
    const decCharges = chargesExternes[annee] / 12;
    const decPersonnel = personnel[annee] / 12;
    const decChargesVar = chargesVarMensuelles[m];

    let decInvest = 0;
    const trimestre = Math.floor((m % 12) / 3) + 1;
    const anneeProjet = annee + 1;
    if (m % 3 === 0) {
      decInvest = data.investissements
        .filter(i => i.annee === anneeProjet && i.trimestre === trimestre)
        .reduce((s, i) => s + i.montant, 0);
    }

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

  const alertes: string[] = [];
  if (tresorerie.some(t => t.tresorerieFin < 0)) {
    const premierMoisNegatif = tresorerie.find(t => t.tresorerieFin < 0)!.mois + 1;
    alertes.push(`Attention, votre tresorerie devient négative au mois ${premierMoisNegatif}.`);
  }
  if (resultatsAnnuels.every(r => r.resultatNet < 0)) {
    alertes.push('Votre résultat net est négatif sur les 3 années. Revoyez vos hypothèses de ventes ou de charges.');
  }
  if (ratioDetteResultat.some(r => r > 5)) {
    alertes.push('Votre ratio dette/résultat dépasse 500%. Cela peut poser problème pour obtenir un financement.');
  }

  if (data.statut.statutJuridique === 'micro') {
    const plafond = data.projet.typeActivite === 'vente_bic'
      ? BAREMES.plafondsMicro.vente
      : BAREMES.plafondsMicro.services;
    for (let a = 0; a < 3; a++) {
      if (caAnnuel[a] > plafond) {
        alertes.push(`Année ${a + 1} : votre CA (${caAnnuel[a].toLocaleString('fr-FR')} €) dépasse le plafond micro-entreprise (${plafond.toLocaleString('fr-FR')} €).`);
      }
    }

    const tvaConfig = data.projet.typeActivite === 'vente_bic'
      ? BAREMES.tvaFranchise.vente
      : BAREMES.tvaFranchise.services;
    for (let a = 0; a < 3; a++) {
      if (caAnnuel[a] > tvaConfig.seuilMajore) {
        alertes.push(`Année ${a + 1} : votre CA dépasse le seuil majoré de franchise TVA (${tvaConfig.seuilMajore.toLocaleString('fr-FR')} €). La TVA s'applique immédiatement.`);
      } else if (caAnnuel[a] > tvaConfig.seuilBase) {
        alertes.push(`Année ${a + 1} : votre CA dépasse le seuil de base de franchise TVA (${tvaConfig.seuilBase.toLocaleString('fr-FR')} €). La TVA s'appliquera l'année suivante.`);
      }
    }
  }

  if (pointMortMois !== null) {
    alertes.push(`Bonne nouvelle : votre point mort est atteint au mois ${pointMortMois}. C'est le moment où votre activité devient rentable.`);
  }
  const premierAnneeRentable = resultatsAnnuels.findIndex(r => r.resultatNet > 0);
  if (premierAnneeRentable >= 0) {
    alertes.push(`Votre première année avec un résultat net positif est l'année ${premierAnneeRentable + 1}.`);
  }

  return {
    resultatsAnnuels,
    tresorerie,
    indicateurs: { pointMortEuros, pointMortMois, ratioDetteCapital, ratioDetteResultat },
    alertes,
  };
}
