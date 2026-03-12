import 'bootstrap';

declare const require: any;
const { Modal } = require('bootstrap');

export abstract class BaseDialog<T> {
  protected dialogId = `dialog-${crypto.randomUUID()}`;
  protected modal!: any;
  protected element!: HTMLElement;
  protected result: T | null = null;

  async open(): Promise<T | null> {
    return new Promise((resolve) => {
      const html = this.render();

      document.body.insertAdjacentHTML('beforeend', html);

      this.element = document.getElementById(this.dialogId)!;

      this.modal = new Modal(this.element);

      this.bindEvents();

      this.element.addEventListener('hidden.bs.modal', () => {
        this.element.remove();
        resolve(this.result);
      });

      this.modal.show();
    });
  }

  protected close(result: T | null) {
    this.result = result;
    this.modal.hide();
  }

  protected abstract render(): string;

  protected abstract bindEvents(): void;
}