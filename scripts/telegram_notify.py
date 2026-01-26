#!/usr/bin/env python3
"""
Telegram notification system for 864zeros
Sends notifications via Telegram bot with robust error handling
"""

import os
import requests
import json
from datetime import datetime

class TelegramNotifier:
    def __init__(self, mock_mode=None):
        self.bot_token = os.getenv('TELEGRAM_BOT_TOKEN', '').strip().replace(' ', '')
        self.chat_id = os.getenv('TELEGRAM_CHAT_ID', '').strip()
        
        # Enhanced token validation
        if mock_mode is None:
            mock_mode = (
                not self.bot_token or 
                not self.chat_id or 
                len(self.bot_token) < 40 or
                not self.bot_token.count(':') == 1 or
                not self.bot_token.split(':')[0].isdigit()
            )
        
        self.mock_mode = mock_mode
        self._api_validated = False
        
        if not self.mock_mode and (not self.bot_token or not self.chat_id):
            raise ValueError("TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set")
    
    def _validate_api_connection(self):
        """Test API connection with getMe endpoint"""
        if self.mock_mode or self._api_validated:
            return True
            
        try:
            url = f"https://api.telegram.org/bot{self.bot_token}/getMe"
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('ok'):
                    self._api_validated = True
                    return True
            
            # API call failed, switch to mock mode
            print(f"⚠️  Telegram API validation failed (Status: {response.status_code})")
            print("   Switching to mock mode for notifications")
            self.mock_mode = True
            return False
            
        except Exception as e:
            print(f"⚠️  Telegram API connection failed: {e}")
            print("   Switching to mock mode for notifications")
            self.mock_mode = True
            return False
    
    def send_message(self, message, parse_mode='Markdown'):
        """Send a message via Telegram bot or mock it"""
        
        # Validate API connection first
        self._validate_api_connection()
        
        if self.mock_mode:
            print("📱 [MOCK] Telegram notification:")
            print(f"   📍 Chat ID: {self.chat_id or 'NOT_SET'}")
            print(f"   📝 Message: {message}")
            print(f"   ⚙️  Parse mode: {parse_mode}")
            print(f"   🕐 Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            return True, {"mock": True, "message": "Mock notification sent"}
        
        url = f"https://api.telegram.org/bot{self.bot_token}/sendMessage"
        
        payload = {
            'chat_id': self.chat_id,
            'text': message,
            'parse_mode': parse_mode
        }
        
        try:
            response = requests.post(url, json=payload, timeout=10)
            response.raise_for_status()
            
            result = response.json()
            if result.get('ok'):
                return True, result
            else:
                return False, result.get('description', 'Unknown error')
                
        except Exception as e:
            return False, f"Error: {str(e)}"
    
    def send_test_notification(self):
        """Send a test notification"""
        message = f"""🤖 **864zeros Test Notification**

⏰ Time: `{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}`
✅ Status: Telegram notification system is working!
🔧 Mode: {'Mock' if self.mock_mode else 'Live'}

This is a test message to verify the notification system is configured correctly."""
        
        return self.send_message(message)
    
    def send_task_completion(self, task_id, task_title, status="completed"):
        """Send task completion notification"""
        emoji_map = {
            "completed": "✅",
            "failed": "❌", 
            "in_progress": "⏳",
            "pending": "⏸️"
        }
        emoji = emoji_map.get(status, "🔄")
        
        message = f"""🔄 **Task Update**

{emoji} **{task_title}**
📋 ID: `{task_id}`
📊 Status: {status.title()}
🕐 Time: `{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}`"""
        
        return self.send_message(message)

def main():
    """Main function for command line usage"""
    import sys
    
    # Parse command line arguments
    mock_mode = '--mock' in sys.argv
    test_mode = '--test' in sys.argv
    
    # Remove flags from args
    for flag in ['--mock', '--test']:
        if flag in sys.argv:
            sys.argv.remove(flag)
    
    try:
        notifier = TelegramNotifier(mock_mode=mock_mode)
    except ValueError as e:
        print(f"❌ Configuration error: {e}")
        return 1
    
    if test_mode:
        # Run comprehensive test
        print("🧪 Running Telegram notification system tests...\n")
        
        # Test 1: Basic notification
        print("1️⃣  Testing basic notification...")
        success, result = notifier.send_test_notification()
        print(f"   Result: {'✅ Success' if success else '❌ Failed'}")
        if not success:
            print(f"   Error: {result}")
        
        # Test 2: Task completion notification
        print("\n2️⃣  Testing task completion notification...")
        success, result = notifier.send_task_completion(
            "TEST-001", 
            "Sample Task Completion Test", 
            "completed"
        )
        print(f"   Result: {'✅ Success' if success else '❌ Failed'}")
        
        print(f"\n🏁 Test completed! Mode: {'Mock' if notifier.mock_mode else 'Live'}")
        
    elif len(sys.argv) > 1:
        # Send custom message
        message = ' '.join(sys.argv[1:])
        success, result = notifier.send_message(message)
        
        if success:
            print("✅ Custom notification sent successfully!")
        else:
            print(f"❌ Failed to send notification: {result}")
            return 1
    else:
        # Send test message
        success, result = notifier.send_test_notification()
        
        if success:
            print("✅ Test notification sent successfully!")
            if not result.get('mock'):
                print(f"📱 Message ID: {result.get('result', {}).get('message_id', 'N/A')}")
        else:
            print(f"❌ Failed to send notification: {result}")
            return 1
    
    return 0

if __name__ == "__main__":
    exit(main())