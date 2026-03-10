const ready = (fn: ()=> void) => {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
};

export default ready;

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function setLoading(
  elementId: string,
  loading: boolean,
  message = 'Loading...',
) {
  const element = document.getElementById(elementId);
  if (!element) return;

  let loader = element.querySelector('.table-loader') as HTMLElement;

  if (loading) {
    if (!loader) {
      loader = document.createElement('tr');
      loader.className = 'table-loader';

      loader.innerHTML = `
        <td colspan="100%" class="text-center py-5 table-state-cell">
          <div class="d-flex flex-column align-items-center">
            <div class="spinner-border text-dark mb-2"></div>
            <small class="text-muted">${message}</small>
          </div>
        </td>
      `;

      element.appendChild(loader);
    }
  } else {
    loader?.remove();
  }
}