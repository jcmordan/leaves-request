/**
 * Sheet registry.
 *
 * Register your application's sheet components here.
 * Each entry maps a sheet name to its React component.
 *
 * Example:
 * import UserCreateSheet from '@/app/users/sheets/UserCreateSheet'
 *
 * export const Sheets = {
 *   UserCreateSheet,
 * }
 */

export const Sheets = {} as const

export type SheetName = keyof typeof Sheets

export default Sheets
