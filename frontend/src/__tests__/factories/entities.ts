import {
  Appointment,
  AppointmentInstance,
  AppointmentRecurrence,
  AppointmentRecurrenceType,
  AppointmentInstanceStatus,
  ContactInfo,
  ContactType,
  IdentificationType,
  Office,
  OfficeAssignment,
  Patient,
  PatientParent,
  PatientPrepaidPlan,
  Person,
  PersonRelationShipType,
  PersonType,
  PrepaidPlan,
  PrepaidPlanStatus,
  Professional,
  ProfessionalFeeType,
  User,
  UserStatus,
} from '@/__generated__/graphql'
import { StrictContactInfo } from '@/app/console/appointments/shared/types'

/**
 * Mock Factory for GraphQL Entities
 * Provides builder pattern with sensible defaults and override capabilities
 */

type AppModule = {
  id: string
  name: string
  iconName: string
  path: string
  order: number
  children: AppModule[]
}

let idCounter = 1

function generateId(): string {
  return `mock-id-${idCounter++}`
}

function generateDate(offsetDays = 0): Date {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)

  return date
}

/**
 * Creates a mock GraphQL connection with edges and pageInfo
 * @param nodes - Array of node objects to wrap in edges
 * @param overrides - Optional overrides for pageInfo
 * @returns A complete connection object with edges and pageInfo
 */
export function createMockConnection<T>(
  nodes: T[],
  overrides?: {
    hasNextPage?: boolean
    hasPreviousPage?: boolean
    startCursor?: string | null
    endCursor?: string | null
    __typename?: string
  }
) {
  return {
    edges: nodes.map((node: any, index) => {
      const edgeTypename = overrides?.__typename?.includes('Connection')
        ? overrides.__typename.replace('Connection', 'Edge')
        : node?.__typename
          ? `${node.__typename}Edge`
          : undefined

      return {
        __typename: edgeTypename as any,
        cursor: `cursor-${index + 1}`,
        node,
      }
    }),
    nodes,
    pageInfo: {
      __typename: 'PageInfo' as const,
      hasNextPage: overrides?.hasNextPage ?? false,
      hasPreviousPage: overrides?.hasPreviousPage ?? false,
      startCursor: overrides?.startCursor ?? null,
      endCursor: overrides?.endCursor ?? null,
    },
    ...(overrides?.__typename ? { __typename: overrides.__typename } : {}),
  }
}

export function createMockOfficeAssignment(
  overrides?: Partial<OfficeAssignment>
): OfficeAssignment {
  const startAt = generateDate(1)

  return {
    __typename: 'OfficeAssignment',
    id: generateId(),
    startAt: startAt.toISOString(),
    endAt: new Date(startAt.getTime() + 60 * 60 * 1000).toISOString(),
    duration: 60,
    isRecurrent: false,
    recurrence: null,
    // office and professional don't seem to exist on OfficeAssignment
    // according to graphql.ts, but let's check if they were replaced by something else
    // Actually, createMockOfficeAssignment was using them.
    // I'll keep them if the type allows it (overrides might be used), but the base type doesn't have them.
    // Wait, let's check if I should use base names like 'professional'
    professional: createMockProfessional(),
    createdAt: generateDate(-30).toISOString(),
    updatedAt: generateDate(-1).toISOString(),
    ...overrides,
  }
}

export function createMockContactInfo(overrides?: Partial<ContactInfo>): StrictContactInfo {
  return {
    __typename: 'ContactInfo',
    id: generateId(),
    type: ContactType.Email,
    value: 'test@example.com',
    primary: true,
    whatsapp: false,
    reference: null,
    ...overrides,
  } as StrictContactInfo
}

export function createMockPerson(overrides?: Partial<Person>): Person {
  return {
    id: generateId(),
    personId: generateId(),
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
    identificationType: IdentificationType.NationalId,
    identificationNumber: '123456789',
    dateOfBirth: generateDate(-365 * 30).toISOString(), // 30 years ago
    personType: PersonType.Patient,
    contactInfo: {
      __typename: 'ContactInfoConnection',
      edges: [],
      pageInfo: {
        __typename: 'PageInfo',
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
    },
    ...overrides,
  }
}

export function createMockPatient(overrides?: Partial<Patient>): Patient {
  const basePerson = createMockPerson()

  return {
    __typename: 'Patient',
    id: basePerson.id,
    personId: basePerson.personId,
    firstName: basePerson.firstName,
    lastName: basePerson.lastName,
    fullName: basePerson.fullName,
    identificationType: basePerson.identificationType,
    identificationNumber: basePerson.identificationNumber,
    dateOfBirth: basePerson.dateOfBirth,
    personType: PersonType.Patient,
    appointments: {
      __typename: 'AppointmentsConnection',
      edges: [],
      pageInfo: {
        __typename: 'PageInfo',
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
    },
    contactInfo: basePerson.contactInfo,
    parents: {
      __typename: 'ParentsConnection',
      edges: [],
      pageInfo: {
        __typename: 'PageInfo',
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
    },
    balance: 0,
    ...overrides,
  }
}

export function createMockProfessional(overrides?: Partial<Professional>): Professional {
  const basePerson = createMockPerson({ firstName: 'Jane', lastName: 'Smith' })

  return {
    __typename: 'Professional',
    id: basePerson.id,
    personId: basePerson.personId,
    firstName: basePerson.firstName,
    lastName: basePerson.lastName,
    fullName: basePerson.fullName,
    identificationType: basePerson.identificationType,
    identificationNumber: basePerson.identificationNumber,
    dateOfBirth: basePerson.dateOfBirth,
    personType: PersonType.Professional,
    exequatur: 'EXEQ-12345',
    feeType: ProfessionalFeeType.Fixed,
    fee: 100,
    providedService: {
      __typename: 'ProvidedService',
      id: generateId(),
      name: 'Psychologist',
      baseCost: 100,
    },
    contactInfo: basePerson.contactInfo,
    appointments: {
      __typename: 'AppointmentsConnection',
      edges: [],
      pageInfo: {
        __typename: 'PageInfo',
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
    },
    officeAssignments: {
      __typename: 'OfficeAssignmentsConnection',
      edges: [],
      pageInfo: {
        __typename: 'PageInfo',
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
    },
    ...overrides,
  }
}

export function createMockAppointmentRecurrence(
  overrides?: Partial<AppointmentRecurrence>
): AppointmentRecurrence {
  return {
    __typename: 'AppointmentRecurrence',
    id: generateId(),
    appointmentId: generateId(),
    recurringType: AppointmentRecurrenceType.Weekly,
    weekDays: [1, 3, 5], // Monday, Wednesday, Friday
    ...overrides,
  }
}

export function createMockAppointmentInstance(
  overrides?: Partial<AppointmentInstance>
): AppointmentInstance {
  const startAt = generateDate(1) // Tomorrow

  return {
    __typename: 'AppointmentInstance',
    id: generateId(),
    appointmentId: generateId(),
    startAt: startAt.toISOString(),
    debits: [],
    payments: [],
    professional: createMockProfessional(),
    providedService: {
      __typename: 'ProvidedService',
      id: generateId(),
      name: 'Psychologist',
      baseCost: 100,
    },
    endAt: new Date(startAt.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour later
    status: AppointmentInstanceStatus.Confirmed,
    createdAt: generateDate(-30).toISOString(),
    updatedAt: generateDate(-1).toISOString(),
    // appointment removed if not in type
    ...overrides,
  }
}

export function createMockAppointment(overrides?: Partial<Appointment>): Appointment {
  const startAt = generateDate(1) // Tomorrow
  const patient = createMockPatient()
  const professional = createMockProfessional()

  return {
    __typename: 'Appointment',
    id: generateId(),
    description: 'Test appointment',
    startAt: startAt.toISOString(),
    endAt: new Date(startAt.getTime() + 60 * 60 * 1000).toISOString(),
    duration: 60,
    isActive: true,
    isRecurrent: false,
    recurrence: null,
    patient,
    professional,
    instances: {
      __typename: 'InstancesConnection',
      edges: [],
      pageInfo: {
        __typename: 'PageInfo',
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
    },
    createdAt: generateDate(-30).toISOString(),
    updatedAt: generateDate(-1).toISOString(),
    ...overrides,
  }
}

export function createMockUser(overrides?: Partial<User>): User {
  return {
    __typename: 'User',
    id: generateId(),
    email: 'user@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    fullName: 'Test User',
    status: UserStatus.Active,
    roles: [],
    permissions: [],
    ...overrides,
  }
}

export function createMockOffice(overrides?: Partial<Office>): Office {
  return {
    __typename: 'Office',
    id: generateId(),
    name: 'Main Office',
    capacity: 10,
    active: true,
    assignments: {
      __typename: 'AssignmentsConnection',
      edges: [],
      pageInfo: {
        __typename: 'PageInfo',
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
    },
    ...overrides,
  }
}

export function createMockPatientParent(overrides?: Partial<PatientParent>): PatientParent {
  const basePerson = createMockPerson({ firstName: 'Parent', lastName: 'Name' })

  return {
    __typename: 'PatientParent',
    id: basePerson.id,
    personId: basePerson.personId,
    firstName: basePerson.firstName,
    lastName: basePerson.lastName,
    fullName: basePerson.fullName,
    identificationType: basePerson.identificationType,
    identificationNumber: basePerson.identificationNumber,
    dateOfBirth: basePerson.dateOfBirth,
    personType: PersonType.Parent,
    relationship: PersonRelationShipType.Mother,
    contactInfo: basePerson.contactInfo,
    ...overrides,
  }
}

export function createMockPrepaidPlan(overrides?: Partial<PrepaidPlan>): PrepaidPlan {
  const cost = 1000
  const discount = 0.1

  return {
    __typename: 'PrepaidPlan',
    id: generateId(),
    name: 'Standard Plan',
    description: '10 sessions of therapy',
    cost,
    discount,
    netCost: cost * (1 - discount),
    sessionsCount: 10,
    expirationDays: 90,
    providedServiceId: generateId(),
    ...overrides,
  }
}

export function createMockPatientPrepaidPlan(
  overrides?: Partial<PatientPrepaidPlan>
): PatientPrepaidPlan {
  return {
    __typename: 'PatientPrepaidPlan',
    id: generateId(),
    planId: generateId() as any,
    planName: 'Standard Plan',
    planDescription: '10 sessions of therapy',
    planCost: 900,
    sessionsRemaining: 10,
    expiresAt: generateDate(90).toISOString(),
    status: PrepaidPlanStatus.Active,
    createdAt: generateDate(-1).toISOString(),
    payments: [],
    transactions: [],
    ...overrides,
  }
}

export function createMockAppModule(overrides?: Partial<AppModule>): AppModule {
  return {
    id: generateId(),
    name: 'Test Module',
    iconName: 'Home',
    path: '/test',
    order: 1,
    children: [],
    ...overrides,
  }
}
