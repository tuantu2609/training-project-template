import { FolderModel } from '../models/folder';

export const createMockFolderData = (): FolderModel => {
  const nowIso = new Date().toISOString();
  const april30Iso = new Date(
    new Date().getFullYear(),
    3,
    30,
  ).toISOString();

  const root: FolderModel = {
    id: 'root',
    name: 'root',
    parent: null,
    createdAt: april30Iso,
    createdBy: 'Admin',
    modifiedAt: april30Iso,
    modifiedBy: 'Admin',
    files: [
      {
        id: 'file-1',
        name: 'CoasterAndBargeLoading',
        extension: 'xlsx',
        createdAt: nowIso,
        createdBy: 'Admin',
        modifiedAt: nowIso,
        modifiedBy: 'Administrator MOD',
      },
      {
        id: 'file-2',
        name: 'RevenueByServices',
        extension: 'xlsx',
        createdAt: nowIso,
        createdBy: 'Admin',
        modifiedAt: nowIso,
        modifiedBy: 'Administrator MOD',
      },
    ],
    subFolders: [],
  };

  const cas: FolderModel = {
    id: 'folder-1',
    name: 'CAS',
    parent: root,
    files: [
      {
        id: 'file-5',
        name: 'RevenueByServices2016',
        extension: 'xlsx',
        createdAt: nowIso,
        createdBy: 'Admin',
        modifiedAt: nowIso,
        modifiedBy: 'Administrator MOD',
      },
      {
        id: 'file-6',
        name: 'RevenueByServices2017',
        extension: 'xlsx',
        createdAt: nowIso,
        createdBy: 'Admin',
        modifiedAt: nowIso,
        modifiedBy: 'Administrator MOD',
      },
    ],
    subFolders: [],
    createdAt: nowIso,
    createdBy: 'Admin',
    modifiedAt: april30Iso,
    modifiedBy: 'Megan Bowen',
  };

  root.subFolders.push(cas);

  return root;
};
