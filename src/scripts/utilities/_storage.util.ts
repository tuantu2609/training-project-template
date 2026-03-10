const STORAGE_KEY = 'documents';

export function saveToLocalStorage(data: any): void {
  const serializedData = JSON.stringify(data, (key, value) => {
    if (key === 'parent') {
      return undefined;
    }

    return value;
  });

  localStorage.setItem(STORAGE_KEY, serializedData);
}

export function getFromLocalStorage(): any {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
}

