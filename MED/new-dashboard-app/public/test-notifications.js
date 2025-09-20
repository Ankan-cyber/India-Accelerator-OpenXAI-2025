// Test script to validate notification system edge cases
// Run this in the browser console to test

async function testNotificationSystem() {
  console.log('🧪 Testing Notification System Edge Cases...');
  
  // Test 1: Master notification switch disabled
  console.log('\n1. Testing master notification switch disabled...');
  try {
    const response = await fetch('/api/user-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationsEnabled: false })
    });
    
    if (response.ok) {
      console.log('✅ Master notifications disabled successfully');
      
      // Try to create a notification - should be blocked
      const notificationService = window.NotificationService?.getInstance();
      if (notificationService) {
        const testNotification = {
          userId: 'test-user',
          type: 'medication_reminder',
          title: 'Test Medication',
          message: 'This should not show',
          scheduledFor: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await notificationService.showNotification(testNotification);
        console.log('📝 Notification attempt made (should be blocked)');
      }
    }
  } catch (error) {
    console.error('❌ Error testing master switch:', error);
  }
  
  // Test 2: Quiet hours enabled
  console.log('\n2. Testing quiet hours...');
  try {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Set quiet hours to current time
    const startTime = String(currentHour).padStart(2, '0') + ':00';
    const endTime = String((currentHour + 1) % 24).padStart(2, '0') + ':00';
    
    const response = await fetch('/api/user-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notificationsEnabled: true,
        generalNotificationSettings: {
          quietHours: {
            enabled: true,
            startTime,
            endTime
          }
        }
      })
    });
    
    if (response.ok) {
      console.log(`✅ Quiet hours set: ${startTime} - ${endTime}`);
      console.log('📝 Notifications should be blocked during this time');
    }
  } catch (error) {
    console.error('❌ Error testing quiet hours:', error);
  }
  
  // Test 3: Specific notification type disabled
  console.log('\n3. Testing specific notification types...');
  try {
    const response = await fetch('/api/user-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notificationsEnabled: true,
        notificationSettings: {
          medicationReminders: { enabled: false },
          healthTips: { enabled: true },
          overdueAlerts: { enabled: false }
        },
        generalNotificationSettings: {
          quietHours: { enabled: false }
        }
      })
    });
    
    if (response.ok) {
      console.log('✅ Medication reminders and overdue alerts disabled');
      console.log('✅ Health tips enabled');
    }
  } catch (error) {
    console.error('❌ Error testing notification types:', error);
  }
  
  // Test 4: All notifications enabled
  console.log('\n4. Testing all notifications enabled...');
  try {
    const response = await fetch('/api/user-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notificationsEnabled: true,
        notificationSettings: {
          medicationReminders: { enabled: true, reminderMinutes: [5, 0] },
          healthTips: { enabled: true, dailyTime: '09:00' },
          progressReports: { enabled: true, weeklyDay: 0, weeklyTime: '18:00' },
          overdueAlerts: { enabled: true, intervalMinutes: 15, maxReminders: 2 }
        },
        generalNotificationSettings: {
          sound: true,
          vibration: true,
          showOnLockScreen: true,
          quietHours: { enabled: false }
        }
      })
    });
    
    if (response.ok) {
      console.log('✅ All notifications enabled with custom settings');
      console.log('📝 Reminders: 5 min before + at time');
      console.log('📝 Overdue alerts: every 15 min, max 2 times');
    }
  } catch (error) {
    console.error('❌ Error enabling notifications:', error);
  }
  
  // Test 5: Verify current settings
  console.log('\n5. Verifying current settings...');
  try {
    const response = await fetch('/api/user-settings');
    if (response.ok) {
      const settings = await response.json();
      console.log('📋 Current settings:', JSON.stringify(settings, null, 2));
    }
  } catch (error) {
    console.error('❌ Error fetching settings:', error);
  }
  
  console.log('\n🎉 Notification system testing complete!');
  console.log('💡 Check browser notifications and console logs for validation');
}

// Run the test
testNotificationSystem();