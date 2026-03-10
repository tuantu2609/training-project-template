import ready, { delay, setLoading } from '../utilities/_helper';
import renderGrid from '../components/_grid';
import { FileModel } from '../models/file';
import { FolderModel } from '../models/folder';
import {
  openConfirmDialog,
  openFormDialog,
} from '../utilities/dialog.util';
import {
  saveToLocalStorage,
  getFromLocalStorage,
} from '../utilities/local-storage.util';
import { createMockFolderData } from '../data/folder.data';


let rootFolder: FolderModel;
let currentFolder: FolderModel;
let folderStack: FolderModel[] = [];

const renderNotFoundState = (folderId: string) => {
  const tbody = document.getElementById('document-table-body');

  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="6" class="text-center py-5 table-state-cell text-muted">
        Folder "${folderId}" not found.
      </td>
    </tr>
  `;
};

ready(async () => {
  setLoading('document-table-body', true, 'Loading documents...');

  try {
    await delay(1000);
    const data = getFromLocalStorage();

    if (data) {
      rootFolder = data;
    } else {
      rootFolder = createMockFolderData();
      saveToLocalStorage(rootFolder);
    }

    rebuildParent(rootFolder, null);

    const currentURL: string = window.location.href;
    const folderId = new URL(currentURL).searchParams.get('folder');

    if (folderId) {
      const folder = findFolderById(rootFolder, folderId);
      if (!folder) {
        folderStack = [rootFolder];
        renderBreadcrumb();
        renderNotFoundState(folderId);
        bindActions();
        return;
      }

      currentFolder = folder;
    } else {
      currentFolder = rootFolder;
    }

    folderStack = getFolderPath(currentFolder) || [rootFolder];

    renderBreadcrumb();
    renderGrid(currentFolder);
    bindActions();
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
  ) as HTMLInputElement;

  createFolderButton?.addEventListener('click', async (event) => {
    event.preventDefault();
    await createFolder();
  });

  createFileButton?.addEventListener('click', async (event) => {
    event.preventDefault();
    await createFile();
  });

  uploadFileButton?.addEventListener('click', (event) => {
    event.preventDefault();
    fileInput?.click();
  });
  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (!file) return;

    uploadFile(file);

    fileInput.value = '';
  });

  document.addEventListener('change', (e) => {
    const checkbox = e.target as HTMLInputElement;
    if (!checkbox.classList.contains('row-select')) return;

    document.querySelectorAll('tr').forEach((row) => {
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

    const btn = target.closest('.btn-delete') as HTMLElement;
    const editBtn = target.closest('.btn-edit') as HTMLElement;

    if (editBtn) {
      const fileId = editBtn.dataset.fileId;
      const folderId = editBtn.dataset.folderId;

      if (fileId) {
        await editFileName(fileId);
      }

      if (folderId) {
        await editFolderName(folderId);
      }

      return;
    }

    if (btn) {
      const fileId = btn.dataset.fileId;
      const folderId = btn.dataset.folderId;

      if (fileId) {
        const confirmed = await openConfirmDialog(
          'Delete File',
          'Are you sure you want to delete this file?',
          'Delete',
        );
        if (!confirmed) return;

        await deleteFile(fileId);
      }

      if (folderId) {
        const confirmed = await openConfirmDialog(
          'Delete Folder',
          'Are you sure you want to delete this folder?',
          'Delete',
        );
        if (!confirmed) return;

        await deleteFolder(folderId);
      }

      return;
    }

    const folderRow = target.closest('.folder-row') as HTMLElement;

    if (folderRow) {
      const folderId = folderRow.dataset.folderId;
      await openFolder(folderId!);
    }
  });
}

function rebuildParent(
  folder: FolderModel,
  parent: FolderModel | null = null,
) {
  folder.parent = parent;

  for (const sub of folder.subFolders) {
    rebuildParent(sub, folder);
  }
}

function findFolderById(
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

function getFolderPath(folder: FolderModel): FolderModel[] {
  const path: FolderModel[] = [];

  let current: FolderModel | null | undefined = folder;

  while (current) {
    path.unshift(current);
    current = current.parent;
  }

  return path;
}

async function navigateToFolder(folder: FolderModel) {
  setLoading('document-table-body', true, 'Opening folder...');
  try {
    await delay(500);

    currentFolder = folder;
    folderStack = getFolderPath(folder);

    renderGrid(currentFolder);
    renderBreadcrumb();
  } finally {
    setLoading('document-table-body', false);
  }
}

window.addEventListener('popstate', async (event) => {
  const folderId = event.state?.folderId;

  if (!folderId) {
    await navigateToFolder(rootFolder);
    return;
  }

  const found = findFolderById(rootFolder, folderId);
  if (!found) {
    currentFolder = rootFolder;
    folderStack = [rootFolder];
    renderNotFoundState(folderId);
    return;
  }

  await navigateToFolder(found);
});

async function openFolder(folderId: string) {
  setLoading('document-table-body', true, 'Opening folder...');

  const folder = currentFolder.subFolders.find(
    (f) => f.id === folderId,
  );

  if (!folder) return;

  history.pushState({ folderId }, '', `?folder=${folderId}`);

  await navigateToFolder(folder);
}

function renderBreadcrumb() {
  const title = document.getElementById('document-breadcrumb-title');
  if (!title) return;

  title.textContent = '';

  folderStack.forEach((folder, index) => {
    const label = folder.id === 'root' ? 'Documents' : folder.name;

    if (index > 0) {
      title.append(' > ');
    }

    const link = document.createElement('a');
    link.href = '#';
    link.className = 'text-reset text-decoration-none';
    link.textContent = label;

    link.onclick = async (e) => {
      e.preventDefault();

      history.pushState(
        { folderId: folder.id },
        '',
        folder.id === 'root' ? '/' : `?folder=${folder.id}`,
      );

      await navigateToFolder(folder);
    };

    title.appendChild(link);
  });
}

function isDuplicate(
  folder: FolderModel,
  name: string,
  extension?: string,
  excludeId?: string,
): boolean {
  const folderExists = folder.subFolders.some(
    (f) => f.name === name && f.id !== excludeId,
  );

  if (folderExists) return true;

  const fileExists = folder.files.some(
    (f) =>
      f.name === name &&
      (extension ? f.extension === extension : true) &&
      f.id !== excludeId,
  );

  return fileExists;
}

export async function createFolder() {
  const result = await openFormDialog(
    'Create Folder',
    [
      {
        name: 'folderName',
        label: 'Folder Name',
        placeholder: 'Enter folder name',
      },
    ],
    'Create',
  );

  if (!result) {
    return;
  }

  if (isDuplicate(currentFolder, result.folderName)) {
    await openConfirmDialog(
      'Duplicate Folder Name',
      'A folder with this name already exists.',
      'OK',
    );
    return;
  }

  const folderName = result.folderName;

  setLoading('document-table-body', true, 'Creating folder...');
  try {
    await delay(1000);

    const nowIso = new Date().toISOString();

    const newFolder: FolderModel = {
      id: crypto.randomUUID(),
      name: folderName,
      files: [],
      parent: currentFolder,
      subFolders: [],
      createdAt: nowIso,
      createdBy: 'Current User',
      modifiedAt: nowIso,
      modifiedBy: 'Current User',
    };
    currentFolder.subFolders.push(newFolder);
    saveToLocalStorage(rootFolder);
    renderGrid(currentFolder);
  } finally {
    setLoading('document-table-body', false);
  }
}

export async function createFile() {
  const result = await openFormDialog(
    'Create File',
    [
      {
        name: 'fileName',
        label: 'File Name',
        placeholder: 'Enter file name',
      },
      {
        name: 'extension',
        label: 'File Extension',
        placeholder: 'xlsx, pdf, docx...',
      },
    ],
    'Create',
  );

  if (!result) {
    return;
  }

  if (
    isDuplicate(
      currentFolder,
      result.fileName,
      result.extension.replace('.', ''),
      result.id,
    )
  ) {
    await openConfirmDialog(
      'Duplicate File Name',
      'A file with this name already exists.',
      'OK',
    );
    return;
  }

  const fileName = result.fileName;
  const extension = result.extension.replace('.', '');

  setLoading('document-table-body', true, 'Creating file...');

  try {
    await delay(1000);
    const nowIso = new Date().toISOString();

    const newFile: FileModel = {
      id: crypto.randomUUID(),
      name: fileName,
      extension,
      createdAt: nowIso,
      createdBy: 'Current User',
      modifiedAt: nowIso,
      modifiedBy: 'Current User',
    };
    currentFolder.files.push(newFile);
    saveToLocalStorage(rootFolder);
    renderGrid(currentFolder);
  } finally {
    setLoading('document-table-body', false);
  }
}

export async function uploadFile(file: File) {
  const extension = file.name.split('.').pop() || '';
  const name = file.name.replace(`.${extension}`, '');

  if (isDuplicate(currentFolder, name, extension)) {
    await openConfirmDialog(
      'Duplicate File Name',
      'A file with this name already exists.',
      'OK',
    );
    return;
  }

  setLoading('document-table-body', true, 'Uploading file...');

  try {
    await delay(1000);

    const nowIso = new Date().toISOString();

    const newFile: FileModel = {
      id: crypto.randomUUID(),
      name: name,
      extension,
      createdAt: nowIso,
      createdBy: 'Current User',
      modifiedAt: nowIso,
      modifiedBy: 'Current User',
    };

    currentFolder.files.push(newFile);
    saveToLocalStorage(rootFolder);
    renderGrid(currentFolder);
  } finally {
    setLoading('document-table-body', false);
  }
}

export async function deleteFolder(folderId: string) {
  setLoading('document-table-body', true, 'Deleting folder...');
  try {
    await delay(500);
    currentFolder.subFolders = currentFolder.subFolders.filter(
      (folder) => folder.id !== folderId,
    );
    saveToLocalStorage(rootFolder);
    renderGrid(currentFolder);
  } finally {
    setLoading('document-table-body', false);
  }
}

export async function deleteFile(fileId: string) {
  setLoading('document-table-body', true, 'Deleting file...');
  try {
    await delay(500);
    currentFolder.files = currentFolder.files.filter(
      (file) => file.id !== fileId,
    );
    saveToLocalStorage(rootFolder);
    renderGrid(currentFolder);
  } finally {
    setLoading('document-table-body', false);
  }
}

export async function editFolderName(folderId: string) {
  const folder = currentFolder.subFolders.find(
    (item) => item.id === folderId,
  );

  if (!folder) {
    return;
  }

  const result = await openFormDialog(
    'Rename Folder',
    [
      {
        name: 'folderName',
        label: 'Folder Name',
        value: folder.name,
        placeholder: 'Enter folder name',
      },
    ],
    'Save',
  );

  if (!result) {
    return;
  }

  if (
    isDuplicate(
      currentFolder,
      result.folderName,
    )
  ) {
    await openConfirmDialog(
      'Duplicate Folder Name',
      'A folder with this name already exists.',
      'OK',
    );
    return;
  }

  const nextName = result.folderName;

  setLoading('document-table-body', true, 'Renaming folder...');

  try {
    await delay(500);

    folder.name = nextName;
    folder.modifiedAt = new Date().toISOString();
    folder.modifiedBy = 'Current User';

    saveToLocalStorage(rootFolder);
    renderGrid(currentFolder);
  } finally {
    setLoading('document-table-body', false);
  }
}

export async function editFileName(fileId: string) {
  const file = currentFolder.files.find((item) => item.id === fileId);

  if (!file) {
    return;
  }

  const result = await openFormDialog(
    'Rename File',
    [
      {
        name: 'fileName',
        label: 'File Name',
        value: file.name,
        placeholder: 'Enter file name',
      },
    ],
    'Save',
  );

  if (!result) {
    return;
  }

  if (
    isDuplicate(
      currentFolder,
      result.fileName,
      result.extension,
      result.id,
    )
  ) {
    await openConfirmDialog(
      'Duplicate File Name',
      'A file with this name already exists.',
      'OK',
    );
    return;
  }

  const nextName = result.fileName;

  setLoading('document-table-body', true, 'Renaming file...');

  try {
    await delay(500);

    file.name = nextName;
    file.modifiedAt = new Date().toISOString();
    file.modifiedBy = 'Current User';

    saveToLocalStorage(rootFolder);
    renderGrid(currentFolder);
  } finally {
    setLoading('document-table-body', false);
  }
}
