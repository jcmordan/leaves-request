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

import * as EmployeeSheets from "@/app/[locale]/(root)/employees/sheets";
import * as MyRequestSheets from "@/app/[locale]/(root)/my-requests/sheets";

export const Sheets = {
  ...EmployeeSheets,
  ...MyRequestSheets,
} as const;

export type SheetName = keyof typeof Sheets;

export default Sheets;
