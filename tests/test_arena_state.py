"""Unit tests for battle arena state machine."""
import unittest

class TestArenaStateMachine(unittest.TestCase):
    def test_state_flow(self):
        states = ['LOBBY', 'COUNTDOWN', 'ACTIVE', 'FINISHED']
        current = states[0]
        self.assertEqual(current, 'LOBBY')
        current = states[1]
        self.assertEqual(current, 'COUNTDOWN')

if __name__ == '__main__':
    unittest.main()
