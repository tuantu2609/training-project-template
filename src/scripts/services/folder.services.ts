import { folderState } from '../state/folder.state';
import { FileModel } from '../models/file';
import renderGrid from '../components/_grid';
import { renderBreadcrumb } from '../components/_breadcrumb';
import { delay, setLoading, isDuplicate } from '../utilities/_helper';
import { saveToLocalStorage } from '../utilities/_storage.util';
import { openConfirmDialog, openFormDialog } from '../utilities/dialog.util';

const getCurrentFolder = () => folderState.currentFolder;
const getRootFolder = () => folderState.rootFolder;

export async function createFolder() {
  const currentFolder = getCurrentFolder();
  const rootFolder = getRootFolder();
  if (!currentFolder || !rootFolder) return;

  const result = await openFormDialog(
    'Create Folder',
    [{ name: 'folderName', label: 'Folder Name', placeholder: 'Enter folder name' }],
    'Create',
  );

  if (!result) return;

  if (isDuplicate(currentFolder, result.folderName)) {
    await openConfirmDialog(
      'Duplicate Folder Name',
      'A folder with this name already exists.',
      'OK',
    );
    return;
  }

  setLoading('document-table-body', true, 'Creating folder...');

  try {
    await delay(500);

    const nowIso = new Date().toISOString();

    currentFolder.subFolders.push({
      id: crypto.randomUUID(),
      name: result.folderName,
      files: [],
      parent: currentFolder,
      subFolders: [],
      createdAt: nowIso,
      createdBy: 'Current User',
      modifiedAt: nowIso,
      modifiedBy: 'Current User',
    });

    saveToLocalStorage(rootFolder);
    renderGrid(currentFolder);

  } finally {
    setLoading('document-table-body', false);
  }
}

export async function createFile() {
  const currentFolder = getCurrentFolder();
  const rootFolder = getRootFolder();
  if (!currentFolder || !rootFolder) return;

  const result = await openFormDialog(
    'Create File',
    [
      { name: 'fileName', label: 'File Name', placeholder: 'Enter file name' },
      { name: 'extension', label: 'File Extension', placeholder: 'xlsx, pdf...' },
    ],
    'Create',
  );

  if (!result) return;

  const extension = result.extension.replace('.', '');

  if (isDuplicate(currentFolder, result.fileName, extension)) {
    await openConfirmDialog(
      'Duplicate File Name',
      'A file with this name already exists.',
      'OK',
    );
    return;
  }

  setLoading('document-table-body', true, 'Creating file...');

  try {
    await delay(500);

    const nowIso = new Date().toISOString();

    const newFile: FileModel = {
      id: crypto.randomUUID(),
      name: result.fileName,
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

export async function deleteFile(fileId: string) {
  const currentFolder = getCurrentFolder();
  const rootFolder = getRootFolder();
  if (!currentFolder || !rootFolder) return;

  setLoading('document-table-body', true, 'Deleting file...');

  try {
    await delay(300);

    currentFolder.files = currentFolder.files.filter(
      (file) => file.id !== fileId,
    );

    saveToLocalStorage(rootFolder);
    renderGrid(currentFolder);

  } finally {
    setLoading('document-table-body', false);
  }
}

export async function deleteFolder(folderId: string) {
  const currentFolder = getCurrentFolder();
  const rootFolder = getRootFolder();
  if (!currentFolder || !rootFolder) return;

  setLoading('document-table-body', true, 'Deleting folder...');

  try {
    await delay(300);

    currentFolder.subFolders = currentFolder.subFolders.filter(
      (folder) => folder.id !== folderId,
    );

    saveToLocalStorage(rootFolder);
    renderGrid(currentFolder);

  } finally {
    setLoading('document-table-body', false);
  }
}

export async function editFolderName(folderId: string) {
  const currentFolder = getCurrentFolder();
  const rootFolder = getRootFolder();
  if (!currentFolder || !rootFolder) return;

  const folder = currentFolder.subFolders.find(f => f.id === folderId);
  if (!folder) return;

  const result = await openFormDialog(
    'Rename Folder',
    [{ name: 'folderName', label: 'Folder Name', value: folder.name }],
    'Save',
  );

  if (!result) return;

  if (isDuplicate(currentFolder, result.folderName, undefined, folder.id)) {
    await openConfirmDialog(
      'Duplicate Folder Name',
      'A folder with this name already exists.',
      'OK',
    );
    return;
  }

  folder.name = result.folderName;
  folder.modifiedAt = new Date().toISOString();

  saveToLocalStorage(rootFolder);

  renderGrid(currentFolder);
  renderBreadcrumb();
}

export async function editFileName(fileId: string) {
  const currentFolder = getCurrentFolder();
  const rootFolder = getRootFolder();
  if (!currentFolder || !rootFolder) return;

  const file = currentFolder.files.find(f => f.id === fileId);
  if (!file) return;

  const result = await openFormDialog(
    'Rename File',
    [{ name: 'fileName', label: 'File Name', value: file.name }],
    'Save',
  );

  if (!result) return;

  if (isDuplicate(currentFolder, result.fileName, file.extension, file.id)) {
    await openConfirmDialog(
      'Duplicate File Name',
      'A file with this name already exists.',
      'OK',
    );
    return;
  }

  file.name = result.fileName;
  file.modifiedAt = new Date().toISOString();

  saveToLocalStorage(rootFolder);

  renderGrid(currentFolder);
}

export async function uploadFile(file: File) {
  const currentFolder = getCurrentFolder();
  const rootFolder = getRootFolder();
  if (!currentFolder || !rootFolder) return;

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
    await delay(500);

    const nowIso = new Date().toISOString();

    const newFile: FileModel = {
      id: crypto.randomUUID(),
      name,
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