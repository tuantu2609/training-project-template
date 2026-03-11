import { folderState } from '../state/folder.state';
import {
  getFolderPath,
  findFolderById,
  setLoading,
  delay,
} from '../utilities/_helper';
import renderGrid from '../components/_grid';
import { renderBreadcrumb } from '../components/_breadcrumb';
import { FolderModel } from '../models/folder';
import { renderNotFoundState } from '../components/_not-found';

export async function navigateToFolder(folder: FolderModel) {
  folderState.currentFolder = folder;
  folderState.folderStack = getFolderPath(folder);

  renderGrid(folder);
  renderBreadcrumb();
}

export function bindFolderPopState() {
  window.addEventListener('popstate', async (event) => {
    const rootFolder = folderState.rootFolder;
    if (!rootFolder) return;

    const folderId = event.state?.folderId;

    if (!folderId) {
      await navigateToFolder(rootFolder);
      return;
    }

    const found = findFolderById(rootFolder, folderId);

    if (!found) {
      folderState.currentFolder = rootFolder;
      folderState.folderStack = [rootFolder];
      renderNotFoundState(folderId);
      return;
    }

    await navigateToFolder(found);
  });
}

export async function openFolderById(folderId: string) {
  const currentFolder = folderState.currentFolder;
  if (!currentFolder) return;

  const folder = currentFolder.subFolders.find(
    (f) => f.id === folderId,
  );

  if (!folder) return;

  history.pushState({ folderId }, '', `?folder=${folderId}`);

  setLoading('document-table-body', true);

  try {
    await delay(500);
    await navigateToFolder(folder);
  } finally {
    setLoading('document-table-body', false);
  }
}
