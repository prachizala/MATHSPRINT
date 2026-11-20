"""Mental-math problem generator supporting Easy, Medium, and Hard difficulty tiers."""

import random


class ExpressionGenerator:
    """Generates balanced mental math problem sets with integer answers."""

    @staticmethod
    def generate_problem(difficulty: str = "medium") -> dict:
        """Returns problem statement and ground-truth integer answer."""
        if difficulty == "easy":
            a = random.randint(1, 20)
            b = random.randint(1, 20)
            return {"expr": f"{a} + {b}", "answer": a + b}
        elif difficulty == "medium":
            a = random.randint(5, 50)
            b = random.randint(2, 12)
            return {"expr": f"{a} * {b}", "answer": a * b}
        else:  # hard
            a = random.randint(12, 99)
            b = random.randint(11, 25)
            c = random.randint(10, 50)
            return {"expr": f"({a} * {b}) - {c}", "answer": (a * b) - c}
