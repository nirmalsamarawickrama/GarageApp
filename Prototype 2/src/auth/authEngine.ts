import { User, UserRole, Permission, PinResetRequest, PasswordResetSession } from '../types';
import { hasPermission } from './permissions';
import { syncEngine } from '../state/syncEngine';

const STORAGE_KEYS = {
  CURRENT_USER: 'autopulse_v2_current_user_session',
  PERSISTENT_SESSION: 'autopulse_v2_remembered_session',
  CACHED_USERS: 'autopulse_v2_cached_users',
  PIN_REQUESTS: 'autopulse_v2_pin_reset_requests',
  GLOBAL_CLOUD_USERS: 'autopulse_v2_global_cloud_users',
  PASSWORD_RESETS: 'autopulse_v2_password_resets',
};

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function createUniqueUserId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export interface PasswordStrengthResult {
  score: number;
  level: 'Weak' | 'Fair' | 'Good' | 'Strong';
  isValid: boolean;
  checks: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
  errors: string[];
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9\s]/.test(password);

  let score = 0;
  if (minLength) score++;
  if (hasUppercase && hasLowercase) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;

  const errors: string[] = [];
  if (!minLength) errors.push('At least 8 characters long');
  if (!hasUppercase) errors.push('At least 1 uppercase letter (A-Z)');
  if (!hasLowercase) errors.push('At least 1 lowercase letter (a-z)');
  if (!hasNumber) errors.push('At least 1 number (0-9)');
  if (!hasSpecial) errors.push('At least 1 special character (e.g. !@#$%^&*)');

  const isValid = minLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;

  let level: 'Weak' | 'Fair' | 'Good' | 'Strong' = 'Weak';
  if (score === 4) level = 'Strong';
  else if (score === 3) level = 'Good';
  else if (score === 2) level = 'Fair';

  return {
    score,
    level,
    isValid,
    checks: {
      minLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecial,
    },
    errors,
  };
}

export const DEMO_USERS: User[] = [
  {
    id: 'user-owner-1',
    name: 'Sarah Sterling',
    username: 'sarah.sterling',
    email: 'sarah.owner@autopulse.io',
    password: 'AutoPulse@2026!',
    role: 'OWNER',
    branchId: 'branch-1',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    pinCode: '1111',
    phone: '+1 (555) 019-2831',
    jobTitle: 'Franchise & Garage Network Owner',
    isCloudSynced: true,
  },
  {
    id: 'user-mgr-1',
    name: 'Marcus Vance',
    username: 'marcus.vance',
    email: 'marcus.mgr@autopulse.io',
    password: 'AutoPulse@2026!',
    role: 'MANAGER',
    branchId: 'branch-1',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    pinCode: '2222',
    phone: '+1 (555) 014-9921',
    jobTitle: 'Head Workshop Foreman & Service Lead',
    isCloudSynced: true,
  },
  {
    id: 'user-mech-1',
    name: 'Dave Miller',
    username: 'dave.miller',
    email: 'dave.tech@autopulse.io',
    password: 'AutoPulse@2026!',
    role: 'MECHANIC',
    branchId: 'branch-1',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    pinCode: '3333',
    phone: '+1 (555) 018-4422',
    jobTitle: 'Master Bay Technician (Lift Station 2)',
    isCloudSynced: true,
  },
  {
    id: 'user-acct-1',
    name: 'Elena Rostova',
    username: 'elena.rostova',
    email: 'elena.acct@autopulse.io',
    password: 'AutoPulse@2026!',
    role: 'ACCOUNTANT',
    branchId: 'branch-1',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    pinCode: '4444',
    phone: '+1 (555) 017-3319',
    jobTitle: 'Senior Financial Auditor & Invoicing Lead',
    isCloudSynced: true,
  },
  {
    id: 'user-it-1',
    name: 'Alex Chen',
    username: 'alex.chen',
    email: 'alex.admin@autopulse.io',
    password: 'AutoPulse@2026!',
    role: 'IT_ADMIN',
    branchId: 'branch-1',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    pinCode: '5555',
    phone: '+1 (555) 012-7788',
    jobTitle: 'Systems Engineer & Offline Sync Architect',
    isCloudSynced: true,
  },
];

function cloneDemoUsers(): User[] {
  return DEMO_USERS.map((u) => ({ ...u }));
}

function createInitialPinRequests(): PinResetRequest[] {
  return [
    {
      id: 'req-01',
      userId: 'user-mech-1',
      userName: 'Dave Miller',
      userRole: 'MECHANIC',
      userEmail: 'dave.tech@autopulse.io',
      requestedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      status: 'PENDING',
    },
  ];
}

class AuthEngine {
  private currentUser: User | null = null;
  private rememberSession = false;
  private users: User[] = cloneDemoUsers();
  private globalCloudUsers: User[] = cloneDemoUsers();
  private pinRequests: PinResetRequest[] = createInitialPinRequests();
  private passwordResetSessions: PasswordResetSession[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadSession();
    this.initMutationListener();
  }

  private initMutationListener() {
    if (typeof window !== 'undefined') {
      window.addEventListener('autopulse:user_mutation', (e: Event) => {
        const customEvent = e as CustomEvent<{
          action?: string;
          payload?: Partial<User> & { id: string };
        }>;
        const mutation = customEvent.detail;
        if (!mutation?.payload || !mutation.payload.id) return;

        if (mutation.action === 'CREATE') {
          const newUser = mutation.payload as User;
          if (!this.users.some((u) => u.id === newUser.id)) {
            this.users = [newUser, ...this.users];
          }
          if (!this.globalCloudUsers.some((u) => u.id === newUser.id)) {
            this.globalCloudUsers = [newUser, ...this.globalCloudUsers];
          }
          this.saveState();
        } else if (mutation.action === 'UPDATE') {
          const patch = mutation.payload;
          this.users = this.users.map((u) =>
            u.id === patch.id ? { ...u, ...patch } : u
          );
          this.globalCloudUsers = this.globalCloudUsers.map((u) =>
            u.id === patch.id ? { ...u, ...patch } : u
          );
          if (this.currentUser?.id === patch.id) {
            this.currentUser = { ...this.currentUser, ...patch };
          }
          this.saveState();
        }
      });
    }
  }

  private hydrateUser(u: User): User {
    const demo = DEMO_USERS.find(
      (d) => d.id === u.id || d.email.toLowerCase() === u.email.toLowerCase()
    );
    return {
      ...u,
      username: u.username || demo?.username || u.email.split('@')[0].toLowerCase(),
      password: u.password || demo?.password || 'AutoPulse@2026!',
      avatarUrl:
        u.avatarUrl ||
        demo?.avatarUrl ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    };
  }

  private loadSession() {
    try {
      const storedUsers = localStorage.getItem(STORAGE_KEYS.CACHED_USERS);
      if (storedUsers) {
        const parsed: User[] = JSON.parse(storedUsers);
        this.users = parsed.map((u) => this.hydrateUser(u));
      } else {
        this.users = cloneDemoUsers();
        localStorage.setItem(STORAGE_KEYS.CACHED_USERS, JSON.stringify(this.users));
      }

      const storedCloud = localStorage.getItem(STORAGE_KEYS.GLOBAL_CLOUD_USERS);
      if (storedCloud) {
        const parsedCloud: User[] = JSON.parse(storedCloud);
        this.globalCloudUsers = parsedCloud.map((u) => this.hydrateUser(u));
      } else {
        this.globalCloudUsers = cloneDemoUsers();
        localStorage.setItem(STORAGE_KEYS.GLOBAL_CLOUD_USERS, JSON.stringify(this.globalCloudUsers));
      }

      const storedRequests = localStorage.getItem(STORAGE_KEYS.PIN_REQUESTS);
      if (storedRequests) {
        this.pinRequests = JSON.parse(storedRequests);
      } else {
        this.pinRequests = createInitialPinRequests();
        localStorage.setItem(STORAGE_KEYS.PIN_REQUESTS, JSON.stringify(this.pinRequests));
      }

      const storedResets = localStorage.getItem(STORAGE_KEYS.PASSWORD_RESETS);
      if (storedResets) {
        this.passwordResetSessions = JSON.parse(storedResets);
      }

      const storedUser = sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (storedUser) {
        const parsed: User = JSON.parse(storedUser);
        this.currentUser = this.hydrateUser(parsed);
      } else {
        const rememberedRaw = localStorage.getItem(STORAGE_KEYS.PERSISTENT_SESSION);
        if (rememberedRaw) {
          const remembered = JSON.parse(rememberedRaw) as {
            user?: User;
            expiresAt?: number;
          };
          if (remembered.user && remembered.expiresAt && remembered.expiresAt > Date.now()) {
            this.currentUser = this.hydrateUser(remembered.user);
            this.rememberSession = true;
          } else {
            localStorage.removeItem(STORAGE_KEYS.PERSISTENT_SESSION);
            this.currentUser = null;
          }
        } else {
          this.currentUser = null;
        }
      }
    } catch {
      this.currentUser = null;
      this.users = cloneDemoUsers();
      this.globalCloudUsers = cloneDemoUsers();
      this.pinRequests = createInitialPinRequests();
      this.passwordResetSessions = [];
    }
  }

  private saveState() {
    try {
      localStorage.setItem(STORAGE_KEYS.CACHED_USERS, JSON.stringify(this.users));
      localStorage.setItem(STORAGE_KEYS.GLOBAL_CLOUD_USERS, JSON.stringify(this.globalCloudUsers));
      localStorage.setItem(STORAGE_KEYS.PIN_REQUESTS, JSON.stringify(this.pinRequests));
      localStorage.setItem(STORAGE_KEYS.PASSWORD_RESETS, JSON.stringify(this.passwordResetSessions));
      if (this.currentUser) {
        sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
        if (this.rememberSession) {
          localStorage.setItem(
            STORAGE_KEYS.PERSISTENT_SESSION,
            JSON.stringify({
              user: this.currentUser,
              expiresAt: Date.now() + THIRTY_DAYS_MS,
            })
          );
        } else {
          localStorage.removeItem(STORAGE_KEYS.PERSISTENT_SESSION);
        }
      } else {
        sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        localStorage.removeItem(STORAGE_KEYS.PERSISTENT_SESSION);
      }
    } catch (e) {
      console.error('Failed to save auth state', e);
    }
    this.notify();
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Returns list of cached users for this device.
   * Zero-Knowledge Policy: other users' PIN codes and passwords are redacted.
   */
  public getAvailableUsers(): User[] {
    return this.users.map((u) => {
      if (!this.currentUser || u.id !== this.currentUser.id) {
        return {
          ...u,
          pinCode: undefined,
          password: undefined,
        };
      }
      return u;
    });
  }

  public getGlobalCloudUsers(): User[] {
    return this.globalCloudUsers.map((u) => ({
      ...u,
      pinCode: undefined,
      password: undefined,
    }));
  }

  private buildUniqueUsername(base: string): string {
    const cleanBase = base.toLowerCase().replace(/[^a-z0-9._-]/g, '') || 'operator';
    const isTaken = (candidate: string) =>
      this.globalCloudUsers.some(
        (u) => u.username && u.username.toLowerCase() === candidate
      );
    if (!isTaken(cleanBase)) return cleanBase;
    let counter = 2;
    while (isTaken(`${cleanBase}${counter}`)) {
      counter++;
    }
    return `${cleanBase}${counter}`;
  }

  // Desktop Web Authentication (Username/Email & Strong Password)
  public loginWithCredentials(
    identifier: string,
    password: string,
    rememberWorkstation = false
  ): { success: boolean; user?: User; error?: string } {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanId || !cleanPass) {
      return { success: false, error: 'Please enter your username/email and password.' };
    }

    let matched = this.users.find(
      (u) =>
        (u.username && u.username.toLowerCase() === cleanId) ||
        (u.email && u.email.toLowerCase() === cleanId)
    );

    let fromCloudOnly = false;
    if (!matched) {
      const cloudMatched = this.globalCloudUsers.find(
        (u) =>
          (u.username && u.username.toLowerCase() === cleanId) ||
          (u.email && u.email.toLowerCase() === cleanId)
      );

      if (cloudMatched) {
        matched = cloudMatched;
        fromCloudOnly = true;
      }
    }

    if (!matched) {
      return {
        success: false,
        error: 'No account found matching this username or email address.',
      };
    }

    const expectedPass = (matched.password || 'AutoPulse@2026!').trim();
    if (expectedPass !== cleanPass) {
      return {
        success: false,
        error: 'Incorrect password. Click "Forgot Password?" if you need to reset.',
      };
    }

    if (fromCloudOnly) {
      this.users = [matched, ...this.users];
    }

    this.rememberSession = rememberWorkstation;
    this.currentUser = matched;
    syncEngine.recordAuditEvent(`Operator ${matched.name} (${matched.role}) signed in via desktop portal`, 'SECURITY', false);
    this.saveState();
    return { success: true, user: matched };
  }

  public registerDesktopUser(userData: {
    name: string;
    username: string;
    email: string;
    role: UserRole;
    branchId: string;
    password: string;
    phone?: string;
    jobTitle?: string;
    pinCode?: string;
  }): { success: boolean; user?: User; error?: string } {
    const nameTrim = userData.name.trim();
    const usernameTrim = userData.username.trim().toLowerCase();
    const emailTrim = userData.email.trim().toLowerCase();
    const pass = userData.password.trim();

    if (!nameTrim) {
      return { success: false, error: 'Full legal/display name is required.' };
    }

    if (!usernameTrim || usernameTrim.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters long.' };
    }

    if (!/^[a-z0-9._-]+$/.test(usernameTrim)) {
      return {
        success: false,
        error: 'Username can only contain alphanumeric characters, dots, hyphens, and underscores.',
      };
    }

    if (!emailTrim || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      return { success: false, error: 'A valid work email address is required.' };
    }

    const strength = evaluatePasswordStrength(pass);
    if (!strength.isValid) {
      return {
        success: false,
        error: `Password does not meet strong policy requirements: ${strength.errors.join(', ')}.`,
      };
    }

    const usernameTaken = this.globalCloudUsers.some(
      (u) => u.username && u.username.toLowerCase() === usernameTrim
    );
    if (usernameTaken) {
      return { success: false, error: `The username "${usernameTrim}" is already taken.` };
    }

    const emailTaken = this.globalCloudUsers.some(
      (u) => u.email && u.email.toLowerCase() === emailTrim
    );
    if (emailTaken) {
      return { success: false, error: `An account with email "${emailTrim}" already exists.` };
    }

    const pin =
      userData.pinCode && /^\d{4}$/.test(userData.pinCode)
        ? userData.pinCode
        : Math.floor(1000 + Math.random() * 9000).toString();

    const avatarUrl =
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

    const newUser: User = {
      id: createUniqueUserId('user'),
      name: nameTrim,
      username: usernameTrim,
      email: emailTrim,
      password: pass,
      role: userData.role,
      branchId: userData.branchId,
      pinCode: pin,
      phone: userData.phone || '+1 (555) 012-3456',
      jobTitle: userData.jobTitle || `${userData.role} Specialist`,
      avatarUrl,
      isCloudSynced: syncEngine.getIsOnline(),
      registeredAt: new Date().toISOString(),
    };

    this.users = [newUser, ...this.users];
    this.globalCloudUsers = [newUser, ...this.globalCloudUsers];
    syncEngine.queueUserMutation('CREATE', newUser);
    syncEngine.recordAuditEvent(`Registered new user ${newUser.name} (${newUser.role})`, 'SECURITY', false);
    this.currentUser = newUser;
    this.saveState();

    return { success: true, user: newUser };
  }

  // Password Recovery Workflow
  public requestPasswordRecovery(identifier: string): {
    success: boolean;
    session?: PasswordResetSession;
    code?: string;
    user?: User;
    error?: string;
  } {
    const clean = identifier.trim().toLowerCase();
    if (!clean) {
      return { success: false, error: 'Please enter your username or work email.' };
    }

    const target = this.globalCloudUsers.find(
      (u) =>
        (u.username && u.username.toLowerCase() === clean) ||
        (u.email && u.email.toLowerCase() === clean)
    );

    if (!target) {
      return {
        success: false,
        error: 'No active staff account found matching that username or email address.',
      };
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const session: PasswordResetSession = {
      id: createUniqueUserId('reset-sess'),
      userId: target.id,
      userName: target.name,
      userEmail: target.email,
      username: target.username || target.email.split('@')[0],
      verificationCode,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      status: 'PENDING',
    };

    this.passwordResetSessions = [
      session,
      ...this.passwordResetSessions.filter((s) => s.userId !== target.id),
    ];
    syncEngine.recordAuditEvent(`Password recovery OTP issued for ${target.email}`, 'SECURITY', false);
    this.saveState();

    return {
      success: true,
      session,
      code: verificationCode,
      user: target,
    };
  }

  public verifyRecoveryCode(
    identifier: string,
    code: string
  ): { success: boolean; session?: PasswordResetSession; error?: string } {
    const clean = identifier.trim().toLowerCase();
    const cleanCode = code.trim();

    const session = this.passwordResetSessions.find(
      (s) =>
        (s.username.toLowerCase() === clean || s.userEmail.toLowerCase() === clean) &&
        (s.status === 'PENDING' || s.status === 'VERIFIED')
    );

    if (!session) {
      return { success: false, error: 'No active recovery session found for this account.' };
    }

    if (new Date(session.expiresAt).getTime() < Date.now()) {
      return { success: false, error: 'The recovery code has expired. Please request a new one.' };
    }

    if (session.verificationCode !== cleanCode) {
      return { success: false, error: 'Invalid verification code. Please check and try again.' };
    }

    session.status = 'VERIFIED';
    this.saveState();
    return { success: true, session };
  }

  public completePasswordReset(
    identifier: string,
    code: string,
    newPassword: string
  ): { success: boolean; user?: User; error?: string } {
    const clean = identifier.trim().toLowerCase();
    const cleanCode = code.trim();
    const cleanNewPass = newPassword.trim();

    const strength = evaluatePasswordStrength(cleanNewPass);
    if (!strength.isValid) {
      return {
        success: false,
        error: `Password does not meet strong policy: ${strength.errors.join(', ')}`,
      };
    }

    const session = this.passwordResetSessions.find(
      (s) =>
        (s.username.toLowerCase() === clean || s.userEmail.toLowerCase() === clean) &&
        s.status !== 'COMPLETED'
    );

    if (!session) {
      return { success: false, error: 'No active recovery session found.' };
    }

    if (new Date(session.expiresAt).getTime() < Date.now()) {
      return { success: false, error: 'The recovery code has expired. Please request a new one.' };
    }

    if (!cleanCode || session.verificationCode !== cleanCode) {
      return { success: false, error: 'Invalid verification code for this recovery session.' };
    }

    const userIndex = this.users.findIndex((u) => u.id === session.userId);
    if (userIndex !== -1) {
      this.users[userIndex] = { ...this.users[userIndex], password: cleanNewPass };
    }

    const cloudIndex = this.globalCloudUsers.findIndex((u) => u.id === session.userId);
    if (cloudIndex !== -1) {
      this.globalCloudUsers[cloudIndex] = {
        ...this.globalCloudUsers[cloudIndex],
        password: cleanNewPass,
      };
    }

    const updatedUser =
      (userIndex !== -1 ? this.users[userIndex] : undefined) ||
      (cloudIndex !== -1 ? this.globalCloudUsers[cloudIndex] : undefined);

    if (!updatedUser) {
      return { success: false, error: 'Associated user account could not be located.' };
    }

    if (userIndex === -1) {
      this.users = [updatedUser, ...this.users];
    }

    session.status = 'COMPLETED';
    syncEngine.queueUserMutation('UPDATE', updatedUser);
    syncEngine.recordAuditEvent(`Password updated via OTP recovery for ${updatedUser.email}`, 'SECURITY', false);
    this.currentUser = updatedUser;

    this.saveState();
    return { success: true, user: updatedUser };
  }

  public getPasswordResetSessions(): PasswordResetSession[] {
    return this.passwordResetSessions;
  }

  // Mobile Registration & Global Cloud Linking
  public registerNewUser(userData: {
    name: string;
    email: string;
    role: UserRole;
    branchId: string;
    pinCode: string;
    phone?: string;
    jobTitle?: string;
    avatarUrl?: string;
  }): { success: boolean; user?: User; error?: string } {
    const nameTrim = userData.name.trim();
    const emailNorm = userData.email.trim().toLowerCase();

    if (!nameTrim) {
      return { success: false, error: 'Full name is required.' };
    }

    if (!emailNorm || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
      return { success: false, error: 'A valid work email address is required.' };
    }

    const existing = this.globalCloudUsers.find((u) => u.email.trim().toLowerCase() === emailNorm);
    if (existing) {
      return {
        success: false,
        error: `An account with ${userData.email} already exists in the cloud directory.`,
      };
    }

    if (!userData.pinCode || !/^\d{4}$/.test(userData.pinCode)) {
      return {
        success: false,
        error: 'A 4-digit numeric PIN is required for workshop tablet access.',
      };
    }

    const defaultAvatar =
      userData.avatarUrl ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

    const newUser: User = {
      id: createUniqueUserId('user'),
      name: nameTrim,
      username: this.buildUniqueUsername(emailNorm.split('@')[0]),
      email: emailNorm,
      password: 'AutoPulse@2026!',
      role: userData.role,
      branchId: userData.branchId,
      pinCode: userData.pinCode,
      phone: userData.phone || '+1 (555) 000-0000',
      jobTitle: userData.jobTitle || `${userData.role} Specialist`,
      avatarUrl: defaultAvatar,
      isCloudSynced: syncEngine.getIsOnline(),
      registeredAt: new Date().toISOString(),
    };

    this.users = [newUser, ...this.users];
    this.globalCloudUsers = [newUser, ...this.globalCloudUsers];
    syncEngine.queueUserMutation('CREATE', newUser);
    syncEngine.recordAuditEvent(`Registered terminal user ${newUser.name} (${newUser.role})`, 'SECURITY', false);
    this.currentUser = newUser;
    this.saveState();

    return { success: true, user: newUser };
  }

  public linkExistingCloudAccount(
    email: string,
    pin: string
  ): {
    success: boolean;
    user?: User;
    error?: string;
  } {
    const emailNorm = email.trim().toLowerCase();
    const target = this.globalCloudUsers.find((u) => u.email.trim().toLowerCase() === emailNorm);

    if (!target) {
      return {
        success: false,
        error: 'No account found matching this email address in the cloud directory.',
      };
    }

    if (target.pinCode !== pin) {
      return { success: false, error: 'Incorrect 4-digit PIN for ' + target.name };
    }

    if (!this.users.some((u) => u.id === target.id)) {
      this.users = [target, ...this.users];
    }

    this.currentUser = target;
    syncEngine.recordAuditEvent(`Linked existing cloud operator ${target.name} to terminal`, 'SECURITY', false);
    this.saveState();

    return { success: true, user: target };
  }

  public loginWithEmail(email: string, password: string): { success: boolean; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = (password ?? '').trim();

    if (!cleanEmail || !cleanPass) {
      return { success: false, error: 'Email and password are required.' };
    }

    let matched = this.users.find(
      (u) => u.email.trim().toLowerCase() === cleanEmail
    );
    let fromCloudOnly = false;
    if (!matched) {
      matched = this.globalCloudUsers.find(
        (u) => u.email.trim().toLowerCase() === cleanEmail
      );
      fromCloudOnly = !!matched;
    }

    if (!matched) {
      return { success: false, error: 'User account not found' };
    }

    const expectedPass = (matched.password || 'AutoPulse@2026!').trim();
    if (cleanPass !== expectedPass) {
      return { success: false, error: 'Incorrect password for this account' };
    }

    if (fromCloudOnly) {
      this.users = [matched, ...this.users];
    }

    this.rememberSession = false;
    this.currentUser = matched;
    syncEngine.recordAuditEvent(`Operator ${matched.name} signed in via email/password`, 'SECURITY', false);
    this.saveState();
    return { success: true };
  }

  public loginWithPin(pin: string): { success: boolean; user?: User; error?: string } {
    const matched = this.users.find((u) => u.pinCode === pin);
    if (matched) {
      this.rememberSession = false;
      this.currentUser = matched;
      syncEngine.recordAuditEvent(`Operator ${matched.name} unlocked bay terminal with PIN`, 'SECURITY', false);
      this.saveState();
      return { success: true, user: matched };
    }
    return { success: false, error: 'Invalid 4-digit PIN code' };
  }

  public loginAsRole(role: UserRole): User {
    const user = this.users.find((u) => u.role === role) || this.users[0];
    this.rememberSession = false;
    this.currentUser = user;
    this.saveState();
    return user;
  }

  public verifyAndSwitchUser(
    userId: string,
    pin: string
  ): { success: boolean; user?: User; error?: string } {
    const user = this.users.find((u) => u.id === userId);
    if (!user) {
      return { success: false, error: 'User account not found' };
    }
    if (user.pinCode !== pin) {
      return { success: false, error: 'Incorrect 4-digit PIN for ' + user.name };
    }
    this.rememberSession = false;
    this.currentUser = user;
    syncEngine.recordAuditEvent(`Switched active terminal operator to ${user.name}`, 'SECURITY', false);
    this.saveState();
    return { success: true, user };
  }

  public loginAsUser(userId: string): boolean {
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      this.rememberSession = false;
      this.currentUser = user;
      this.saveState();
      return true;
    }
    return false;
  }

  public logout(): void {
    const name = this.currentUser?.name;
    this.currentUser = null;
    this.rememberSession = false;
    try {
      sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem(STORAGE_KEYS.PERSISTENT_SESSION);
    } catch {
      // ignore storage failure
    }
    if (name) {
      syncEngine.recordAuditEvent(`Operator ${name} signed out`, 'SECURITY', false);
    }
    this.saveState();
  }

  // Two-Way Secure PIN Reset Workflow
  public getAllPinResetRequests(): PinResetRequest[] {
    return this.pinRequests;
  }

  public getPendingPinResetRequests(): PinResetRequest[] {
    return this.pinRequests.filter((r) => r.status === 'PENDING');
  }

  public getActiveRequestForUser(userId: string): PinResetRequest | undefined {
    return this.pinRequests.find(
      (r) => r.userId === userId && (r.status === 'PENDING' || r.status === 'PROMPTED')
    );
  }

  public requestPinReset(userId: string): {
    success: boolean;
    message: string;
    request?: PinResetRequest;
  } {
    const user = this.users.find((u) => u.id === userId);
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    const existingActive = this.getActiveRequestForUser(userId);
    if (existingActive) {
      if (existingActive.status === 'PROMPTED') {
        return {
          success: true,
          message: 'An approved reset prompt is already active. You can set your new PIN now.',
          request: existingActive,
        };
      }
      return {
        success: false,
        message: 'A PIN reset request is already pending review with your IT Administrator.',
      };
    }

    const newRequest: PinResetRequest = {
      id: createUniqueUserId('req'),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      userEmail: user.email,
      requestedAt: new Date().toISOString(),
      status: 'PENDING',
    };

    this.pinRequests = [newRequest, ...this.pinRequests];
    syncEngine.recordAuditEvent(`PIN reset request submitted for ${user.name}`, 'SECURITY', false);
    this.saveState();

    return {
      success: true,
      message: 'PIN reset request sent to IT Administrator for authorization.',
      request: newRequest,
    };
  }

  public sendResetPrompt(requestId: string): {
    success: boolean;
    message: string;
    verificationCode?: string;
  } {
    if (this.currentUser && !hasPermission(this.currentUser, 'system:manage_users')) {
      return {
        success: false,
        message: 'Permission denied: IT Administrator authorization required.',
      };
    }

    const reqIndex = this.pinRequests.findIndex((r) => r.id === requestId);
    if (reqIndex === -1) {
      return { success: false, message: 'Reset request not found.' };
    }

    const req = this.pinRequests[reqIndex];
    if (req.status !== 'PENDING') {
      return { success: false, message: 'Reset request is no longer pending.' };
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    this.pinRequests[reqIndex] = {
      ...req,
      status: 'PROMPTED',
      verificationCode,
      promptedAt: new Date().toISOString(),
    };

    syncEngine.recordAuditEvent(
      `IT Admin dispatched PIN reset prompt for ${req.userName} (Token: ${verificationCode})`,
      'SECURITY',
      false
    );
    this.saveState();
    return {
      success: true,
      verificationCode,
      message: `Reset prompt dispatched to ${req.userName}. Dispatch code: ${verificationCode}`,
    };
  }

  public completePinReset(
    userId: string,
    newPin: string,
    verification?: { dispatchCode?: string; password?: string }
  ): { success: boolean; message: string } {
    if (!/^\d{4}$/.test(newPin)) {
      return { success: false, message: 'PIN must be exactly 4 numeric digits.' };
    }

    const userIndex = this.users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return { success: false, message: 'User not found.' };
    }

    const reqIndex = this.pinRequests.findIndex(
      (r) => r.userId === userId && r.status === 'PROMPTED'
    );
    if (reqIndex === -1) {
      return {
        success: false,
        message: 'No IT-approved reset prompt is active for this account.',
      };
    }

    const activeReq = this.pinRequests[reqIndex];
    const targetUser = this.users[userIndex];
    const isSelfAuthenticated = this.currentUser?.id === userId;

    if (!isSelfAuthenticated) {
      const codeMatches =
        !!activeReq.verificationCode &&
        verification?.dispatchCode?.trim() === activeReq.verificationCode;
      const passwordMatches =
        !!verification?.password?.trim() &&
        verification.password.trim() === (targetUser.password || 'AutoPulse@2026!').trim();

      if (!codeMatches && !passwordMatches) {
        return {
          success: false,
          message:
            'Verification required: enter the 6-digit IT dispatch code or your account password.',
        };
      }
    }

    const updatedUser: User = { ...targetUser, pinCode: newPin };
    this.users[userIndex] = updatedUser;

    const cloudIndex = this.globalCloudUsers.findIndex((u) => u.id === userId);
    if (cloudIndex !== -1) {
      this.globalCloudUsers[cloudIndex] = {
        ...this.globalCloudUsers[cloudIndex],
        pinCode: newPin,
      };
    }

    if (this.currentUser?.id === userId) {
      this.currentUser = { ...this.currentUser, pinCode: newPin };
    }

    syncEngine.queueUserMutation('UPDATE', updatedUser);

    this.pinRequests[reqIndex] = {
      ...activeReq,
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
    };

    syncEngine.recordAuditEvent(`PIN successfully updated for ${updatedUser.name}`, 'SECURITY', false);
    this.saveState();
    return {
      success: true,
      message: 'New 4-digit PIN set successfully! You can now use it to log in.',
    };
  }

  public hasPermission(permission: Permission): boolean {
    return hasPermission(this.currentUser, permission);
  }
}

export const authEngine = new AuthEngine();
