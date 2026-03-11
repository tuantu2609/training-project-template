import { folderState } from '../state/folder.state';
import { navigateToFolder } from '../navigation/folder.navigation';

export function renderBreadcrumb() {
  const title = document.getElementById('document-breadcrumb-title');
  if (!title) return;

  title.textContent = '';

  folderState.folderStack.forEach((folder, index) => {
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