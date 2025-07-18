import { Expense, Reminder } from '../types';

class ReminderService {
  private reminders: Reminder[] = [];

  // Generate reminders for upcoming bills
  generateReminders(expenses: Expense[], reminderDays: number = 3): Reminder[] {
    const reminders: Reminder[] = [];
    const today = new Date();

    expenses.forEach(expense => {
      if (expense.isRecurring && expense.nextDueDate) {
        const dueDate = new Date(expense.nextDueDate);
        const reminderDate = new Date(dueDate);
        reminderDate.setDate(reminderDate.getDate() - reminderDays);

        if (reminderDate <= today && dueDate >= today) {
          const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          // Create reminders for different types based on urgency
          const reminderTypes = this.getReminderTypes(daysUntilDue);
          
          reminderTypes.forEach(type => {
            const reminder: Reminder = {
              id: `${expense.id}-${type}-${daysUntilDue}`,
              expenseId: expense.id,
              dueDate: expense.nextDueDate!,
              daysBeforeReminder: reminderDays,
              type,
              isActive: true,
              sent: false,
              message: this.generateReminderMessage(expense, daysUntilDue, type)
            };
            reminders.push(reminder);
          });
        }
      }
    });

    return reminders;
  }

  private getReminderTypes(daysUntilDue: number): ('in-app' | 'sms' | 'whatsapp')[] {
    if (daysUntilDue === 0) {
      // Due today - send all types
      return ['in-app', 'sms', 'whatsapp'];
    } else if (daysUntilDue === 1) {
      // Due tomorrow - send in-app and WhatsApp
      return ['in-app', 'whatsapp'];
    } else if (daysUntilDue <= 3) {
      // Due in 2-3 days - send in-app only
      return ['in-app'];
    }
    return ['in-app'];
  }

  private generateReminderMessage(expense: Expense, daysUntilDue: number, type: 'in-app' | 'sms' | 'whatsapp'): string {
    const amount = `₹${expense.amount.toLocaleString()}`;
    const description = expense.description;
    
    if (daysUntilDue === 0) {
      switch (type) {
        case 'sms':
          return `BillBox Alert: Your ${description} bill of ${amount} is due TODAY. Don't forget to pay!`;
        case 'whatsapp':
          return `🔔 *BillBox Reminder*\n\nYour ${description} bill of ${amount} is due *TODAY*!\n\nDon't forget to pay to avoid late fees. 💰`;
        case 'in-app':
          return `Your ${description} bill of ${amount} is due today!`;
      }
    } else if (daysUntilDue === 1) {
      switch (type) {
        case 'whatsapp':
          return `📅 *BillBox Reminder*\n\nYour ${description} bill of ${amount} is due *TOMORROW*.\n\nPlan your payment to avoid any hassle! 💡`;
        case 'in-app':
          return `Your ${description} bill of ${amount} is due tomorrow.`;
      }
    } else {
      return `Your ${description} bill of ${amount} is due in ${daysUntilDue} days.`;
    }
    
    return `Bill reminder: ${description} - ${amount}`;
  }

  // Send WhatsApp reminder
  sendWhatsAppReminder(reminder: Reminder, phoneNumber: string): void {
    const message = encodeURIComponent(reminder.message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  }

  // Send SMS reminder (would integrate with SMS service)
  sendSMSReminder(reminder: Reminder, phoneNumber: string): void {
    // In a real app, this would integrate with an SMS service like Twilio
    console.log(`SMS Reminder to ${phoneNumber}: ${reminder.message}`);
    
    // For demo, we'll show a notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('BillBox SMS Reminder', {
        body: reminder.message,
        icon: '/favicon.ico'
      });
    }
  }

  // Send in-app notification
  sendInAppNotification(reminder: Reminder): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('BillBox Reminder', {
        body: reminder.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // Process all pending reminders
  processReminders(expenses: Expense[], settings: any): void {
    const reminders = this.generateReminders(expenses, settings.reminderDays);
    
    reminders.forEach(reminder => {
      if (!reminder.sent && reminder.isActive) {
        switch (reminder.type) {
          case 'in-app':
            this.sendInAppNotification(reminder);
            break;
          case 'whatsapp':
            if (settings.whatsappNumber) {
              this.sendWhatsAppReminder(reminder, settings.whatsappNumber);
            }
            break;
          case 'sms':
            if (settings.phoneNumber) {
              this.sendSMSReminder(reminder, settings.phoneNumber);
            }
            break;
        }
        reminder.sent = true;
      }
    });
  }
}

export const reminderService = new ReminderService();