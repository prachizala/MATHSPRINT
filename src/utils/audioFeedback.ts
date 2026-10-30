import { Vibration, Platform } from 'react-native';

export class SensoryFeedback {
  private static enabled = true;

  static setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  static isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Quick crisp pulse on correct answer (+100 PTS)
   */
  static triggerCorrectAnswer() {
    if (!this.enabled) return;
    try {
      if (Platform.OS === 'android') {
        Vibration.vibrate(35);
      } else {
        Vibration.vibrate();
      }
    } catch (_) {}
  }

  /**
   * Double warning thud on incorrect answer
   */
  static triggerIncorrectAnswer() {
    if (!this.enabled) return;
    try {
      if (Platform.OS === 'android') {
        Vibration.vibrate([0, 50, 40, 50]);
      } else {
        Vibration.vibrate();
      }
    } catch (_) {}
  }

  /**
   * Escalating energetic rumble on streak milestones (2x, 5x, 10x)
   */
  static triggerStreakMilestone(streak: number) {
    if (!this.enabled) return;
    try {
      if (Platform.OS === 'android') {
        if (streak >= 5) {
          Vibration.vibrate([0, 40, 30, 40, 30, 80]);
        } else if (streak >= 2) {
          Vibration.vibrate([0, 40, 40, 60]);
        }
      } else {
        Vibration.vibrate();
      }
    } catch (_) {}
  }

  /**
   * Urgent warning vibration when 10 seconds remain on the countdown clock
   */
  static triggerClockWarning() {
    if (!this.enabled) return;
    try {
      if (Platform.OS === 'android') {
        Vibration.vibrate([0, 60, 40, 60]);
      } else {
        Vibration.vibrate();
      }
    } catch (_) {}
  }
}
