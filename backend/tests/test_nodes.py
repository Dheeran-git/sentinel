from sentinel.models import ViolationCategory


def test_violation_categories_exist():
    assert ViolationCategory.EWASTE.value == "e-waste dumping"
    assert ViolationCategory.NONE.value == "no violation"
