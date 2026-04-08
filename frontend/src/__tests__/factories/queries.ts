import {
  createMockAppointment,
  createMockPatient,
  createMockProfessional,
  createMockUser,
} from './entities'
import { createMockConnection } from './graphql'

/**
 * Query Mock Factory
 * Creates mock responses for common GraphQL queries
 */

/**
 * Creates mock permissions following the [module]::[resource]::[action] format
 */
export function createMockPermissions(
  modules: string[] = ['appointments', 'access-control', 'system']
): string[] {
  const actions = ['view', 'create', 'update', 'delete']
  const resources: Record<string, string[]> = {
    appointments: ['users', 'patients', 'appointments', 'professionals'],
    'access-control': ['users', 'roles', 'permissions'],
    system: ['tenants', 'users', 'roles'],
  }

  const permissions: string[] = []

  for (const module of modules) {
    const moduleResources = resources[module] ?? []
    for (const resource of moduleResources) {
      for (const action of actions) {
        permissions.push(`${module}::${resource}::${action}`)
      }
    }
  }

  return permissions
}

export function createMockMainLayoutQuery(permissions?: string[]) {
  return {
    viewer: {
      viewer: {
        userProfile: createMockUser(),
        permissions: permissions ?? createMockPermissions(),
      },
    },
  }
}

export function createMockPatientListQuery(count = 5) {
  const patients = Array.from({ length: count }, () => createMockPatient())

  return {
    patients: createMockConnection(patients),
  }
}

export function createMockProfessionalListQuery(count = 5) {
  const professionals = Array.from({ length: count }, () => createMockProfessional())

  return {
    professionals: createMockConnection(professionals),
  }
}

export function createMockAppointmentListQuery(count = 5) {
  const appointments = Array.from({ length: count }, () => createMockAppointment())

  return {
    appointments: createMockConnection(appointments),
  }
}

/**
 * Helper to create a mock query document for testing
 */
export function createMockQueryDocument(queryString: string) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { gql } = require('@apollo/client')

  return gql`
    ${queryString}
  `
}
