export type ClRichInputProps = {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  minHeight?: string
  maxHeight?: string
  class?: string
  expandOnFocus?: boolean
}

export type ClRichInputEmits = {
  (e: 'update:modelValue', value: string): void
  (e: 'blur'): void
  (e: 'focus'): void
  (e: 'multiline-change', isMultiline: boolean): void
}
