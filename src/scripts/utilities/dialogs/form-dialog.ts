import { BaseDialog } from './base-dialog';
import { FormField } from '../../models/form';

function validateInput(value: string): boolean {
  return /^[A-Za-z0-9 _-]+$/.test(value);
}

export class FormDialog extends BaseDialog<Record<string, string>> {
  constructor(
    private title: string,
    private fields: FormField[],
  ) {
    super();
  }

  protected render(): string {
    const body = this.fields
      .map(
        (f) => `
        <div class="mb-3">
          <label class="form-label">${f.label}</label>
          <input
            class="form-control dialog-input"
            data-name="${f.name}"
            value="${f.value || ''}"
            placeholder="${f.placeholder || ''}"
          />
        </div>
      `,
      )
      .join('');

    return `
    <div class="modal fade" id="${this.dialogId}">
      <div class="modal-dialog">
        <div class="modal-content">

          <div class="modal-header">
            <h5 class="modal-title">${this.title}</h5>
            <button class="btn-close"></button>
          </div>

          <div class="modal-body">
            ${body}
            <div class="text-danger small dialog-error d-none"></div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-light btn-cancel">Cancel</button>
            <button class="btn btn-dark btn-submit">Save</button>
          </div>

        </div>
      </div>
    </div>
    `;
  }

  protected bindEvents() {
    const error = this.element.querySelector<HTMLElement>('.dialog-error');

    this.element
      .querySelector('.btn-submit')
      ?.addEventListener('click', () => {
        const values: Record<string, string> = {};

        const inputs =
          this.element.querySelectorAll<HTMLInputElement>('.dialog-input');

        inputs.forEach((input) => {
          values[input.dataset.name!] = input.value.trim();
        });

        for (const field of this.fields) {
          if (!values[field.name]) {
            if (error) {
              error.textContent = `${field.label} is required`;
              error.classList.remove('d-none');
            }
            return;
          }

          if (!validateInput(values[field.name])) {
            if (error) {
              error.textContent = `${field.label} contains invalid characters`;
              error.classList.remove('d-none');
            }
            return;
          }
        }

        this.close(values);
      });

    this.element
      .querySelector('.btn-cancel')
      ?.addEventListener('click', () => this.close(null));

    this.element
      .querySelector('.btn-close')
      ?.addEventListener('click', () => this.close(null));
  }
}