import { FolderModel } from '../models/folder';
import { formatDisplayDate } from '../utilities/date.util';

const getFileIcon = (
  extension: string,
): { name: string; className: string } => {
  const ext = extension.toLowerCase();

  if (['xls', 'xlsx', 'csv'].includes(ext))
    return { name: 'uiw:file-excel', className: 'icon-excel' };
  if (['doc', 'docx'].includes(ext))
    return { name: 'vscode-icons:file-type-word', className: '' };
  if (['ppt', 'pptx'].includes(ext))
    return {
      name: 'vscode-icons:file-type-powerpoint2',
      className: '',
    };
  if (ext === 'pdf')
    return { name: 'vscode-icons:file-type-pdf2', className: '' };
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) {
    return { name: 'lets-icons:img-box-fill', className: '' };
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return { name: 'vscode-icons:file-type-zip', className: '' };
  }

  return { name: 'mdi:file-outline', className: '' };
};

const renderGrid = (folder: FolderModel) => {
  const tbody = document.getElementById('document-table-body');
  if (!tbody) return;

  let body = '';

  folder.subFolders.forEach((folder) => {
    body += `
      <tr class="folder-row" data-folder-id="${folder.id}">
        <td>
          <input type="checkbox" class="row-select">
        </td>

        <td data-label="File Type">
          <iconify-icon icon="fxemoji:folder" class="icon-folder"></iconify-icon>
        </td>

        <td data-label="Name" class="td-name">
          <span class="name-value">${folder.name}</span>
        </td>

        <td data-label="Modified" class="td-content">${formatDisplayDate(folder.modifiedAt)}</td>
        <td data-label="Modified By" class="td-content">${folder.modifiedBy}</td>

        <td class="text-end">
          <button class="btn btn-sm btn-link text-success btn-edit"
            data-folder-id="${folder.id}">
            <iconify-icon icon="akar-icons:edit"></iconify-icon>
          </button>

          <button class="btn btn-sm btn-link text-danger btn-delete"
            data-folder-id="${folder.id}">
            <iconify-icon icon="mdi:delete-outline"></iconify-icon>
          </button>
        </td>
      </tr>
    `;
  });

  folder.files.forEach((file) => {
    const icon = getFileIcon(file.extension);

    body += `
      <tr data-file-id="${file.id}">
        <td>
          <input type="checkbox" class="row-select">
        </td>

        <td data-label="File Type">
          <iconify-icon icon="${icon.name}" class="${icon.className}"></iconify-icon>
        </td>

        <td data-label="Name" class="td-name">
          <span class="name-value">
          <iconify-icon icon="fluent-mdl2:glimmer" class="name-icon"></iconify-icon>
            ${file.name}.${file.extension}
          </span>
        </td>

        <td data-label="Modified" class="td-content">${formatDisplayDate(file.modifiedAt)}</td>
        <td data-label="Modified By" class="td-content">${file.modifiedBy}</td>

        <td class="text-end">
          <button class="btn btn-sm btn-link text-success btn-edit"
            data-file-id="${file.id}">
            <iconify-icon icon="akar-icons:edit"></iconify-icon>
          </button>

          <button class="btn btn-sm btn-link text-danger btn-delete"
            data-file-id="${file.id}">
            <iconify-icon icon="mdi:delete-outline"></iconify-icon>
          </button>
        </td>
      </tr>
    `;
  });

  if (!folder.subFolders.length && !folder.files.length) {
    body = `
      <tr>
        <td colspan="6" class="text-center py-4 text-muted table-state-cell">
          This folder is empty.
        </td>
      </tr>
    `;
  }

  tbody.innerHTML = body;
};

export default renderGrid;
