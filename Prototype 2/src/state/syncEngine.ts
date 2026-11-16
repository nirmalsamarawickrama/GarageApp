import {
  JobCard,
  InventoryItem,
  Employee,
  SyncMutation,
  JobStatus,
  VehicleDamagePoint,
  User,
} from '../types';
import {
  INITIAL_JOB_CARDS,
  INITIAL_INVENTORY,
  INITIAL_EMPLOYEES,
} from '../data/mockData';

const STORAGE_KEYS = {
  JOBS: 'autopulse_v2_jobs',
  INVENTORY: 'autopulse_v2_inventory',
  EMPLOYEES: 'autopulse_v2_employees',
  OUTBOX: 'autopulse_v2_outbox',
  IS_ONLINE: 'autopulse_v2_online',
  ACTIVE_BRANCH: 'autopulse_v2_branch',
  SERVER_URL: 'autopulse_v2_server_url',
};

class SyncEngine {
  private jobs: JobCard[] = [];
  private inventory: InventoryItem[] = [];
  private employees: Employee[] = [];
  private outbox: SyncMutation[] = [];
  private isOnline = true;
  private activeBranchId = 'branch-1';
  private listeners: Set<() => void> = new Set();
  private lastSyncedAt: string = new Date().toISOString();

  // Wi-Fi Local Network Sync Relay
  private serverUrl = 'http://192.168.1.2:5173';
  private clientId: string = 'client-' + Math.random().toString(36).substring(2, 9);
  private eventSource: EventSource | null = null;
  private isWifiRelayConnected = false;

  constructor() {
    this.initServerUrl();
    this.loadState();
    this.initWifiRelay();
  }

  private initServerUrl() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.SERVER_URL);
      if (stored) {
        this.serverUrl = stored;
      } else if (
        window.location.protocol.startsWith('http') &&
        window.location.host
      ) {
        this.serverUrl = `${window.location.protocol}//${window.location.host}`;
      }
    }
  }

  public initWifiRelay() {
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;

    try {
      if (this.eventSource) {
        this.eventSource.close();
      }

      this.eventSource = new EventSource(`${this.serverUrl}/api/sync/events`);

      this.eventSource.onopen = () => {
        this.isWifiRelayConnected = true;
        this.notify();
      };

      this.eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'CONNECTED') {
            this.isWifiRelayConnected = true;
            this.notify();
          } else if (payload.type === 'MUTATION') {
            if (payload.sender !== this.clientId && payload.mutation) {
              this.applyIncomingMutation(payload.mutation);
            }
          }
        } catch {
          // ignore heartbeat or malformed chunk
        }
      };

      this.eventSource.onerror = () => {
        this.isWifiRelayConnected = false;
        this.notify();
      };
    } catch {
      this.isWifiRelayConnected = false;
    }
  }

  public broadcastMutation(mutation: SyncMutation) {
    if (!this.isOnline) return;
    try {
      fetch(`${this.serverUrl}/api/sync/mutation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Id': this.clientId,
        },
        body: JSON.stringify(mutation),
      }).catch(() => {
        // network failure falls back to local outbox
      });
    } catch {
      // ignore offline fetch failure
    }
  }

  private applyIncomingMutation(mutation: SyncMutation) {
    const { entityType, action, payload } = mutation;

    if (entityType === 'JOB_CARD') {
      if (action === 'CREATE' && payload) {
        const incoming = payload as unknown as JobCard;
        if (!this.jobs.some((j) => j.id === incoming.id)) {
          this.jobs = [incoming, ...this.jobs];
        }
      } else if (action === 'UPDATE' && payload) {
        const patch = payload as Partial<JobCard> & { id: string };
        this.jobs = this.jobs.map((j) =>
          j.id === patch.id ? { ...j, ...patch } : j
        );
      }
    } else if (entityType === 'INVENTORY') {
      if (action === 'UPDATE' && typeof payload?.id === 'string') {
        const itemId = payload.id;
        const newQty = typeof payload.newQty === 'number' ? payload.newQty : undefined;
        const delta = typeof payload.delta === 'number' ? payload.delta : 0;
        this.inventory = this.inventory.map((i) => {
          if (i.id === itemId) {
            return {
              ...i,
              stockQty: newQty !== undefined ? newQty : Math.max(0, i.stockQty + delta),
            };
          }
          return i;
        });
      }
    } else if (entityType === 'EMPLOYEE') {
      if (action === 'UPDATE' && typeof payload?.id === 'string') {
        const patch = payload as Partial<Employee> & { id: string };
        this.employees = this.employees.map((e) =>
          e.id === patch.id ? { ...e, ...patch } : e
        );
      }
    } else if (entityType === 'USER') {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('autopulse:user_mutation', { detail: mutation })
        );
      }
    }

    this.saveState();
  }

  public getWifiRelayInfo() {
    return {
      connected: this.isWifiRelayConnected,
      serverUrl: this.serverUrl,
      clientId: this.clientId,
    };
  }

  public setServerUrl(newUrl: string) {
    this.serverUrl = newUrl.trim().replace(/\/+$/, '');
    localStorage.setItem(STORAGE_KEYS.SERVER_URL, this.serverUrl);
    this.initWifiRelay();
  }

  private loadState() {
    try {
      const storedJobs = localStorage.getItem(STORAGE_KEYS.JOBS);
      this.jobs = storedJobs ? JSON.parse(storedJobs) : INITIAL_JOB_CARDS;

      const storedInv = localStorage.getItem(STORAGE_KEYS.INVENTORY);
      this.inventory = storedInv ? JSON.parse(storedInv) : INITIAL_INVENTORY;

      const storedEmp = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
      this.employees = storedEmp ? JSON.parse(storedEmp) : INITIAL_EMPLOYEES;

      const storedOutbox = localStorage.getItem(STORAGE_KEYS.OUTBOX);
      this.outbox = storedOutbox ? JSON.parse(storedOutbox) : [];

      const storedOnline = localStorage.getItem(STORAGE_KEYS.IS_ONLINE);
      this.isOnline = storedOnline !== null ? JSON.parse(storedOnline) : true;

      const storedBranch = localStorage.getItem(STORAGE_KEYS.ACTIVE_BRANCH);
      this.activeBranchId = storedBranch || 'branch-1';
    } catch {
      this.jobs = INITIAL_JOB_CARDS;
      this.inventory = INITIAL_INVENTORY;
      this.employees = INITIAL_EMPLOYEES;
      this.outbox = [];
      this.isOnline = true;
      this.activeBranchId = 'branch-1';
    }
  }

  private saveState() {
    try {
      localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(this.jobs));
      localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(this.inventory));
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(this.employees));
      localStorage.setItem(STORAGE_KEYS.OUTBOX, JSON.stringify(this.outbox));
      localStorage.setItem(STORAGE_KEYS.IS_ONLINE, JSON.stringify(this.isOnline));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_BRANCH, this.activeBranchId);
    } catch (e) {
      console.error('Storage error', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  // Getters
  public getJobs(): JobCard[] {
    return this.jobs;
  }

  public getInventory(): InventoryItem[] {
    return this.inventory;
  }

  public getEmployees(): Employee[] {
    return this.employees;
  }

  public getOutbox(): SyncMutation[] {
    return this.outbox;
  }

  public getIsOnline(): boolean {
    return this.isOnline;
  }

  public getActiveBranchId(): string {
    return this.activeBranchId;
  }

  public getLastSyncedAt(): string {
    return this.lastSyncedAt;
  }

  // Setters & Actions
  public setActiveBranchId(branchId: string) {
    this.activeBranchId = branchId;
    this.saveState();
  }

  public setOnlineStatus(online: boolean) {
    this.isOnline = online;
    if (online && this.outbox.length > 0) {
      this.processOutbox();
    }
    this.saveState();
  }

  public processOutbox(): Promise<void> {
    if (this.outbox.length === 0) return Promise.resolve();

    this.outbox = this.outbox.map((m) => {
      this.broadcastMutation(m);
      return { ...m, status: 'SYNCED' as const };
    });
    this.lastSyncedAt = new Date().toISOString();
    this.saveState();

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        this.outbox = [];
        this.saveState();
        resolve();
      }, 1400);
    });
  }

  public queueUserMutation(action: 'CREATE' | 'UPDATE', user: User): SyncMutation {
    const mutation: SyncMutation = {
      id: `mut-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      entityType: 'USER',
      action,
      payload: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        branchId: user.branchId,
        jobTitle: user.jobTitle,
        phone: user.phone,
        username: user.username,
      },
      timestamp: new Date().toISOString(),
      status: this.isOnline ? 'SYNCED' : 'PENDING',
      retryCount: 0,
    };

    if (!this.isOnline) {
      this.outbox.push(mutation);
    } else {
      this.lastSyncedAt = new Date().toISOString();
      this.broadcastMutation(mutation);
    }
    this.saveState();
    return mutation;
  }

  public createJobCard(
    job: Omit<JobCard, 'id' | 'jobNumber' | 'createdAt' | 'updatedAt' | 'version'>
  ): JobCard {
    const newId = `job-${Date.now()}`;
    const newNumber = `AP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const createdJob: JobCard = {
      ...job,
      id: newId,
      jobNumber: newNumber,
      invoiceNumber: job.invoiceNumber || `INV-${newNumber.slice(-4)}`,
      billingStatus: job.billingStatus || 'PENDING',
      createdAt: now,
      updatedAt: now,
      version: 1,
    };

    this.jobs = [createdJob, ...this.jobs];

    const mutation: SyncMutation = {
      id: `mut-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      entityType: 'JOB_CARD',
      action: 'CREATE',
      payload: createdJob as unknown as Record<string, unknown>,
      timestamp: now,
      status: this.isOnline ? 'SYNCED' : 'PENDING',
      retryCount: 0,
    };

    if (!this.isOnline) {
      this.outbox.push(mutation);
    } else {
      this.lastSyncedAt = now;
      this.broadcastMutation(mutation);
    }

    this.saveState();
    return createdJob;
  }

  public advanceJobStatus(jobId: string, nextStatus: JobStatus) {
    const now = new Date().toISOString();
    this.jobs = this.jobs.map((j) => {
      if (j.id === jobId) {
        const updated = {
          ...j,
          status: nextStatus,
          updatedAt: now,
          version: j.version + 1,
        };

        const mutation: SyncMutation = {
          id: `mut-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          entityType: 'JOB_CARD',
          action: 'UPDATE',
          payload: { id: jobId, status: nextStatus },
          timestamp: now,
          status: this.isOnline ? 'SYNCED' : 'PENDING',
          retryCount: 0,
        };

        if (!this.isOnline) {
          this.outbox.push(mutation);
        } else {
          this.lastSyncedAt = now;
          this.broadcastMutation(mutation);
        }

        return updated;
      }
      return j;
    });

    this.saveState();
  }

  public updateInventoryStock(itemId: string, delta: number) {
    const now = new Date().toISOString();
    this.inventory = this.inventory.map((item) => {
      if (item.id === itemId) {
        const updatedQty = Math.max(0, item.stockQty + delta);
        const updated = {
          ...item,
          stockQty: updatedQty,
          lastRestocked: delta > 0 ? now.split('T')[0] : item.lastRestocked,
          version: item.version + 1,
        };

        const mutation: SyncMutation = {
          id: `mut-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          entityType: 'INVENTORY',
          action: 'UPDATE',
          payload: { id: itemId, delta, newQty: updatedQty },
          timestamp: now,
          status: this.isOnline ? 'SYNCED' : 'PENDING',
          retryCount: 0,
        };

        if (!this.isOnline) {
          this.outbox.push(mutation);
        } else {
          this.lastSyncedAt = now;
          this.broadcastMutation(mutation);
        }

        return updated;
      }
      return item;
    });

    this.saveState();
  }

  public transferStock(itemId: string, targetBranchId: string, qty: number): boolean {
    const sourceItem = this.inventory.find((i) => i.id === itemId);
    if (!sourceItem || sourceItem.stockQty < qty || qty <= 0) return false;

    this.updateInventoryStock(itemId, -qty);

    const now = new Date().toISOString();
    const transferMutation: SyncMutation = {
      id: `mut-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      entityType: 'INVENTORY',
      action: 'UPDATE',
      payload: { type: 'INTER_BRANCH_TRANSFER', itemId, targetBranchId, qty },
      timestamp: now,
      status: this.isOnline ? 'SYNCED' : 'PENDING',
      retryCount: 0,
    };

    if (!this.isOnline) {
      this.outbox.push(transferMutation);
    } else {
      this.broadcastMutation(transferMutation);
    }

    this.saveState();
    return true;
  }

  public toggleEmployeeClock(empId: string, jobId?: string) {
    const now = new Date().toISOString();
    this.employees = this.employees.map((emp) => {
      if (emp.id === empId) {
        const isCurrentlyWorking = emp.status === 'Working on Job';
        const newStatus: Employee['status'] = isCurrentlyWorking
          ? 'Available'
          : 'Working on Job';
        const updatedEmp: Employee = {
          ...emp,
          status: newStatus,
          currentJobCardId: isCurrentlyWorking
            ? undefined
            : jobId || emp.currentJobCardId || 'job-101',
          actualHoursThisMonth: isCurrentlyWorking
            ? emp.actualHoursThisMonth + 1
            : emp.actualHoursThisMonth,
        };

        const mutation: SyncMutation = {
          id: `mut-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          entityType: 'EMPLOYEE',
          action: 'UPDATE',
          payload: {
            id: empId,
            status: updatedEmp.status,
            currentJobCardId: updatedEmp.currentJobCardId,
            actualHoursThisMonth: updatedEmp.actualHoursThisMonth,
          },
          timestamp: now,
          status: this.isOnline ? 'SYNCED' : 'PENDING',
          retryCount: 0,
        };

        if (!this.isOnline) {
          this.outbox.push(mutation);
        } else {
          this.lastSyncedAt = now;
          this.broadcastMutation(mutation);
        }

        return updatedEmp;
      }
      return emp;
    });

    this.saveState();
  }

  public updateEmployee(empId: string, updates: Partial<Employee>) {
    const now = new Date().toISOString();
    this.employees = this.employees.map((emp) => {
      if (emp.id === empId) {
        const updated = { ...emp, ...updates };

        const mutation: SyncMutation = {
          id: `mut-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          entityType: 'EMPLOYEE',
          action: 'UPDATE',
          payload: { id: empId, ...updates },
          timestamp: now,
          status: this.isOnline ? 'SYNCED' : 'PENDING',
          retryCount: 0,
        };

        if (!this.isOnline) {
          this.outbox.push(mutation);
        } else {
          this.lastSyncedAt = now;
          this.broadcastMutation(mutation);
        }

        return updated;
      }
      return emp;
    });

    this.saveState();
  }

  public updateJobCardBilling(jobId: string, updates: Partial<JobCard>) {
    const now = new Date().toISOString();
    this.jobs = this.jobs.map((j) => {
      if (j.id === jobId) {
        const updated = {
          ...j,
          ...updates,
          updatedAt: now,
          version: j.version + 1,
        };

        const mutation: SyncMutation = {
          id: `mut-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          entityType: 'JOB_CARD',
          action: 'UPDATE',
          payload: { id: jobId, ...updates },
          timestamp: now,
          status: this.isOnline ? 'SYNCED' : 'PENDING',
          retryCount: 0,
        };

        if (!this.isOnline) {
          this.outbox.push(mutation);
        } else {
          this.lastSyncedAt = now;
          this.broadcastMutation(mutation);
        }

        return updated;
      }
      return j;
    });

    this.saveState();
  }

  public saveInspectionPoints(jobId: string, damagePoints: VehicleDamagePoint[]) {
    const now = new Date().toISOString();
    this.jobs = this.jobs.map((j) => {
      if (j.id === jobId) {
        const updated = {
          ...j,
          damagePoints,
          updatedAt: now,
          version: j.version + 1,
        };

        const mutation: SyncMutation = {
          id: `mut-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          entityType: 'JOB_CARD',
          action: 'UPDATE',
          payload: { id: jobId, damagePoints },
          timestamp: now,
          status: this.isOnline ? 'SYNCED' : 'PENDING',
          retryCount: 0,
        };

        if (!this.isOnline) {
          this.outbox.push(mutation);
        } else {
          this.lastSyncedAt = now;
          this.broadcastMutation(mutation);
        }

        return updated;
      }
      return j;
    });

    this.saveState();
  }

  public resetDemoData() {
    this.jobs = INITIAL_JOB_CARDS;
    this.inventory = INITIAL_INVENTORY;
    this.employees = INITIAL_EMPLOYEES;
    this.outbox = [];
    this.isOnline = true;
    this.activeBranchId = 'branch-1';
    this.saveState();
  }
}

export const syncEngine = new SyncEngine();
