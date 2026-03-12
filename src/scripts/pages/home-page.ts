import ready, {
  delay,
  setLoading,
  rebuildParent,
  findFolderById,
} from '../utilities/_helper';
import {
  saveToLocalStorage,
  getFromLocalStorage,
} from '../utilities/_storage.util';
import { openConfirmDialog } from '../utilities/dialog.util';
import { createMockFolderData } from '../data/folder.data';
import { folderState } from '../state/folder.state';
import {
  updateFolderView,
  bindFolderPopState,
  openFolderById,
} from '../navigation/folder.navigation';
import { folderService } from '../services/folder.services';
import { renderBreadcrumb } from '../components/_breadcrumb';
import { renderNotFoundState } from '../components/_not-found';

ready(async () => {
  setLoading('document-table-body', true, 'Loading documents...');

  try {
    await delay(1000);

    const data = getFromLocalStorage();
    folderState.rootFolder = data || createMockFolderData();

    if (!data) {
      saveToLocalStorage(folderState.rootFolder);
    }

    rebuildParent(folderState.rootFolder, null);

    const folderId = new URL(window.location.href).searchParams.get(
      'folder',
    );

    if (folderId) {
      const folder = findFolderById(folderState.rootFolder, folderId);

      if (!folder) {
        folderState.currentFolder = folderState.rootFolder;
        folderState.folderStack = [folderState.rootFolder];
        renderBreadcrumb();
        renderNotFoundState(folderId);
        bindActions();
        return;
      }

      folderState.currentFolder = folder;
    } else {
      folderState.currentFolder = folderState.rootFolder;
    }

    await updateFolderView(folderState.currentFolder);
    bindActions();
    bindFolderPopState();
  } finally {
    setLoading('document-table-body', false);
  }
});

function bindActions() {
  const createFolderButton = document.getElementById(
    'create-folder-btn',
  );
  const createFileButton = document.getElementById('create-file-btn');
  const uploadFileButton = document.getElementById('upload-file-btn');
  const tableBody = document.getElementById('document-table-body');
  const fileInput = document.getElementById(
    'file-input',
  ) as HTMLInputElement | null;

  createFolderButton?.addEventListener('click', async (event) => {
    event.preventDefault();
    await folderService.createFolder();
  });

  createFileButton?.addEventListener('click', async (event) => {
    event.preventDefault();
    await folderService.createFile();
  });

  uploadFileButton?.addEventListener('click', (event) => {
    event.preventDefault();
    fileInput?.click();
  });

  fileInput?.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (!file) return;

    void folderService.uploadFile(file);
    fileInput.value = '';
  });

  document.addEventListener('change', (e) => {
    const checkbox = e.target as HTMLInputElement;
    if (!checkbox.classList.contains('row-select')) return;

    tableBody?.querySelectorAll('tr').forEach((row) => {
      row.classList.remove('row-selected');
    });

    document
      .querySelectorAll<HTMLInputElement>('.row-select')
      .forEach((cb) => {
        if (cb !== checkbox) cb.checked = false;
      });

    if (checkbox.checked) {
      checkbox.closest('tr')?.classList.add('row-selected');
    }
  });

  tableBody?.addEventListener('click', async (event) => {
    const target = event.target as HTMLElement;

    if (target.closest('.row-select')) {
      return;
    }

    const deleteBtn = target.closest(
      '.btn-delete',
    ) as HTMLElement | null;
    const editBtn = target.closest('.btn-edit') as HTMLElement | null;

    if (editBtn) {
      const fileId = editBtn.dataset.fileId;
      const folderId = editBtn.dataset.folderId;

      if (fileId) {
        await folderService.editFileName(fileId);
      }

      if (folderId) {
        await folderService.editFolderName(folderId);
      }

      return;
    }

    if (deleteBtn) {
      const fileId = deleteBtn.dataset.fileId;
      const folderId = deleteBtn.dataset.folderId;

      if (fileId) {
        const confirmed = await openConfirmDialog(
          'Delete File',
          'Are you sure you want to delete this file?',
          'Delete',
        );
        if (!confirmed) return;

        await folderService.deleteFile(fileId);
      }

      if (folderId) {
        const confirmed = await openConfirmDialog(
          'Delete Folder',
          'Are you sure you want to delete this folder?',
          'Delete',
        );
        if (!confirmed) return;

        await folderService.deleteFolder(folderId);
      }

      return;
    }

    const folderRow = target.closest(
      '.folder-row',
    ) as HTMLElement | null;
    if (folderRow?.dataset.folderId) {
      await openFolderById(folderRow.dataset.folderId);
    }
  });
}
