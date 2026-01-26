#!/usr/bin/env python3
import sys
import os
sys.path.append('scripts')

from telegram_notify import TelegramNotifier

# Test 1: Mock mode
print("=== Testing Mock Mode ===")
notifier_mock = TelegramNotifier(mock_mode=True)
success, result = notifier_mock.send_test_notification()
print(f"Mock test success: {success}")

# Test 2: Auto-detect mode (should go to mock due to invalid token)
print("\n=== Testing Auto-detect Mode ===")
notifier_auto = TelegramNotifier()
print(f"Auto-detected mock mode: {notifier_auto.mock_mode}")

if notifier_auto.mock_mode:
    success, result = notifier_auto.send_test_notification()
    print(f"Auto test success: {success}")
else:
    print("Would attempt real API call")

print("\n✅ Telegram notification system test completed!")