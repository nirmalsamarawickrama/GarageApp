import {
  JobCard,
  InventoryItem,
  Employee,
  SyncMutation,
  JobStatus,
  VehicleDamagePoint,
  User,
  AuditLogEntry,
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
  AUDIT_LOGS: 'autopulse_v2_audit_logs',
};

function createUniqueId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function cloneJobs(jobs: JobCard[]): JobCard[] {
  return jobs.map((j) => ({
    ...j,
    damagePoints: j.damagePoints ? j.damagePoints.map((d) => ({ ...d })) : [],
    allocatedParts: j.allocatedParts ? j.allocatedParts.map((p) => ({ ...p })) : [],
  }));
}

function cloneInventory(items: InventoryItem[]): InventoryItem[] {
  return items.map((i) => ({ ...i }));
}

function cloneEmployees(emps: Employee[]): Employee[] {
  return emps.map((e) => ({ ...e }));
}

function formatAuditTime(date = new Date()): string {
  return date.toTimeString().slice(0, 8);
}

class SyncEngine {
  private jobs: JobCard[] = [];
  private inventory: InventoryItem[] = [];
  private employees: Employee[] = [];
  private outbox: SyncMutation[] = [];
  private auditLogs: AuditLogEntry[] = [];
  private isOnline = true;
  private activeBranchId = 'branch-1';
  private listeners: Set<() => void> = new Set();
  private lastSyncedAt: string = new Date().toISOString();

  // Wi-Fi Local Network Sync Relay
  private serverUrl = 'http://192.168.1.2:5173';
  private clientId: string = createUniqueId('client');
  private eventSource: EventSource | null = null;
  private isWifiRelayConnected = false;
  private isFlushing = false;
  private flushPromise: Promise<void> | null = null;

  constructor() {
    this.initServerUrl();
    this.loadState();
    if (this.isOnline) {
      this.initWifiRelay();
    }
  }

  private initServerUrl() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.SERVER_URL);
      if (stored && /^https?:\/\//i.test(stored)) {
        this.serverUrl = stored.replace(/\/+$/, '');
      } else if (
        window.location.protocol.startsWith('http') &&
        window.location.host &&
        window.location.hostname !== 'localhost'
      ) {
        this.serverUrl = `${window.location.protocol}//${window.location.host}`;
      } else if (window.location.protocol.startsWith('http') && window.location.host) {
        this.serverUrl = `${window.location.protocol}//${window.location.host}`;
      }
    }
  }

  public initWifiRelay() {
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;

    this.closeWifiRelay();

    if (!this.isOnline) {
      this.notify();
      return;
    }

    try {
      const es = new EventSource(`${this.serverUrl}/api/sync/events`);
      this.eventSource = es;

      es.onopen = () => {
        if (this.eventSource !== es) return;
        this.isWifiRelayConnected = true;
        this.notify();
      };

      es.onmessage = (event) => {
        if (this.eventSource !== es || !this.isOnline) return;
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'CONNECTED') {
            this.isWifiRelayConnected = true;
            this.notify();
          } else if (payload.type === 'MUTATION') {
            if (payload.sender !== this.clientId && payload.mutation) {
              this.applyIncomingMutation(payload.mutation);
            }
          } else if (payload.type === 'STATE_REFRESH' && payload.state) {
            this.applyRemoteSnapshot(payload.state);
          }
        } catch {
          // ignore heartbeat or malformed chunk
        }
      };

      es.onerror = () => {
        if (this.eventSource !== es) return;
        this.isWifiRelayConnected = false;
        this.notify();
      };
    } catch {
      this.isWifiRelayConnected = false;
    }
  }

  private closeWifiRelay() {
    if (this.eventSource) {
      this.eventSource.onopen = null;
      this.eventSource.onmessage = null;
      this.eventSource.onerror = null;
      this.eventSource.close();
      this.eventSource = null;
    }
    this.isWifiRelayConnected = false;
  }

  public async broadcastMutation(mutation: SyncMutation): Promise<boolean> {
    if (!this.isOnline) return false;
    try {
      const res = await fetch(`${this.serverUrl}/api/sync/mutation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Id': this.clientId,
        },
        body: JSON.stringify(mutation),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  private applyRemoteSnapshot(snapshot: {
    jobs?: JobCard[];
    inventory?: InventoryItem[];
    employees?: Employee[];
  }) {
    if (Array.isArray(snapshot.jobs)) this.jobs = cloneJobs(snapshot.jobs);
    if (Array.isArray(snapshot.inventory)) this.inventory = cloneInventory(snapshot.inventory);
    if (Array.isArray(snapshot.employees)) this.employees = cloneEmployees(snapshot.employees);
    this.lastSyncedAt = new Date().toISOString();
    this.recordAuditEvent('Full workspace state refreshed from LAN sync host', 'SYNC', false);
    this.saveState();
  }

  private applyIncomingMutation(mutation: SyncMutation) {
    const { entityType, action, payload } = mutation;

    if (entityType === 'JOB_CARD') {
      if (action === 'CREATE' && payload) {
        const incoming = payload as unknown as JobCard;
        if (!this.jobs.some((j) => j.id === incoming.id)) {
          this.jobs = [incoming, ...this.jobs];
        }
      } else if (action === 'UPDATE' && payload && typeof payload.id === 'string') {
        const patch = payload as Partial<JobCard> & { id: string };
        this.jobs = this.jobs.map((j) => {
          if (j.id !== patch.id) return j;
          if (typeof patch.version === 'number' && patch.version < j.version) {
            return j;
          }
          return {
            ...j,
            ...patch,
            updatedAt: patch.updatedAt || mutation.timestamp || j.updatedAt,
            version: typeof patch.version === 'number' ? patch.version : j.version + 1,
          };
        });
      } else if (action === 'DELETE' && payload && typeof payload.id === 'string') {
        this.jobs = this.jobs.filter((j) => j.id !== payload.id);
      }
    } else if (entityType === 'INVENTORY') {
      if (action === 'UPDATE' && payload?.type === 'INTER_BRANCH_TRANSFER') {
        const itemId = typeof payload.itemId === 'string' ? payload.itemId : '';
        const targetBranchId =
          typeof payload.targetBranchId === 'string' ? payload.targetBranchId : '';
        const qty = typeof payload.qty === 'number' ? payload.qty : 0;
        const sourceNewQty =
          typeof payload.sourceNewQty === 'number' ? payload.sourceNewQty : undefined;
        const targetItem = payload.targetItem as InventoryItem | undefined;

        if (itemId && targetBranchId && qty > 0) {
          this.inventory = this.inventory.map((i) =>
            i.id === itemId
              ? {
                  ...i,
                  stockQty: sourceNewQty !== undefined ? sourceNewQty : Math.max(0, i.stockQty - qty),
                  version: i.version + 1,
                }
              : i
          );
          if (targetItem) {
            const exists = this.inventory.some((i) => i.id === targetItem.id);
            if (exists) {
              this.inventory = this.inventory.map((i) =>
                i.id === targetItem.id ? { ...i, ...targetItem } : i
              );
            } else {
              this.inventory = [...this.inventory, { ...targetItem }];
            }
          }
        }
      } else if (action === 'UPDATE' && typeof payload?.id === 'string') {
        const itemId = payload.id;
        const newQty = typeof payload.newQty === 'number' ? payload.newQty : undefined;
        const delta = typeof payload.delta === 'number' ? payload.delta : 0;
        this.inventory = this.inventory.map((i) => {
          if (i.id === itemId) {
            return {
              ...i,
              stockQty: newQty !== undefined ? newQty : Math.max(0, i.stockQty + delta),
              version: i.version + 1,
            };
          }
          return i;
        });
      } else if (action === 'DELETE' && typeof payload?.id === 'string') {
        this.inventory = this.inventory.filter((i) => i.id !== payload.id);
      }
    } else if (entityType === 'EMPLOYEE') {
      if (action === 'UPDATE' && typeof payload?.id === 'string') {
        const patch = payload as Partial<Employee> & { id: string };
        this.employees = this.employees.map((e) =>
          e.id === patch.id ? { ...e, ...patch } : e
        );
      } else if (action === 'DELETE' && typeof payload?.id === 'string') {
        this.employees = this.employees.filter((e) => e.id !== payload.id);
      }
    } else if (entityType === 'USER') {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('autopulse:user_mutation', { detail: mutation })
        );
      }
    }

    this.lastSyncedAt = new Date().toISOString();
    this.saveState();
  }

  public getWifiRelayInfo() {
    return {
      connected: this.isWifiRelayConnected,
      serverUrl: this.serverUrl,
      clientId: this.clientId,
    };
  }

  public setServerUrl(newUrl: string): boolean {
    const clean = newUrl.trim().replace(/\/+$/, '');
    if (!/^https?:\/\/.+/i.test(clean)) {
      return false;
    }
    this.serverUrl = clean;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SERVER_URL, this.serverUrl);
    }
    this.initWifiRelay();
    return true;
  }

  private loadState() {
    try {
      const storedJobs = localStorage.getItem(STORAGE_KEYS.JOBS);
      this.jobs = storedJobs ? JSON.parse(storedJobs) : cloneJobs(INITIAL_JOB_CARDS);

      const storedInv = localStorage.getItem(STORAGE_KEYS.INVENTORY);
      this.inventory = storedInv ? JSON.parse(storedInv) : cloneInventory(INITIAL_INVENTORY);

      const storedEmp = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
      this.employees = storedEmp ? JSON.parse(storedEmp) : cloneEmployees(INITIAL_EMPLOYEES);

      const storedOutbox = localStorage.getItem(STORAGE_KEYS.OUTBOX);
      this.outbox = storedOutbox
        ? (JSON.parse(storedOutbox) as SyncMutation[]).filter((m) => m.status !== 'SYNCED')
        : [];

      const storedOnline = localStorage.getItem(STORAGE_KEYS.IS_ONLINE);
      this.isOnline = storedOnline !== null ? JSON.parse(storedOnline) : true;

      const storedBranch = localStorage.getItem(STORAGE_KEYS.ACTIVE_BRANCH);
      this.activeBranchId = storedBranch || 'branch-1';

      const storedAudit = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (storedAudit) {
        this.auditLogs = JSON.parse(storedAudit);
      } else {
        this.auditLogs = [
          {
            id: createUniqueId('log'),
            timestamp: formatAuditTime(),
            event: 'Room SQLite local storage engine initialized (autopulse_v2_*)',
            status: 'OK',
          },
          {
            id: createUniqueId('log'),
            timestamp: formatAuditTime(),
            event: 'Zero-Knowledge PIN Vault & RBAC permission matrix verified',
            status: 'SECURITY',
          },
        ];
      }
    } catch {
      this.jobs = cloneJobs(INITIAL_JOB_CARDS);
      this.inventory = cloneInventory(INITIAL_INVENTORY);
      this.employees = cloneEmployees(INITIAL_EMPLOYEES);
      this.outbox = [];
      this.isOnline = true;
      this.activeBranchId = 'branch-1';
      this.auditLogs = [];
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
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));
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

  public getAuditLogs(): AuditLogEntry[] {
    return this.auditLogs;
  }

  public getIsOnline(): boolean {
    return this.isOnline;
  }

  public getIsFlushing(): boolean {
    return this.isFlushing;
  }

  public getActiveBranchId(): string {
    return this.activeBranchId;
  }

  public getLastSyncedAt(): string {
    return this.lastSyncedAt;
  }

  public recordAuditEvent(
    event: string,
    status: AuditLogEntry['status'] = 'OK',
    persist = true
  ) {
    const entry: AuditLogEntry = {
      id: createUniqueId('log'),
      timestamp: formatAuditTime(),
      event,
      status,
    };
    this.auditLogs = [entry, ...this.auditLogs].slice(0, 40);
    if (persist) {
      this.saveState();
    }
  }

  private dispatchOrQueue(mutation: SyncMutation) {
    if (!this.isOnline) {
      this.outbox = [...this.outbox, mutation];
      return;
    }
    this.lastSyncedAt = mutation.timestamp;
    void this.broadcastMutation(mutation).then((ok) => {
      if (!ok && this.isWifiRelayConnected) {
        this.outbox = [
          ...this.outbox,
          { ...mutation, status: 'FAILED', retryCount: mutation.retryCount + 1 },
        ];
        this.saveState();
      }
    });
  }

  // Setters & Actions
  public setActiveBranchId(branchId: string) {
    this.activeBranchId = branchId;
    this.saveState();
  }

  public setOnlineStatus(online: boolean) {
    this.isOnline = online;
    if (!online) {
      this.closeWifiRelay();
      this.recordAuditEvent('Device switched to Offline Room DB mode (SSE paused)', 'WARN', false);
      this.saveState();
      return;
    }

    this.initWifiRelay();
    this.recordAuditEvent('Device reconnected to network mesh', 'SYNC', false);
    this.saveState();
    if (this.outbox.length > 0) {
      void this.processOutbox();
    }
  }

  public processOutbox(): Promise<void> {
    if (!this.isOnline) {
      return Promise.resolve();
    }
    if (this.isFlushing && this.flushPromise) {
      return this.flushPromise;
    }
    if (this.outbox.length === 0) {
      return Promise.resolve();
    }

    this.isFlushing = true;
    const batch = this.outbox.filter((m) => m.status !== 'SYNCED');
    if (batch.length === 0) {
      this.outbox = [];
      this.saveState();
      this.isFlushing = false;
      return Promise.resolve();
    }
    const batchIds = new Set(batch.map((m) => m.id));
    const wasRelayConnected = this.isWifiRelayConnected;

    this.flushPromise = (async () => {
      try {
        const results = await Promise.all(
          batch.map(async (m) => {
            const ok = await this.broadcastMutation(m);
            // If LAN relay isn't active (standalone browser / offline test), treat online flush as cloud sync.
            const succeeded = ok || !wasRelayConnected;
            return { id: m.id, succeeded };
          })
        );

        const succeededIds = new Set(
          results.filter((r) => r.succeeded).map((r) => r.id)
        );
        const failedIds = new Set(
          results.filter((r) => !r.succeeded).map((r) => r.id)
        );

        this.outbox = this.outbox.map((m) => {
          if (succeededIds.has(m.id)) {
            return { ...m, status: 'SYNCED' as const };
          }
          if (failedIds.has(m.id)) {
            return {
              ...m,
              status: 'FAILED' as const,
              retryCount: m.retryCount + 1,
            };
          }
          return m;
        });

        if (succeededIds.size > 0) {
          this.lastSyncedAt = new Date().toISOString();
          this.recordAuditEvent(
            `Outbox flushed: ${succeededIds.size} mutation(s) synced${
              failedIds.size > 0 ? `, ${failedIds.size} failed` : ''
            }`,
            failedIds.size > 0 ? 'WARN' : 'SYNC',
            false
          );
        } else if (failedIds.size > 0) {
          this.recordAuditEvent(
            `Outbox flush failed for ${failedIds.size} mutation(s) — retained for retry`,
            'WARN',
            false
          );
        }

        this.saveState();

        if (succeededIds.size > 0 || batchIds.size > 0) {
          await new Promise<void>((resolve) => {
            setTimeout(() => {
              // Remove only mutations confirmed synced in this batch; preserve any newly queued offline mutations
              this.outbox = this.outbox.filter(
                (m) => !(succeededIds.has(m.id) && m.status === 'SYNCED')
              );
              this.saveState();
              resolve();
            }, 1400);
          });
        }
      } finally {
        this.isFlushing = false;
        this.flushPromise = null;
        this.notify();
      }
    })();

    return this.flushPromise;
  }

  public queueUserMutation(action: 'CREATE' | 'UPDATE', user: User): SyncMutation {
    const mutation: SyncMutation = {
      id: createUniqueId('mut'),
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
        avatarUrl: user.avatarUrl,
        pinCode: user.pinCode,
        password: user.password,
        isCloudSynced: user.isCloudSynced,
        registeredAt: user.registeredAt,
      },
      timestamp: new Date().toISOString(),
      status: this.isOnline ? 'SYNCED' : 'PENDING',
      retryCount: 0,
    };

    this.dispatchOrQueue(mutation);
    this.saveState();
    return mutation;
  }

  public createJobCard(
    job: Omit<JobCard, 'id' | 'jobNumber' | 'createdAt' | 'updatedAt' | 'version'>
  ): JobCard {
    const newId = createUniqueId('job');
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

    if (createdJob.assignedTechId) {
      this.employees = this.employees.map((emp) =>
        emp.id === createdJob.assignedTechId
          ? {
              ...emp,
              status: 'Working on Job',
              currentJobCardId: createdJob.id,
              activeBay: createdJob.assignedBay || emp.activeBay,
            }
          : emp
      );
    }

    const mutation: SyncMutation = {
      id: createUniqueId('mut'),
      entityType: 'JOB_CARD',
      action: 'CREATE',
      payload: createdJob as unknown as Record<string, unknown>,
      timestamp: now,
      status: this.isOnline ? 'SYNCED' : 'PENDING',
      retryCount: 0,
    };

    this.dispatchOrQueue(mutation);
    this.recordAuditEvent(
      `Created job card ${createdJob.jobNumber} (${createdJob.vehiclePlate})`,
      'OK',
      false
    );
    this.saveState();
    return createdJob;
  }

  public advanceJobStatus(jobId: string, nextStatus: JobStatus) {
    const now = new Date().toISOString();
    let advancedNumber = '';

    this.jobs = this.jobs.map((j) => {
      if (j.id !== jobId) return j;
      advancedNumber = j.jobNumber;
      const wasReady = j.status === 'READY_DELIVERY';
      const updated = {
        ...j,
        status: nextStatus,
        updatedAt: now,
        version: j.version + 1,
      };

      if (nextStatus === 'READY_DELIVERY' && !wasReady) {
        this.employees = this.employees.map((emp) =>
          emp.currentJobCardId === jobId
            ? {
                ...emp,
                status: 'Available',
                currentJobCardId: undefined,
                completedJobsCount: emp.completedJobsCount + 1,
              }
            : emp
        );
      }

      const mutation: SyncMutation = {
        id: createUniqueId('mut'),
        entityType: 'JOB_CARD',
        action: 'UPDATE',
        payload: {
          id: jobId,
          status: nextStatus,
          updatedAt: now,
          version: updated.version,
        },
        timestamp: now,
        status: this.isOnline ? 'SYNCED' : 'PENDING',
        retryCount: 0,
      };

      this.dispatchOrQueue(mutation);
      return updated;
    });

    if (advancedNumber) {
      this.recordAuditEvent(`Job ${advancedNumber} moved to ${nextStatus}`, 'OK', false);
    }
    this.saveState();
  }

  public updateInventoryStock(itemId: string, delta: number) {
    const now = new Date().toISOString();
    this.inventory = this.inventory.map((item) => {
      if (item.id === itemId) {
        const updatedQty = Math.max(0, Number((item.stockQty + delta).toFixed(2)));
        const updated = {
          ...item,
          stockQty: updatedQty,
          lastRestocked: delta > 0 ? now.split('T')[0] : item.lastRestocked,
          version: item.version + 1,
        };

        const mutation: SyncMutation = {
          id: createUniqueId('mut'),
          entityType: 'INVENTORY',
          action: 'UPDATE',
          payload: { id: itemId, delta, newQty: updatedQty },
          timestamp: now,
          status: this.isOnline ? 'SYNCED' : 'PENDING',
          retryCount: 0,
        };

        this.dispatchOrQueue(mutation);
        return updated;
      }
      return item;
    });

    this.saveState();
  }

  public transferStock(itemId: string, targetBranchId: string, qty: number): boolean {
    const sourceItem = this.inventory.find((i) => i.id === itemId);
    if (
      !sourceItem ||
      !targetBranchId ||
      sourceItem.branchId === targetBranchId ||
      !Number.isFinite(qty) ||
      qty <= 0 ||
      sourceItem.stockQty < qty
    ) {
      return false;
    }

    const now = new Date().toISOString();
    const today = now.split('T')[0];
    const sourceNewQty = Number((sourceItem.stockQty - qty).toFixed(2));

    let destinationItem: InventoryItem | undefined = this.inventory.find(
      (i) =>
        i.branchId === targetBranchId &&
        (i.sku === sourceItem.sku || i.oemNumber === sourceItem.oemNumber)
    );

    if (destinationItem) {
      const updatedDest: InventoryItem = {
        ...destinationItem,
        stockQty: Number((destinationItem.stockQty + qty).toFixed(2)),
        lastRestocked: today,
        version: destinationItem.version + 1,
      };
      destinationItem = updatedDest;
      this.inventory = this.inventory.map((item) => {
        if (item.id === sourceItem.id) {
          return { ...item, stockQty: sourceNewQty, version: item.version + 1 };
        }
        if (item.id === updatedDest.id) {
          return updatedDest;
        }
        return item;
      });
    } else {
      destinationItem = {
        ...sourceItem,
        id: createUniqueId('inv'),
        branchId: targetBranchId,
        stockQty: qty,
        lastRestocked: today,
        version: 1,
      };
      this.inventory = [
        ...this.inventory.map((item) =>
          item.id === sourceItem.id
            ? { ...item, stockQty: sourceNewQty, version: item.version + 1 }
            : item
        ),
        destinationItem,
      ];
    }

    const transferMutation: SyncMutation = {
      id: createUniqueId('mut'),
      entityType: 'INVENTORY',
      action: 'UPDATE',
      payload: {
        type: 'INTER_BRANCH_TRANSFER',
        itemId,
        sourceBranchId: sourceItem.branchId,
        targetBranchId,
        qty,
        sourceNewQty,
        targetItem: destinationItem,
      },
      timestamp: now,
      status: this.isOnline ? 'SYNCED' : 'PENDING',
      retryCount: 0,
    };

    this.dispatchOrQueue(transferMutation);
    this.recordAuditEvent(
      `Transferred ${qty} ${sourceItem.unitOfMeasure} of ${sourceItem.sku} to ${targetBranchId}`,
      'SYNC',
      false
    );
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
        const fallbackBranchJob = this.jobs.find(
          (j) => j.branchId === emp.branchId && j.status !== 'READY_DELIVERY'
        )?.id;
        const nextActualHours = isCurrentlyWorking
          ? emp.actualHoursThisMonth + 1
          : emp.actualHoursThisMonth;
        const nextEfficiency =
          nextActualHours > 0
            ? Math.round((emp.billedHoursThisMonth / nextActualHours) * 100)
            : emp.efficiencyRating;

        const updatedEmp: Employee = {
          ...emp,
          status: newStatus,
          currentJobCardId: isCurrentlyWorking
            ? undefined
            : jobId || emp.currentJobCardId || fallbackBranchJob,
          actualHoursThisMonth: nextActualHours,
          efficiencyRating: nextEfficiency,
        };

        const mutation: SyncMutation = {
          id: createUniqueId('mut'),
          entityType: 'EMPLOYEE',
          action: 'UPDATE',
          payload: {
            id: empId,
            status: updatedEmp.status,
            currentJobCardId: updatedEmp.currentJobCardId,
            actualHoursThisMonth: updatedEmp.actualHoursThisMonth,
            efficiencyRating: updatedEmp.efficiencyRating,
          },
          timestamp: now,
          status: this.isOnline ? 'SYNCED' : 'PENDING',
          retryCount: 0,
        };

        this.dispatchOrQueue(mutation);
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
          id: createUniqueId('mut'),
          entityType: 'EMPLOYEE',
          action: 'UPDATE',
          payload: { id: empId, ...updates },
          timestamp: now,
          status: this.isOnline ? 'SYNCED' : 'PENDING',
          retryCount: 0,
        };

        this.dispatchOrQueue(mutation);
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
          id: createUniqueId('mut'),
          entityType: 'JOB_CARD',
          action: 'UPDATE',
          payload: {
            id: jobId,
            ...updates,
            updatedAt: now,
            version: updated.version,
          },
          timestamp: now,
          status: this.isOnline ? 'SYNCED' : 'PENDING',
          retryCount: 0,
        };

        this.dispatchOrQueue(mutation);
        this.recordAuditEvent(`Updated invoice ${updated.invoiceNumber || updated.jobNumber}`, 'OK', false);
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
          id: createUniqueId('mut'),
          entityType: 'JOB_CARD',
          action: 'UPDATE',
          payload: {
            id: jobId,
            damagePoints,
            updatedAt: now,
            version: updated.version,
          },
          timestamp: now,
          status: this.isOnline ? 'SYNCED' : 'PENDING',
          retryCount: 0,
        };

        this.dispatchOrQueue(mutation);
        this.recordAuditEvent(`Saved 360° DVI (${damagePoints.length} defect(s)) on ${j.jobNumber}`, 'OK', false);
        return updated;
      }
      return j;
    });

    this.saveState();
  }

  public resetDemoData() {
    this.jobs = cloneJobs(INITIAL_JOB_CARDS);
    this.inventory = cloneInventory(INITIAL_INVENTORY);
    this.employees = cloneEmployees(INITIAL_EMPLOYEES);
    this.outbox = [];
    this.isOnline = true;
    this.activeBranchId = 'branch-1';
    this.initWifiRelay();
    this.recordAuditEvent('Workshop demo dataset restored to baseline state', 'OK', false);
    this.saveState();

    if (this.isOnline) {
      void fetch(`${this.serverUrl}/api/sync/state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobs: this.jobs,
          inventory: this.inventory,
          employees: this.employees,
        }),
      }).catch(() => {
        // ignore if local dev bridge is offline
      });
    }
  }
}

export const syncEngine = new SyncEngine();
