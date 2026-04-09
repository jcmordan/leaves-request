'use client'

import { createContext, useContext, useReducer, ReactNode, useMemo } from 'react'

export interface PendingAction {
  id: string
  type: string
  severity: string
  referenceType: string
  referenceId: string
  createdAt: string
  referenceDate: string
  title: string
  description: string
  href: string | null
  metadata: Record<string, string>
  dismissed?: boolean
}

type PendingActionsState = Record<string, PendingAction[]>
type ModuleType = string

type SetActionsAction = {
  type: 'SET_ACTIONS'
  payload: { module: ModuleType; actions: PendingAction[] }
}

type DismissActionAction = {
  type: 'DISMISS_ACTION'
  payload: { module: ModuleType; id: string }
}

type SolveActionAction = {
  type: 'SOLVE_ACTION'
  payload: { module: ModuleType; id: string }
}

type ResetActionsAction = {
  type: 'RESET_ACTIONS'
  payload: { module: ModuleType }
}

type Action = SetActionsAction | DismissActionAction | SolveActionAction | ResetActionsAction

export const pendingActionsReducer = (
  state: PendingActionsState,
  action: Action
): PendingActionsState => {
  switch (action.type) {
    case 'SET_ACTIONS':
      return {
        ...state,
        [action.payload.module]: action.payload.actions,
      }
    case 'DISMISS_ACTION':
      return {
        ...state,
        [action.payload.module]: state[action.payload.module]?.map(a =>
          a.id === action.payload.id ? { ...a, dismissed: true } : a
        ),
      }
    case 'SOLVE_ACTION':
      return {
        ...state,
        [action.payload.module]: state[action.payload.module]?.filter(
          a => a.id !== action.payload.id
        ),
      }
    case 'RESET_ACTIONS':
      return {
        ...state,
        [action.payload.module]: [],
      }
    default:
      return state
  }
}

interface PendingActionsContextType {
  state: PendingActionsState
  setActions: (module: ModuleType, actions: PendingAction[]) => void
  dismissAction: (module: ModuleType, id: string) => void
  solveAction: (module: ModuleType, id: string) => void
  resetActions: (module: ModuleType) => void
}

const PendingActionsContext = createContext<PendingActionsContextType | undefined>(undefined)

export const PendingActionsProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(pendingActionsReducer, {})

  const value = useMemo(
    () => ({
      state,
      setActions: (module: ModuleType, actions: PendingAction[]) =>
        dispatch({ type: 'SET_ACTIONS', payload: { module, actions } }),
      dismissAction: (module: ModuleType, id: string) =>
        dispatch({ type: 'DISMISS_ACTION', payload: { module, id } }),
      solveAction: (module: ModuleType, id: string) =>
        dispatch({ type: 'SOLVE_ACTION', payload: { module, id } }),
      resetActions: (module: ModuleType) =>
        dispatch({ type: 'RESET_ACTIONS', payload: { module } }),
    }),
    [state]
  )

  return <PendingActionsContext.Provider value={value}>{children}</PendingActionsContext.Provider>
}

export const usePendingActions = () => {
  const context = useContext(PendingActionsContext)
  if (!context) {
    throw new Error('usePendingActions must be used within a PendingActionsProvider')
  }

  return context
}
