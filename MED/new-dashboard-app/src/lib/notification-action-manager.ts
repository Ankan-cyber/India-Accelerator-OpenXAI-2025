class NotificationActionManager {
  private static instance: NotificationActionManager;
  private actionLocks: Set<string> = new Set();

  private constructor() {}

  public static getInstance(): NotificationActionManager {
    if (!NotificationActionManager.instance) {
      NotificationActionManager.instance = new NotificationActionManager();
    }
    return NotificationActionManager.instance;
  }

  public tryLockAction(medicationId: string, scheduledTime: string, date: string): boolean {
    const key = `${medicationId}-${scheduledTime}-${date}`;
    
    if (this.actionLocks.has(key)) {
      console.log('Action already locked for:', key);
      return false;
    }
    
    this.actionLocks.add(key);
    console.log('Action locked for:', key);
    
    // Auto-release after 10 seconds to prevent permanent locks
    setTimeout(() => {
      this.releaseAction(medicationId, scheduledTime, date);
    }, 10000);
    
    return true;
  }

  public releaseAction(medicationId: string, scheduledTime: string, date: string): void {
    const key = `${medicationId}-${scheduledTime}-${date}`;
    if (this.actionLocks.has(key)) {
      this.actionLocks.delete(key);
      console.log('Action lock released for:', key);
    }
  }

  public isActionLocked(medicationId: string, scheduledTime: string, date: string): boolean {
    const key = `${medicationId}-${scheduledTime}-${date}`;
    return this.actionLocks.has(key);
  }
}

export const notificationActionManager = NotificationActionManager.getInstance();