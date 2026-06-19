from sentinel.graph.nodes import resolve_clarification_location, BENGALURU_CENTRE


def test_keeps_existing_location():
    assert resolve_clarification_location("anything", (1.0, 2.0)) == (1.0, 2.0)


def test_uses_dict_location():
    assert resolve_clarification_location({"location": [12.9, 77.6]}, None) == (12.9, 77.6)


def test_empty_answer_falls_back_to_centre():
    assert resolve_clarification_location("", None) == BENGALURU_CENTRE
