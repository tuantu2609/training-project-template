export function renderNotFoundState(folderId: string) {
  const tbody = document.getElementById('document-table-body');
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="6" class="text-center py-5 table-state-cell text-muted">
        Folder "${folderId}" not found.
      </td>
    </tr>
  `;
}