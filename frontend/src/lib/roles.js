export const ROLE = {
  ADMIN: 'Admin',
  RECRUITER: 'Recruiter',
  HIRING_MANAGER: 'HiringManager',
  CANDIDATE: 'Candidate',
};

const ROLE_ALIASES = {
  admin: ROLE.ADMIN,
  administrator: ROLE.ADMIN,
  companyadmin: ROLE.ADMIN,
  companyadministrator: ROLE.ADMIN,
  recruiter: ROLE.RECRUITER,
  hiringmanager: ROLE.HIRING_MANAGER,
  hiring_manager: ROLE.HIRING_MANAGER,
  hiring: ROLE.HIRING_MANAGER,
  candidate: ROLE.CANDIDATE,
};

const DASHBOARD_PATHS = {
  [ROLE.ADMIN]: '/admin/company',
  [ROLE.RECRUITER]: '/recruiter/home',
  [ROLE.HIRING_MANAGER]: '/hiring-manager',
  [ROLE.CANDIDATE]: '/candidate',
};

const DEV_EMAIL_ROLE_OVERRIDES = {
  'yasa@gmail.com': ROLE.RECRUITER,
};

export function normalizeRole(value) {
  if (!value) return null;

  const key = String(value).trim().replace(/[\s-]/g, '').toLowerCase();
  return ROLE_ALIASES[key] || String(value).trim();
}

export function getProfileRole(profile, session) {
  const email = session?.user?.email?.toLowerCase();

  if (email && DEV_EMAIL_ROLE_OVERRIDES[email]) {
    return DEV_EMAIL_ROLE_OVERRIDES[email];
  }

  return normalizeRole(profile?.role || profile?.roleName);
}

export function getDashboardPathForRole(role) {
  return DASHBOARD_PATHS[normalizeRole(role)] || '/dashboard';
}
