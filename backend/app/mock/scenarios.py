"""
Preset scenario datasets builder and serializer (Feature M2-F20).
"""

import json
from pathlib import Path
from app.mock.generator import generate_mock_dataset
from app.models.enums import AttackType

DATASETS_DIR = Path(__file__).parent / "datasets"


def export_mock_datasets(key_length: int = 100) -> None:
    """Exports default mock JSON scenario files for integration testing."""
    DATASETS_DIR.mkdir(parents=True, exist_ok=True)

    scenarios = [
        ("normal.json", AttackType.NONE, 0.02, 0.0),
        ("noise.json", AttackType.NOISE, 0.02, 0.0),
        ("mitm.json", AttackType.MITM, 0.02, 0.25),
        ("forgery.json", AttackType.FORGERY, 0.02, 0.35),
        ("replay.json", AttackType.REPLAY, 0.02, 0.50),
        ("pns.json", AttackType.PNS, 0.02, 0.10),
    ]

    for filename, attack_type, baseline, attack_frac in scenarios:
        request_obj = generate_mock_dataset(
            scenario=attack_type,
            key_length=key_length,
            baseline_qber=baseline,
            attack_fraction=attack_frac,
            seed=42,
        )
        file_path = DATASETS_DIR / filename
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(request_obj.model_dump_json(indent=2))


if __name__ == "__main__":
    export_mock_datasets()
