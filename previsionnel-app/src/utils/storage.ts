import type { Previsionnel } from '../types';

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
    return { success: false, error: "Le fichier est illisible. Vérifiez qu'il s'agit bien d'un fichier .previsionnel." };
  }
}
