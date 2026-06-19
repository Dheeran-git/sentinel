from sentinel.delivery.casestore import CaseStore


def test_save_and_list(tmp_path):
    store = CaseStore(tmp_path / "cases.sqlite")
    tid = store.new_case(category="e-waste dumping", lat=12.9, lng=77.6,
                         authority="KSPCB", address="MG Road")
    assert tid.startswith("SNT-")
    cases = store.all_cases()
    assert len(cases) == 1 and cases[0]["tracking_id"] == tid
