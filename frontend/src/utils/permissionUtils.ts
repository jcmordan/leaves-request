import { mapValues, reduce, sortBy } from 'lodash'

export type Permission = {
  id: string
  name: string
  description?: string | null
}

export type PermissionData = Record<
  string,
  Record<string, Array<Permission & { isSelected: boolean }>>
>

export const groupPermissions = (
  permissions: Permission[] | undefined | null,
  activePermissionIds: string[] = []
): PermissionData => {
  if (!permissions) {
    return {}
  }

  const groupedPermissions = reduce(
    permissions,
    (acc, permission) => {
      // expected format: system::module::entity
      const parts = permission.name.split('::')

      // Handle cases where format might not match
      if (parts.length < 3) {
        return acc
      }

      const [_system, module, entity] = parts

      acc[module] = acc[module] ?? {}
      acc[module][entity] = acc[module][entity] ?? []

      acc[module][entity].push({
        id: permission.id,
        name: permission.name,
        description: permission.description,
        isSelected: activePermissionIds.includes(permission.id),
      })

      return acc
    },
    {} as PermissionData
  )

  return mapValues(groupedPermissions, moduleGroup =>
    mapValues(moduleGroup, entityPermissions =>
      sortBy(entityPermissions, p => !p.name.endsWith('view'))
    )
  )
}
