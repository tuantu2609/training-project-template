import { FileModel } from './file';

export interface FolderModel {
  id: string;
  name: string;
  files: FileModel[];
  subFolders: FolderModel[];
  parent?: FolderModel | null;
  createdAt: string;
  createdBy: string;
  modifiedAt: string;
  modifiedBy: string;
}
