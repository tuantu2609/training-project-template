export interface FormField {
  name: string;
  label: string;
  value?: string;
  placeholder?: string;
}

export interface OpenDialogOptions {
  title: string;
  message?: string;
  confirmText?: string;
  submitText?: string;
  fields?: FormField[];
  errorText?: string;
}