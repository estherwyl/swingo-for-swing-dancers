export const STORAGE_KEY = 'swingo_v2';

export function readStoredState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || {};
  } catch {
    return {};
  }
}

export function writeStoredState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
