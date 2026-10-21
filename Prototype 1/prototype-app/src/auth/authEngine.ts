import { User, UserRole, Permission, PinResetRequest, PasswordResetSession } from '../types';
import { hasPermission } from './permissions';
import { syncEngine } from '../state/syncEngine';

const STORAGE_KEYS = {
  CURRENT_USER: 'autopulse_current_user_session',
  CACHED_USERS: 'autopulse_cached_users',
  PIN_REQUESTS: 'autopulse_pin_reset_requests',
  GLOBAL_CLOUD_USERS: 'autopulse_global_cloud_users',
  PASSWORD_RESETS: 'autopulse_password_resets',
};

export interface PasswordStrengthResult {
  score: number; // 0 to 4
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

const INITIAL_PIN_REQUESTS: PinResetRequest[] = [
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

class AuthEngine {
  private currentUser: User | null = null;
  private users: User[] = DEMO_USERS;
  private globalCloudUsers: User[] = DEMO_USERS;
  private pinRequests: PinResetRequest[] = INITIAL_PIN_REQUESTS;
  private passwordResetSessions: PasswordResetSession[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadSession();
    this.initMutationListener();
  }

  private initMutationListener() {
    if (typeof window !== 'undefined') {
      window.addEventListener('autopulse:user_mutation', (e: any) => {
        const mutation = e.detail;
        if (mutation?.payload && mutation.action === 'CREATE') {
          const newUser = mutation.payload;
          if (!this.users.some((u) => u.id === newUser.id)) {
            this.users = [newUser, ...this.users];
            this.globalCloudUsers = [newUser, ...this.globalCloudUsers];
            this.saveState();
          }
        }
      });
    }
  }

  private loadSession() {
    try {
      const storedUsers = localStorage.getItem(STORAGE_KEYS.CACHED_USERS);
      if (storedUsers) {
        const parsed: User[] = JSON.parse(storedUsers);
        // Ensure username and password are backfilled for existing cache
        this.users = parsed.map((u) => {
          const demo = DEMO_USERS.find((d) => d.id === u.id || d.email.toLowerCase() === u.email.toLowerCase());
          return {
            ...u,
            username: u.username || demo?.username || u.email.split('@')[0].toLowerCase(),
            password: u.password || demo?.password || 'AutoPulse@2026!',
          };
        });
      } else {
        this.users = DEMO_USERS;
        localStorage.setItem(STORAGE_KEYS.CACHED_USERS, JSON.stringify(DEMO_USERS));
      }

      const storedCloud = localStorage.getItem(STORAGE_KEYS.GLOBAL_CLOUD_USERS);
      if (storedCloud) {
        const parsedCloud: User[] = JSON.parse(storedCloud);
        this.globalCloudUsers = parsedCloud.map((u) => {
          const demo = DEMO_USERS.find((d) => d.id === u.id || d.email.toLowerCase() === u.email.toLowerCase());
          return {
            ...u,
            username: u.username || demo?.username || u.email.split('@')[0].toLowerCase(),
            password: u.password || demo?.password || 'AutoPulse@2026!',
          };
        });
      } else {
        this.globalCloudUsers = DEMO_USERS;
        localStorage.setItem(STORAGE_KEYS.GLOBAL_CLOUD_USERS, JSON.stringify(DEMO_USERS));
      }

      const storedRequests = localStorage.getItem(STORAGE_KEYS.PIN_REQUESTS);
      if (storedRequests) {
        this.pinRequests = JSON.parse(storedRequests);
      } else {
        localStorage.setItem(STORAGE_KEYS.PIN_REQUESTS, JSON.stringify(INITIAL_PIN_REQUESTS));
      }

      const storedResets = localStorage.getItem(STORAGE_KEYS.PASSWORD_RESETS);
      if (storedResets) {
        this.passwordResetSessions = JSON.parse(storedResets);
      }

      // Clean up legacy mock current user if present
      localStorage.removeItem('autopulse_current_user');

      // Use sessionStorage for active session so new app / browser launches always direct to login first
      const storedUser = sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        const demo = DEMO_USERS.find((d) => d.id === parsed.id || d.email.toLowerCase() === parsed.email.toLowerCase());
        this.currentUser = {
          ...parsed,
          username: parsed.username || demo?.username || parsed.email.split('@')[0].toLowerCase(),
          password: parsed.password || demo?.password || 'AutoPulse@2026!',
        };
      } else {
        // Direct to login screen at first (no user logged in by default)
        this.currentUser = null;
      }
    } catch {
      this.currentUser = null;
      this.users = DEMO_USERS;
      this.globalCloudUsers = DEMO_USERS;
      this.pinRequests = INITIAL_PIN_REQUESTS;
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
      } else {
        sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
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
   * SECURITY POLICY: Other users' PIN codes are NEVER returned or visible!
   */
  public getAvailableUsers(): User[] {
    return this.users.map((u) => {
      if (this.currentUser && u.id !== this.currentUser.id) {
        return {
          ...u,
          pinCode: undefined, // Redacted
        };
      }
      return u;
    });
  }

  /**
   * Returns directory of global cloud users for account linking.
   */
  public getGlobalCloudUsers(): User[] {
    return this.globalCloudUsers.map((u) => ({
      ...u,
      pinCode: undefined, // Redacted in listings
    }));
  }

  // ========================================================
  // Desktop Web Authentication Suite (Username & Strong Password)
  // ========================================================

  public loginWithCredentials(
    identifier: string,
    password: string
  ): { success: boolean; user?: User; error?: string } {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanId || !cleanPass) {
      return { success: false, error: 'Please enter your username/email and password.' };
    }

    // 1. Look in cached local users
    let matched = this.users.find(
      (u) =>
        (u.username && u.username.toLowerCase() === cleanId) ||
        (u.email && u.email.toLowerCase() === cleanId)
    );

    // 2. If not local, look in global cloud directory
    if (!matched) {
      const cloudMatched = this.globalCloudUsers.find(
        (u) =>
          (u.username && u.username.toLowerCase() === cleanId) ||
          (u.email && u.email.toLowerCase() === cleanId)
      );

      if (cloudMatched) {
        matched = cloudMatched;
        // Cache locally
        this.users = [cloudMatched, ...this.users];
      }
    }

    if (!matched) {
      return {
        success: false,
        error: 'No account found matching this username or email address.',
      };
    }

    const expectedPass = matched.password || 'AutoPulse@2026!';
    if (expectedPass !== cleanPass) {
      return {
        success: false,
        error: 'Incorrect password. Click "Forgot Password?" if you need to reset.',
      };
    }

    this.currentUser = matched;
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
    const pass = userData.password;

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

    if (!emailTrim || !emailTrim.includes('@')) {
      return { success: false, error: 'A valid work email address is required.' };
    }

    // Validate strong password
    const strength = evaluatePasswordStrength(pass);
    if (!strength.isValid) {
      return {
        success: false,
        error: `Password does not meet strong policy requirements: ${strength.errors.join(', ')}.`,
      };
    }

    // Check uniqueness
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

    // Generate fallback 4-digit PIN for bay tablet access
    const pin =
      userData.pinCode && /^\d{4}$/.test(userData.pinCode)
        ? userData.pinCode
        : Math.floor(1000 + Math.random() * 9000).toString();

    const avatarUrl = `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`;

    const newUser: User = {
      id: `user-${Date.now()}`,
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

    // 1. Add to local cache
    this.users = [newUser, ...this.users];

    // 2. Add to cloud directory
    this.globalCloudUsers = [newUser, ...this.globalCloudUsers];

    // 3. Queue cloud mutation
    syncEngine.queueUserMutation('CREATE', newUser);

    // 4. Set current user
    this.currentUser = newUser;
    this.saveState();

    return { success: true, user: newUser };
  }

  // ========================================================
  // Password Recovery / Reset Workflow
  // ========================================================

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

    // Generate simulated 6-digit OTP code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const session: PasswordResetSession = {
      id: `reset-sess-${Date.now()}`,
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
    const strength = evaluatePasswordStrength(newPassword);
    if (!strength.isValid) {
      return {
        success: false,
        error: `Password does not meet strong policy: ${strength.errors.join(', ')}`,
      };
    }

    const session = this.passwordResetSessions.find(
      (s) =>
        (s.username.toLowerCase() === clean || s.userEmail.toLowerCase() === clean) &&
        (s.status === 'VERIFIED' || s.verificationCode === code.trim())
    );

    if (!session) {
      return { success: false, error: 'No verified recovery session found.' };
    }

    const userIndex = this.users.findIndex((u) => u.id === session.userId);
    if (userIndex !== -1) {
      this.users[userIndex].password = newPassword;
    }

    const cloudIndex = this.globalCloudUsers.findIndex((u) => u.id === session.userId);
    if (cloudIndex !== -1) {
      this.globalCloudUsers[cloudIndex].password = newPassword;
    }

    const updatedUser = this.users[userIndex] || this.globalCloudUsers[cloudIndex];

    session.status = 'COMPLETED';
    if (this.currentUser?.id === session.userId) {
      this.currentUser.password = newPassword;
    }

    if (updatedUser) {
      syncEngine.queueUserMutation('UPDATE', updatedUser);
      this.currentUser = updatedUser;
    }

    this.saveState();
    return { success: true, user: updatedUser };
  }

  public getPasswordResetSessions(): PasswordResetSession[] {
    return this.passwordResetSessions;
  }

  // ========================================================
  // User Registration & Global Cloud Synchronization
  // ========================================================

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
    const emailNorm = userData.email.trim().toLowerCase();

    // Check if user already exists
    const existing = this.globalCloudUsers.find((u) => u.email.trim().toLowerCase() === emailNorm);
    if (existing) {
      return { success: false, error: `An account with ${userData.email} already exists in the cloud directory.` };
    }

    if (!userData.pinCode || !/^\d{4}$/.test(userData.pinCode)) {
      return { success: false, error: 'A 4-digit numeric PIN is required for workshop tablet access.' };
    }

    const defaultAvatar = userData.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userData.name.trim(),
      username: emailNorm.split('@')[0],
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

    // 1. Add to local device cache
    this.users = [newUser, ...this.users];

    // 2. Add to mock global cloud directory
    this.globalCloudUsers = [newUser, ...this.globalCloudUsers];

    // 3. Queue mutation via SyncEngine (Outbox / Cloud)
    syncEngine.queueUserMutation('CREATE', newUser);

    // 4. Automatically switch to newly registered user
    this.currentUser = newUser;

    this.saveState();

    return { success: true, user: newUser };
  }

  public linkExistingCloudAccount(email: string, pin: string): {
    success: boolean;
    user?: User;
    error?: string;
  } {
    const emailNorm = email.trim().toLowerCase();
    const target = this.globalCloudUsers.find((u) => u.email.trim().toLowerCase() === emailNorm);

    if (!target) {
      return { success: false, error: 'No account found matching this email address in the cloud directory.' };
    }

    if (target.pinCode !== pin) {
      return { success: false, error: 'Incorrect 4-digit PIN for ' + target.name };
    }

    // If not already in this device's cached list, add it
    if (!this.users.some((u) => u.id === target.id)) {
      this.users = [target, ...this.users];
    }

    this.currentUser = target;
    this.saveState();

    return { success: true, user: target };
  }

  public loginWithEmail(email: string): boolean {
    const matched = this.users.find(
      (u) => u.email.trim().toLowerCase() === email.trim().toLowerCase()
    );
    if (matched) {
      this.currentUser = matched;
      this.saveState();
      return true;
    }
    return false;
  }

  public loginWithPin(pin: string): { success: boolean; user?: User; error?: string } {
    const matched = this.users.find((u) => u.pinCode === pin);
    if (matched) {
      this.currentUser = matched;
      this.saveState();
      return { success: true, user: matched };
    }
    return { success: false, error: 'Invalid 4-digit PIN code' };
  }

  public loginAsRole(role: UserRole): User {
    const user = this.users.find((u) => u.role === role) || this.users[0];
    this.currentUser = user;
    this.saveState();
    return user;
  }

  public verifyAndSwitchUser(userId: string, pin: string): { success: boolean; user?: User; error?: string } {
    const user = this.users.find((u) => u.id === userId);
    if (!user) {
      return { success: false, error: 'User account not found' };
    }
    if (user.pinCode !== pin) {
      return { success: false, error: 'Incorrect 4-digit PIN for ' + user.name };
    }
    this.currentUser = user;
    this.saveState();
    return { success: true, user };
  }

  public loginAsUser(userId: string): boolean {
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      this.currentUser = user;
      this.saveState();
      return true;
    }
    return false;
  }

  public logout(): void {
    this.currentUser = null;
    try {
      sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem('autopulse_current_user');
    } catch { }
    this.saveState();
  }

  // ========================================================
  // Two-Way Secure PIN Reset Workflow
  // ========================================================

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

  public requestPinReset(userId: string): { success: boolean; message: string; request?: PinResetRequest } {
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
      id: `req-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      userEmail: user.email,
      requestedAt: new Date().toISOString(),
      status: 'PENDING',
    };

    this.pinRequests.unshift(newRequest);
    this.saveState();

    return {
      success: true,
      message: 'PIN reset request sent to IT Administrator for authorization.',
      request: newRequest,
    };
  }

  public sendResetPrompt(requestId: string): { success: boolean; message: string } {
    const reqIndex = this.pinRequests.findIndex((r) => r.id === requestId);
    if (reqIndex === -1) {
      return { success: false, message: 'Reset request not found.' };
    }

    const req = this.pinRequests[reqIndex];
    if (req.status !== 'PENDING') {
      return { success: false, message: 'Reset request is no longer pending.' };
    }

    this.pinRequests[reqIndex] = {
      ...req,
      status: 'PROMPTED',
      promptedAt: new Date().toISOString(),
    };

    this.saveState();
    return {
      success: true,
      message: `Reset prompt dispatched to ${req.userName}. The user will be prompted to choose their new PIN.`,
    };
  }

  public completePinReset(userId: string, newPin: string): { success: boolean; message: string } {
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

    // Update PIN in local users list
    this.users[userIndex].pinCode = newPin;

    // Update PIN in global cloud directory
    const cloudIndex = this.globalCloudUsers.findIndex((u) => u.id === userId);
    if (cloudIndex !== -1) {
      this.globalCloudUsers[cloudIndex].pinCode = newPin;
    }

    if (this.currentUser?.id === userId) {
      this.currentUser.pinCode = newPin;
    }

    // Queue update mutation for cloud sync
    syncEngine.queueUserMutation('UPDATE', this.users[userIndex]);

    // Mark request as COMPLETED
    if (reqIndex !== -1) {
      this.pinRequests[reqIndex] = {
        ...this.pinRequests[reqIndex],
        status: 'COMPLETED',
        completedAt: new Date().toISOString(),
      };
    }

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
