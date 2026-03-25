import { describe, it, expect, beforeEach } from 'vitest';
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
