import type { UseFetchReturn } from '@vueuse/core'
import { LabelPosition } from '@/components/input/InputField.vue'
import type { CitationType } from '@/domain/citationType'
import type { Ref } from 'vue'
import type { ComboboxResult } from '@/domain/comboboxResult.ts'
import type { ReferenceTypeEnum } from '@/domain/activeReference.ts'
import type { FieldOfLaw } from '@/domain/fieldOfLaw'
import type { Court } from '@/domain/court'
import { type Institution, type Region } from '@/domain/normgeber'
import type { DocumentType } from '@/domain/documentType'

export enum InputType {
  TEXT = 'text',
  FILE = 'file',
  DROPDOWN = 'dropdown',
  DATE = 'date',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  NESTED = 'nested',
  COMBOBOX = 'combobox',
  TEXTAREA = 'textarea',
  DATE_TIME = 'date_time',
  YEAR = 'year',
  TIME = 'time',
  UNDEFINED_DATE = 'undefined_date',
}

//BASE
export interface BaseInputAttributes {
  ariaLabel: string
  validationError?: ValidationError
  labelPosition?: LabelPosition
}

export interface BaseInputField {
  name: string
  type: InputType
  label: string
  required?: boolean
  inputAttributes: BaseInputAttributes
}

//NESTED INPUT
export interface NestedInputModelType {
  fields: {
    parent: ModelType
    child: ModelType
  }
}

export interface NestedInputAttributes extends BaseInputAttributes {
  fields: { parent: InputField; child: InputField }
}

export interface NestedInputField extends Omit<BaseInputField, 'name'> {
  name: `nestedInputOf${Capitalize<string>}And${Capitalize<string>}`
  type: InputType.NESTED
  inputAttributes: NestedInputAttributes
}

//DATE
export interface DateAttributes extends BaseInputAttributes {
  isFutureDate?: boolean
}

export interface DateInputField extends BaseInputField {
  placeholder?: string
  type: InputType.DATE
  inputAttributes: DateAttributes
}

export type DateInputModelType = string | undefined

//DROPDOWN

export type DropdownItem = {
  label: string
  value: string
}

export interface DropdownAttributes extends BaseInputAttributes {
  placeholder?: string
  items: DropdownItem[]
}

export interface DropdownInputField extends BaseInputField {
  type: InputType.DROPDOWN
  inputAttributes: DropdownAttributes
}

//COMBOBOX
export type ComboboxInputModelType =
  | FieldOfLaw
  | Court
  | DocumentType
  | CitationType
  | ReferenceTypeEnum
  | Institution
  | Region

export type ComboboxItem = {
  label: string
  value?: ComboboxInputModelType
  labelCssClasses?: string
  additionalInformation?: string
  sideInformation?: string
}

export interface ComboboxAttributes extends BaseInputAttributes {
  itemService: (
    filter: Ref<string | undefined>,
  ) => ComboboxResult<ComboboxItem[]> | UseFetchReturn<ComboboxItem[]>
  placeholder?: string
  manualEntry?: boolean
  noClear?: boolean
}

export interface ComboboxInputField extends BaseInputField {
  type: InputType.COMBOBOX
  inputAttributes: ComboboxAttributes
}

//TEXTAREA
export interface TextAreaInputAttributes extends BaseInputAttributes {
  placeholder?: string
  readOnly?: boolean
  autosize?: boolean
  rows?: number
  fieldSize: 'max' | 'big' | 'medium' | 'small'
}

export interface TextAreaInputField extends BaseInputField {
  type: InputType.TEXTAREA
  inputAttributes: TextAreaInputAttributes
}

export type InputField =
  | DropdownInputField
  | DateInputField
  | NestedInputField
  | ComboboxInputField
  | TextAreaInputField

export type InputAttributes =
  | DropdownAttributes
  | NestedInputAttributes
  | DateAttributes
  | ComboboxAttributes
  | TextAreaInputAttributes

export type ModelType = string | DateInputModelType | NestedInputModelType | ComboboxInputModelType

export type ValidationError = {
  code?: string
  message: string
  instance: string
}
