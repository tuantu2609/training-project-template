import { BaseDialog } from './base-dialog';

export class ConfirmDeleteDialog extends BaseDialog<boolean> {
  protected render(): string {
    return `
    <div class="modal fade" id="${this.dialogId}">
      <div class="modal-dialog">
        <div class="modal-content">

          <div class="modal-header">
            <h5 class="modal-title">Delete Item</h5>
            <button class="btn-close"></button>
          </div>

          <div class="modal-body">
            <p>Are you sure you want to delete this?</p>
          </div>

          <div class="modal-footer">
            <button class="btn btn-light btn-cancel">Cancel</button>
            <button class="btn btn-dark btn-confirm">Delete</button>
          </div>

        </div>
      </div>
    </div>
    `;
  }

  protected bindEvents() {
    this.element
      .querySelector('.btn-confirm')
      ?.addEventListener('click', () => this.close(true));

    this.element
      .querySelector('.btn-cancel')
      ?.addEventListener('click', () => this.close(false));

    this.element
      .querySelector('.btn-close')
      ?.addEventListener('click', () => this.close(false));
  }
}


export class ConfirmDuplicateDialog extends BaseDialog<boolean> {
  protected render(): string {
    return `
    <div class="modal fade" id="${this.dialogId}">
      <div class="modal-dialog">
        <div class="modal-content">

          <div class="modal-header">
            <h5 class="modal-title">Duplicate Item</h5>
            <button class="btn-close"></button>
          </div>

          <div class="modal-body">
            <p>A file with this name already exists.</p>
          </div>

          <div class="modal-footer">
            <button class="btn btn-light btn-cancel">Cancel</button>
            <button class="btn btn-dark btn-confirm">OK</button>
          </div>

        </div>
      </div>
    </div>
    `;
  }

  protected bindEvents() {
    this.element
      .querySelector('.btn-confirm')
      ?.addEventListener('click', () => this.close(true));

    this.element
      .querySelector('.btn-cancel')
      ?.addEventListener('click', () => this.close(false));

    this.element
      .querySelector('.btn-close')
      ?.addEventListener('click', () => this.close(false));
  }
}