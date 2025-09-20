import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Notification, Medication, UserSettings, MedicationLog } from '@/lib/models';
import { NotificationService } from '@/lib/notification-service';
import { NotificationType, NotificationStatus } from '@/lib/notification-types';

export async function POST(request: NextRequest) {
  try {
    // Verify this is a cron job request (you might want to add authentication)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const notificationService = NotificationService.getInstance();

    // Get current time
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // 1. Process medication reminders
    await processMedicationReminders(currentTime, notificationService);
    
    // 2. Process health tips (daily at 9 AM)
    if (currentTime === '09:00') {
      await processHealthTips(notificationService);
    }
    
    // 3. Process weekly progress reports (Sundays at 6 PM)
    if (now.getDay() === 0 && currentTime === '18:00') {
      await processProgressReports();
    }
    
    // 4. Send pending notifications
    await sendPendingNotifications(notificationService);

    return NextResponse.json({ success: true, timestamp: now.toISOString() });
  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function processMedicationReminders(currentTime: string, notificationService: NotificationService) {
  try {
    // Get all active medications
    const medications = await Medication.find({ isActive: true }).lean();
    
    for (const medication of medications) {
      // Get user settings for reminder preferences
      const reminderMinutes = [15, 0]; // Default reminder times
      
      for (const scheduledTime of medication.times) {
        for (const reminderBefore of reminderMinutes) {
          const [hours, minutes] = scheduledTime.split(':').map(Number);
          const reminderTime = new Date();
          reminderTime.setHours(hours, minutes - reminderBefore, 0, 0);
          
          const reminderTimeStr = `${reminderTime.getHours().toString().padStart(2, '0')}:${reminderTime.getMinutes().toString().padStart(2, '0')}`;
          
          if (reminderTimeStr === currentTime) {
            // Check if medication has already been taken today
            const today = new Date().toISOString().split('T')[0];
            const existingLog = await MedicationLog.findOne({
              userId: medication.userId,
              medicationId: String(medication._id),
              scheduledTime: scheduledTime,
              takenAt: {
                $gte: new Date(today),
                $lt: new Date(today + 'T23:59:59')
              }
            });

            // If medication is already taken for this time today, skip notification
            if (existingLog) {
              console.log(`Medication ${medication.name} already taken today at ${scheduledTime}, skipping notification`);
              continue;
            }

            // Check if notification already exists for today
            const existingNotification = await Notification.findOne({
              userId: medication.userId,
              type: NotificationType.MEDICATION_REMINDER,
              'data.medicationId': String(medication._id),
              'data.scheduledTime': scheduledTime,
              createdAt: {
                $gte: new Date(today),
                $lt: new Date(today + 'T23:59:59')
              }
            });

            if (!existingNotification) {
              const notification = notificationService.generateMedicationReminder(
                (medication.userId as string),
                String(medication._id),
                medication.name,
                medication.dosage,
                scheduledTime,
                reminderBefore
              );

              // Save notification to database
              const notificationDoc = new Notification(notification);
              await notificationDoc.save();
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Failed to process medication reminders:', error);
  }
}

async function processHealthTips(notificationService: NotificationService) {
  try {
    // Get all users with health tips enabled
    const userSettings = await UserSettings.find({
      'notificationSettings.healthTips.enabled': true
    }).lean();

    for (const settings of userSettings) {
      // Generate a health tip notification
      const healthTips = [
        "Remember to take medications with food if recommended by your doctor.",
        "Stay hydrated - drink at least 8 glasses of water daily.",
        "Keep a medication journal to track how you feel.",
        "Set up a pill organizer at the beginning of each week.",
        "Store medications in a cool, dry place away from sunlight.",
      ];

      const randomTip = healthTips[Math.floor(Math.random() * healthTips.length)];
      const notification = notificationService.generateHealthTipNotification(
        String(settings.userId),
        randomTip,
        'Daily Wellness'
      );

      // Save notification to database
      const notificationDoc = new Notification(notification);
      await notificationDoc.save();
    }
  } catch (error) {
    console.error('Failed to process health tips:', error);
  }
}

async function processProgressReports() {
  try {
    // Implementation for weekly progress reports
    // This would calculate medication adherence for the past week
    console.log('Processing weekly progress reports...');
    // TODO: Implement progress calculation and notification generation
  } catch (error) {
    console.error('Failed to process progress reports:', error);
  }
}

async function sendPendingNotifications(notificationService: NotificationService) {
  try {
    const now = new Date();
    
    // Get pending notifications that should be sent now
    const pendingNotifications = await Notification.find({
      status: NotificationStatus.PENDING,
      scheduledFor: { $lte: now },
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: now } }
      ]
    }).lean();

    for (const notification of pendingNotifications) {
      // Convert MongoDB document to INotification interface
      const notificationData = {
        id: String(notification._id),
        userId: String(notification.userId),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        priority: notification.priority,
        status: notification.status,
        scheduledFor: notification.scheduledFor,
        sentAt: notification.sentAt,
        readAt: notification.readAt,
        expiresAt: notification.expiresAt,
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt,
      };
      
      // Send the notification (this would trigger browser/push notifications)
      await notificationService.showNotification(notificationData);
      
      // Mark as sent
      await Notification.findByIdAndUpdate(notification._id, {
        status: NotificationStatus.SENT,
        sentAt: now,
        updatedAt: now,
      });
    }

    console.log(`Sent ${pendingNotifications.length} pending notifications`);
  } catch (error) {
    console.error('Failed to send pending notifications:', error);
  }
}