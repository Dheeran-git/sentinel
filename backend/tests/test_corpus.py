from sentinel.knowledge.corpus import load_chunks


def test_load_chunks_tags_act_and_section():
    chunks = load_chunks()
    assert len(chunks) > 0
    sample = chunks[0]
    assert sample.act
    assert sample.section
    assert sample.text
    assert any("e-waste" in c.act.lower() for c in chunks)
