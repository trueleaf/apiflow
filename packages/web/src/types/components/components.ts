import type { ApidocProperty, Language, ChunkWithTimestampe } from '@src/types';
import type { WebsocketResponse } from '@src/types/websocketNode';

/*
|--------------------------------------------------------------------------
| ClParamsTree组件
|--------------------------------------------------------------------------
*/
export type ClParamsTreeProps = {
  data: ApidocProperty<'string' | 'file'>[];
  enableFile?: boolean;
  mindKeyParams?: ApidocProperty[];
  showCheckbox?: boolean;
  editMode?: 'table' | 'multiline';
}

export type ClParamsTreeEmits = {
  (e: 'change', value: ApidocProperty<'string' | 'file'>[]): void;
  (e: 'multiline-applied'): void;
}

/*
|--------------------------------------------------------------------------
| ClVirtualScroll组件
|--------------------------------------------------------------------------
*/
export interface ClVirtualScrollProps {
  items: any[];
  itemHeight: number;
  bufferSize?: number; //可见区域上下额外渲染多少个条目
  virtual?: boolean; // 是否开启虚拟滚动
}

/*
|--------------------------------------------------------------------------
| DraggableDialog组件
|--------------------------------------------------------------------------
*/
export interface DraggableDialogProps {
  modelValue: boolean
  title?: string
  width?: string | number
  overlay?: boolean
}

export interface DraggableDialogEmits {
  (e: 'update:modelValue', value: boolean): void
}

/*
|--------------------------------------------------------------------------
| ClRichInput组件
|--------------------------------------------------------------------------
*/
export interface ClRichInputProps {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  minHeight?: number
  maxHeight?: number
  class?: string
  expandOnFocus?: boolean
  trimOnPaste?: boolean
  disableHistory?: boolean
}

export interface ClRichInputEmits {
  (e: 'update:modelValue', value: string): void
  (e: 'blur'): void
  (e: 'focus'): void
  (e: 'multiline-change', isMultiline: boolean): void
}

/*
|--------------------------------------------------------------------------
| SearchHighlight组件
|--------------------------------------------------------------------------
*/
export interface SearchHighlightProps {
  text: string;
  keyword: string;
}

/*
|--------------------------------------------------------------------------
| ClDialog组件
|--------------------------------------------------------------------------
*/
export interface ClDialogProps {
  modelValue: boolean
  title?: string
  width?: string | number
  top?: string
  closeOnClickModal?: boolean
  destroyOnClose?: boolean
  beforeClose?: (done: () => void) => void
}

export interface ClDialogEmits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'opened'): void
  (e: 'closed'): void
  (e: 'close'): void
}

/*
|--------------------------------------------------------------------------
| ClWebsocketView组件
|--------------------------------------------------------------------------
*/
export interface ClWebsocketViewProps {
  dataList: WebsocketResponse[]; 
  virtual?: boolean; 
}

export interface ClWebsocketViewEmits {
  (e: 'clearData'): void;
}

/*
|--------------------------------------------------------------------------
| UndoNotification组件
|--------------------------------------------------------------------------
*/
export interface UndoNotificationProps {
  message: string
  duration?: number
  showProgress?: boolean
}

export interface UndoNotificationEmits {
  (e: 'undo'): void
  (e: 'close'): void
}

/*
|--------------------------------------------------------------------------
| WebsocketPopover组件
|--------------------------------------------------------------------------
*/
export interface WebsocketPopoverProps {
  visible: boolean;
  message: WebsocketResponse | null;
  messageIndex: number;
  virtualRef: HTMLElement | null;
}

export interface WebsocketPopoverEmits {
  (e: 'hide'): void;
  (e: 'close'): void;
}

/*
|--------------------------------------------------------------------------
| WebsocketFilter组件
|--------------------------------------------------------------------------
*/
export interface WebsocketFilterProps {
  hasData: boolean;
  isRawView: boolean;
  filteredCount: number;
}

export interface WebsocketFilterEmits {
  (e: 'update:filterText', value: string): void;
  (e: 'update:isRegexMode', value: boolean): void;
  (e: 'update:filterError', value: string): void;
  (e: 'update:isRawView', value: boolean): void;
  (e: 'update:selectedMessageTypes', value: string[]): void;
  (e: 'update:isSearchInputVisible', value: boolean): void;
  (e: 'download'): void;
  (e: 'clearData'): void;
}

/*
|--------------------------------------------------------------------------
| ClLoading组件
|--------------------------------------------------------------------------
*/
export interface ClLoadingProps {
  loading?: boolean
}

/*
|--------------------------------------------------------------------------
| Language组件
|--------------------------------------------------------------------------
*/
export interface LanguageProps {
  visible: boolean
  position: {
    x: number
    y: number
    width: number
    height: number
  };
  currentLanguage: Language
}

export interface LanguageEmits {
  (e: 'languageSelect', language: Language): void
  (e: 'close'): void
}

/*
|--------------------------------------------------------------------------
| SsePopover组件
|--------------------------------------------------------------------------
*/
export interface SsePopoverProps {
  visible: boolean;
  message: any;
  messageIndex: number;
  virtualRef: HTMLElement | null;
}

export interface SsePopoverEmits {
  (e: 'hide'): void;
  (e: 'close'): void;
}

/*
|--------------------------------------------------------------------------
| ClSseView组件
|--------------------------------------------------------------------------
*/
export interface ClSseViewProps {
  dataList: ChunkWithTimestampe[]; 
  virtual?: boolean; 
  isDataComplete?: boolean 
}

/*
|--------------------------------------------------------------------------
| FilterConfigDialog组件
|--------------------------------------------------------------------------
*/
export interface FilteredDataPayload {
  list: unknown[];
  finalValue: unknown | null;
}

export interface FilterConfigDialogProps {
  modelValue: boolean;
  sourceData: unknown[];
}

export interface FilterConfigDialogEmits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'filteredDataChange', data: FilteredDataPayload): void;
}

/*
|--------------------------------------------------------------------------
| ClEllipsisContent组件
|--------------------------------------------------------------------------
*/
export type EllipsisValue = string | number | boolean

export interface ClEllipsisContentProps {
  value?: EllipsisValue
  maxWidth?: string | number
  copy?: boolean
}

/*
|--------------------------------------------------------------------------
| Message组件
|--------------------------------------------------------------------------
*/
export type MessageType = 'info' | 'success' | 'warning' | 'error'

export interface MessageOptions {
  title?: string
  message: string
  type?: MessageType
  showCheckbox?: boolean
  checkboxText?: string
  confirmButtonText?: string
  cancelButtonText?: string
  showCancel?: boolean
  duration?: number
  onConfirm?: (checked: boolean) => void
  onCancel?: () => void
  onClose?: () => void
}

export interface MessageProps {
  visible: boolean
  title?: string
  message: string
  type?: MessageType
  showCheckbox?: boolean
  checkboxText?: string
  confirmButtonText?: string
  cancelButtonText?: string
  showCancel?: boolean
  zIndex?: number
  onConfirm?: (checked: boolean) => void
  onCancel?: () => void
  onClose?: () => void
}

export interface MessageEmits {
  (e: 'update:visible', value: boolean): void
  (e: 'confirm', checked: boolean): void
  (e: 'cancel'): void
  (e: 'close'): void
}

export interface MessageResult {
  checked: boolean
}

export interface MessageInstance {
  close: () => void
}

/*
|--------------------------------------------------------------------------
| Confirm组件
|--------------------------------------------------------------------------
*/
export type ConfirmType = 'info' | 'warning' | 'error' | 'success'

export interface ConfirmOptions {
  title?: string
  content: string
  type?: ConfirmType
  showCheckbox?: boolean
  checkboxText?: string
  confirmButtonText?: string
  cancelButtonText?: string
  onConfirm?: (checked: boolean) => void
  onCancel?: () => void
  onClose?: () => void
}

export interface ConfirmProps {
  visible: boolean
  title?: string
  content: string
  type?: ConfirmType
  showCheckbox?: boolean
  checkboxText?: string
  confirmButtonText?: string
  cancelButtonText?: string
  zIndex?: number
  onConfirm?: (checked: boolean) => void
  onCancel?: () => void
  onClose?: () => void
}

export interface ConfirmEmits {
  (e: 'update:visible', value: boolean): void
  (e: 'confirm', checked: boolean): void
  (e: 'cancel'): void
  (e: 'close'): void
}

export interface ConfirmResult {
  confirmed: boolean
  checked: boolean
}

export interface ConfirmInstance {
  close: () => void
}

