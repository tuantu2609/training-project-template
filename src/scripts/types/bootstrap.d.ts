declare module 'bootstrap' {
  export class Modal {
    constructor(element: Element, options?: unknown);
    show(): void;
    hide(): void;
    toggle(): void;
    dispose(): void;
    handleUpdate(): void;
  }
}
