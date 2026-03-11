import { FolderModel } from '../models/folder';

const ready = (fn: ()=> void) => {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
};

export default ready;

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function setLoading(
  elementId: string,
  loading: boolean,
  message = 'Loading...',
) {
  const element = document.getElementById(elementId);
  if (!element) return;

  let loader = element.querySelector('.table-loader') as HTMLElement;

  if (loading) {
    element.innerHTML = '';
    loader = document.createElement('tr');
    loader.className = 'table-loader';

    loader.innerHTML = `
      <td colspan="100%" class="text-center py-5 table-state-cell">
        <div class="d-flex flex-column align-items-center">
          <div class="spinner-border text-dark mb-2"></div>
          <small class="text-muted">${message}</small>
        </div>
      </td>
    `;

    element.appendChild(loader);
  } else {
    loader?.remove();
  }
}

export function rebuildParent(
  folder: FolderModel,
  parent: FolderModel | null = null,
) {
  folder.parent = parent;

  for (const sub of folder.subFolders) {
    rebuildParent(sub, folder);
  }
}

export function findFolderById(
  folder: FolderModel,
  id: string,
): FolderModel | null {
  if (folder.id === id) return folder;

  for (const subFolder of folder.subFolders) {
    const found = findFolderById(subFolder, id);
    if (found) return found;
  }

  return null;
}

export function getFolderPath(folder: FolderModel): FolderModel[] {
  const path: FolderModel[] = [];

  let current: FolderModel | null | undefined = folder;

  while (current) {
    path.unshift(current);
    current = current.parent;
  }

  return path;
}

export function isDuplicate(
  folder: FolderModel,
  name: string,
  extension?: string,
  excludeId?: string,
) {
  if (extension === undefined) {
    return folder.subFolders.some(
      (f) => f.name === name && f.id !== excludeId,
    );
  }

  return folder.files.some(
    (f) =>
      f.name === name &&
      f.extension === extension &&
      f.id !== excludeId,
  );
}