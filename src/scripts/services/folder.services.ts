import { folderState } from '../state/folder.state';
import { FileModel } from '../models/file';
import renderGrid from '../components/_grid';
import { renderBreadcrumb } from '../components/_breadcrumb';
import { delay, setLoading, isDuplicate } from '../utilities/_helper';
import { saveToLocalStorage } from '../utilities/_storage.util';

import { FormDialog } from '../utilities/dialogs/form-dialog';
import { ConfirmDuplicateDialog } from '../utilities/dialogs/confirm-dialog';

class FolderService {
  private get currentFolder() {
    return folderState.currentFolder;
  }

  private get rootFolder() {
    return folderState.rootFolder;
  }

  private save() {
    if (this.rootFolder) {
      saveToLocalStorage(this.rootFolder);
    }
  }

  private refresh() {
    if (this.currentFolder) {
      renderGrid(this.currentFolder);
    }
  }

  public async createFolder() {
    if (!this.currentFolder || !this.rootFolder) return;

    const dialog = new FormDialog('Create Folder', [
      { name: 'name', label: 'Folder name' },
    ]);

    const result = await dialog.open();

    if (!result) return;

    if (isDuplicate(this.currentFolder, result.name)) {
      const dialog = new ConfirmDuplicateDialog();
      await dialog.open();
      return;
    }

    setLoading('document-table-body', true, 'Creating folder...');

    try {
      await delay(500);

      const nowIso = new Date().toISOString();

      this.currentFolder.subFolders.push({
        id: crypto.randomUUID(),
        name: result.name,
        files: [],
        parent: this.currentFolder,
        subFolders: [],
        createdAt: nowIso,
        createdBy: 'Current User',
        modifiedAt: nowIso,
        modifiedBy: 'Current User',
      });

      this.save();
      this.refresh();
    } finally {
      setLoading('document-table-body', false);
    }
  }

  public async createFile() {
    if (!this.currentFolder || !this.rootFolder) return;

    const dialog = new FormDialog('Create File', [
      { name: 'name', label: 'File name', placeholder: 'Enter file name' },
      { name: 'extension', label: 'File extension', placeholder: 'xlsx, pdf...' },
    ]);

    const result = await dialog.open();

    if (!result) return;

    const extension = result.extension.replace('.', '');

    if (isDuplicate(this.currentFolder, result.fileName, extension)) {
      const dialog = new ConfirmDuplicateDialog();
      await dialog.open();
      return;
    }

    setLoading('document-table-body', true, 'Creating file...');

    try {
      await delay(500);

      const nowIso = new Date().toISOString();

      const newFile: FileModel = {
        id: crypto.randomUUID(),
        name: result.name,
        extension,
        createdAt: nowIso,
        createdBy: 'Current User',
        modifiedAt: nowIso,
        modifiedBy: 'Current User',
      };

      this.currentFolder.files.push(newFile);

      this.save();
      this.refresh();
    } finally {
      setLoading('document-table-body', false);
    }
  }

  public async deleteFile(fileId: string) {
    if (!this.currentFolder || !this.rootFolder) return;

    setLoading('document-table-body', true, 'Deleting file...');

    try {
      await delay(300);

      this.currentFolder.files = this.currentFolder.files.filter(
        (file) => file.id !== fileId,
      );

      this.save();
      this.refresh();
    } finally {
      setLoading('document-table-body', false);
    }
  }

  public async deleteFolder(folderId: string) {
    if (!this.currentFolder || !this.rootFolder) return;

    setLoading('document-table-body', true, 'Deleting folder...');

    try {
      await delay(300);

      this.currentFolder.subFolders =
        this.currentFolder.subFolders.filter(
          (folder) => folder.id !== folderId,
        );

      this.save();
      this.refresh();
    } finally {
      setLoading('document-table-body', false);
    }
  }

  public async editFolderName(folderId: string) {
    if (!this.currentFolder || !this.rootFolder) return;

    const folder = this.currentFolder.subFolders.find(
      (f) => f.id === folderId,
    );
    if (!folder) return;

    const dialog = new FormDialog('Rename Folder', [
      { name: 'name', label: 'Folder name', value: folder.name},
    ]);

    const result = await dialog.open();

    console.log(result);

    if (!result) return;

    if (
      isDuplicate(
        this.currentFolder,
        result.name,
        undefined,
        folder.id,
      )
    ) {
      const dialog = new ConfirmDuplicateDialog();
      await dialog.open();
      return;
    }

    folder.name = result.name;
    folder.modifiedAt = new Date().toISOString();

    this.save();
    this.refresh();
    renderBreadcrumb();
  }

  public async editFileName(fileId: string) {
    if (!this.currentFolder || !this.rootFolder) return;

    const file = this.currentFolder.files.find(
      (f) => f.id === fileId,
    );
    if (!file) return;

    const dialog = new FormDialog('Rename File', [
      { name: 'name', label: 'File name', value: file.name},
    ]);

    const result = await dialog.open();

    if (!result) return;

    if (
      isDuplicate(
        this.currentFolder,
        result.name,
        file.extension,
        file.id,
      )
    ) {
      const dialog = new ConfirmDuplicateDialog();
      await dialog.open();
      return;
    }

    file.name = result.fileName;
    file.modifiedAt = new Date().toISOString();

    this.save();
    this.refresh();
  }

  public async uploadFile(file: File) {
    if (!this.currentFolder || !this.rootFolder) return;

    const extension = file.name.split('.').pop() || '';
    const name = file.name.replace(`.${extension}`, '');

    if (isDuplicate(this.currentFolder, name, extension)) {
      const dialog = new ConfirmDuplicateDialog();
      await dialog.open();
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

      this.currentFolder.files.push(newFile);

      this.save();
      this.refresh();
    } finally {
      setLoading('document-table-body', false);
    }
  }
}

export const folderService = new FolderService();
