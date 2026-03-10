import 'bootstrap';
import { FormField } from '../models/form';

declare const require: any;
const { Modal } = require('bootstrap');

export function openConfirmDialog(
  title: string,
  message: string,
  confirmText = 'OK',
): Promise<boolean> {
  return new Promise((resolve) => {
    const dialogId = `confirm-dialog-${crypto.randomUUID()}`;
    let result = false;

    const html = `
    <div class="modal fade" id="${dialogId}">
    <div class="modal-dialog">
        <div class="modal-content">

        <div class="modal-header">
            <h5 class="modal-title">${title}</h5>
            <button class="btn-close"></button>
        </div>

        <div class="modal-body">
            <p>${message}</p>
        </div>

        <div class="modal-footer">
            <button class="btn btn-light btn-cancel">Cancel</button>
            <button class="btn btn-dark btn-confirm">${confirmText}</button>
        </div>

        </div>
    </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);

    const form = document.getElementById(dialogId)!;
    const modal = new Modal(form);
    const closeBtn = form.querySelector('.btn-close');

    form
      .querySelector('.btn-cancel')
      ?.addEventListener('click', () => {
        result = false;
        modal.hide();
      });

    closeBtn?.addEventListener('click', () => {
      result = false;
      modal.hide();
    });

    form
      .querySelector('.btn-confirm')
      ?.addEventListener('click', () => {
        result = true;
        modal.hide();
      });

    form.addEventListener('hidden.bs.modal', () => {
      form.remove();
      resolve(result);
    });

    modal.show();
  });
}

export function openFormDialog(
  title: string,
  fields: FormField[],
  submitText = 'Save',
): Promise<Record<string, string> | null> {
  return new Promise((resolve) => {
    const dialogId = `form-dialog-${crypto.randomUUID()}`;
    let result: Record<string, string> | null = null;

    const body = fields
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

    const html = `
    <div class="modal fade" id="${dialogId}">
      <div class="modal-dialog">
        <div class="modal-content">

          <div class="modal-header">
            <h5 class="modal-title">${title}</h5>
            <button class="btn-close"></button>
          </div>

          <div class="modal-body">
            ${body}
            <div class="text-danger small dialog-error d-none"></div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-light btn-cancel">Cancel</button>
            <button class="btn btn-dark btn-submit">${submitText}</button>
          </div>

        </div>
      </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);

    const form = document.getElementById(dialogId)!;
    const modal = new Modal(form);

    const errorMessage = form.querySelector<HTMLElement>('.dialog-error');

    form.querySelector('.btn-cancel')?.addEventListener('click', () => {
      modal.hide();
    });

    form.querySelector('.btn-close')?.addEventListener('click', () => {
      modal.hide();
    });

    form.querySelector('.btn-submit')?.addEventListener('click', () => {
      const values: Record<string, string> = {};

      const inputs =
        form.querySelectorAll<HTMLInputElement>('.dialog-input');

      inputs.forEach((input) => {
        values[input.dataset.name!] = input.value.trim();
      });

      for (const field of fields) {
        if (!values[field.name]) {
          if (errorMessage) {
            errorMessage.textContent = `${field.label} is required`;
            errorMessage.classList.remove('d-none');
          }
          return;
        }
      }

      result = values;
      modal.hide();
    });

    form.addEventListener('hidden.bs.modal', () => {
      form.remove();
      resolve(result);
    });

    modal.show();
  });
}