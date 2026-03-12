import { folderState } from '../state/folder.state';
import { FileModel } from '../models/file';
import renderGrid from '../components/_grid';
import { renderBreadcrumb } from '../components/_breadcrumb';
import { delay, setLoading, isDuplicate } from '../utilities/_helper';
import { saveToLocalStorage } from '../utilities/_storage.util';
import {
  openConfirmDialog,
  openFormDialog,
} from '../utilities/dialog.util';

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

    if (!result) return;

    if (isDuplicate(this.currentFolder, result.folderName)) {
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

      this.currentFolder.subFolders.push({
        id: crypto.randomUUID(),
        name: result.folderName,
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
          placeholder: 'xlsx, pdf...',
        },
      ],
      'Create',
    );

    if (!result) return;

    const extension = result.extension.replace('.', '');

    if (isDuplicate(this.currentFolder, result.fileName, extension)) {
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

    const result = await openFormDialog(
      'Rename Folder',
      [
        {
          name: 'folderName',
          label: 'Folder Name',
          value: folder.name,
        },
      ],
      'Save',
    );

    if (!result) return;

    if (
      isDuplicate(
        this.currentFolder,
        result.folderName,
        undefined,
        folder.id,
      )
    ) {
      await openConfirmDialog(
        'Duplicate Folder Name',
        'A folder with this name already exists.',
        'OK',
      );
      return;
    }

    folder.name = result.folderName;
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

    const result = await openFormDialog(
      'Rename File',
      [{ name: 'fileName', label: 'File Name', value: file.name }],
      'Save',
    );

    if (!result) return;

    if (
      isDuplicate(
        this.currentFolder,
        result.fileName,
        file.extension,
        file.id,
      )
    ) {
      await openConfirmDialog(
        'Duplicate File Name',
        'A file with this name already exists.',
        'OK',
      );
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

      this.currentFolder.files.push(newFile);

      this.save();
      this.refresh();
    } finally {
      setLoading('document-table-body', false);
    }
  }
}

export const folderService = new FolderService();
