"""Multiplayer competitive Elo rating update calculator with dynamic K-factors."""


class EloRatingCalculator:
    """Computes expected score and rating delta following head-to-head match."""

    @staticmethod
    def calculate_new_ratings(player_a_rating: float, player_b_rating: float, outcome_a: float, k_factor: int = 32) -> tuple[float, float]:
        """Outcome A: 1.0 = Win, 0.5 = Draw, 0.0 = Loss."""
        expected_a = 1.0 / (1.0 + 10.0 ** ((player_b_rating - player_a_rating) / 400.0))
        expected_b = 1.0 - expected_a

        new_a = player_a_rating + k_factor * (outcome_a - expected_a)
        new_b = player_b_rating + k_factor * ((1.0 - outcome_a) - expected_b)

        return round(new_a, 1), round(new_b, 1)
