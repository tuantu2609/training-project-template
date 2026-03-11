import { FolderModel } from '../models/folder';

export const folderState = {
  rootFolder: null as FolderModel | null,
  currentFolder: null as FolderModel | null,
  folderStack: [] as FolderModel[],
};