export type UserRole = 'super_admin' | 'admin_torneo' | 'arbitro' | 'capitan' | 'jugador';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  super_admin: 5,
  admin_torneo: 4,
  arbitro: 3,
  capitan: 2,
  jugador: 1,
};

export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function isSuperAdmin(role: UserRole): boolean {
  return role === 'super_admin';
}

export function isAdminTorneo(role: UserRole): boolean {
  return role === 'admin_torneo';
}

export function isArbitro(role: UserRole): boolean {
  return role === 'arbitro';
}

export function isCapitan(role: UserRole): boolean {
  return role === 'capitan';
}

export function isJugador(role: UserRole): boolean {
  return role === 'jugador';
}

export function canManageTorneos(role: UserRole): boolean {
  return role === 'super_admin' || role === 'admin_torneo';
}

export function canManageEquipos(role: UserRole): boolean {
  return role === 'super_admin' || role === 'admin_torneo' || role === 'capitan';
}

export function canManagePartidos(role: UserRole): boolean {
  return role === 'super_admin' || role === 'admin_torneo' || role === 'arbitro';
}

export function canViewAdminPanel(role: UserRole): boolean {
  return role === 'super_admin' || role === 'admin_torneo';
}
