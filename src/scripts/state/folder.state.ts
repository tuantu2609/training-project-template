import { FolderModel } from '../models/folder';

interface FolderState {
  rootFolder: FolderModel | null;
  currentFolder: FolderModel | null;
  folderStack: FolderModel[];
}

export const folderState: FolderState = {
  rootFolder: null,
  currentFolder: null,
  folderStack: [],
};