import { describe, it, expect } from 'vitest'
import { USER_ROLES, roleToHomeRouteMap } from './roles'
import { ROUTE_NAMES } from '@/constants/routes'

describe('Role Configuration', () => {
  it('should define the correct role strings', () => {
    expect(USER_ROLES.ADM_USER).toBe('adm_user')
    expect(USER_ROLES.LITERATURE_USER).toBe('literature_user')
  })

  it('should map roles to the correct home route names', () => {
    expect(roleToHomeRouteMap[USER_ROLES.ADM_USER]).toBe(ROUTE_NAMES.VWV.START_PAGE)
    expect(roleToHomeRouteMap[USER_ROLES.LITERATURE_USER]).toBe(ROUTE_NAMES.ULI.START_PAGE)
  })

  it('should have a home route mapping for every defined user role', () => {
    const definedRoles = Object.values(USER_ROLES)
    const mappedRoles = Object.keys(roleToHomeRouteMap)

    expect(mappedRoles).toEqual(expect.arrayContaining(definedRoles))
    expect(mappedRoles.length).toBe(definedRoles.length)
  })
})
