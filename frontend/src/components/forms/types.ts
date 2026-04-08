export type BaseInputProps<T extends object = object> = T & {
  name: string
  label: string
  required?: boolean
  disabled?: boolean
}

export type InputOption = {
  label: string
  value: string | number
  disabled?: boolean
}
