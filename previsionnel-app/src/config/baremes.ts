export const BAREMES = {
  annee: 2026,

  cotisationsMicro: {
    vente_bic: 0.123,
    services_bic: 0.212,
    liberale_cipav: 0.232,
    liberale_bnc_ssi: 0.256,
  },

  versementLiberatoire: {
    vente_bic: 0.01,
    services_bic: 0.017,
    liberale_cipav: 0.022,
    liberale_bnc_ssi: 0.022,
  },

  cotisationsEI: 0.45,
  cotisationsGerantMajoritaire: 0.45,
  cotisationsGerantMinoritaire: 0.65,
  cotisationsSASU_patronal: 0.54,
  cotisationsSASU_salarial: 0.28,

  cotisationsSalarie_patronal: 0.45,
  cotisationsSalarie_salarial: 0.22,

  tvaFranchise: {
    services: { seuilBase: 37500, seuilMajore: 41250 },
    vente: { seuilBase: 85000, seuilMajore: 93500 },
  },

  plafondsMicro: {
    services: 77700,
    vente: 188700,
  },

  abattementMicro: {
    vente_bic: 0.71,
    services_bic: 0.50,
    liberale_cipav: 0.34,
    liberale_bnc_ssi: 0.34,
  },

  is: {
    tauxReduit: 0.15,
    seuilReduit: 42500,
    tauxNormal: 0.25,
  },

  irTranches: [
    { limite: 11294, taux: 0 },
    { limite: 28797, taux: 0.11 },
    { limite: 82341, taux: 0.30 },
    { limite: 177106, taux: 0.41 },
    { limite: Infinity, taux: 0.45 },
  ],

  flatTax: 0.314,
  tauxTVA: 0.20,
} as const;
