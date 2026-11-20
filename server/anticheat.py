"""Anti-cheat keystroke timing and submission anomaly detector."""


class KeystrokeAnomalyDetector:
    """Detects superhuman answer speeds and synthetic bot submissions."""

    HUMAN_REACTION_FLOOR_MS = 180  # Physiological latency floor in milliseconds

    @classmethod
    def is_submission_suspicious(cls, latency_ms: float, delta_variances: list[float]) -> bool:
        """Flags submissions with sub-human response times or zero timing variance."""
        if latency_ms < cls.HUMAN_REACTION_FLOOR_MS:
            return True  # Impossible human reaction time
        if delta_variances and len(delta_variances) >= 3 and max(delta_variances) - min(delta_variances) < 1.0:
            return True  # Bot-like constant interval submission
        return False
