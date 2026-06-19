"""Wire nodes into the SENTINEL StateGraph with HITL interrupts."""
import sqlite3
from pathlib import Path

from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.graph import END, START, StateGraph

from sentinel.graph.nodes import (
    act_node, approve_node, ask_user_node, execute_node,
    investigate_node, perceive_node, refine_node,
)
from sentinel.graph.state import CaseState
from sentinel.investigation.grounding import is_grounded
from sentinel.models import Grounding


def _after_perceive(state) -> str:
    return "ask_user" if state.get("needs_clarification") else "investigate"


def _after_investigate(state) -> str:
    g = Grounding(**state["grounding"])
    if is_grounded(g):
        return "act"
    if state.get("grounding_attempts", 0) >= 2:
        return "act"
    return "investigate"


def _after_approve(state) -> str:
    decision = state.get("approval")
    if decision == "approved":
        return "execute"
    if decision == "edit":
        return "refine"
    return END


def build_graph(checkpoint_path: str = "sentinel/data/checkpoints.sqlite"):
    """Return a compiled graph with a SQLite checkpointer for HITL resume."""
    Path(checkpoint_path).parent.mkdir(parents=True, exist_ok=True)
    g = StateGraph(CaseState)
    g.add_node("perceive", perceive_node)
    g.add_node("ask_user", ask_user_node)
    g.add_node("investigate", investigate_node)
    g.add_node("act", act_node)
    g.add_node("approve", approve_node)
    g.add_node("refine", refine_node)
    g.add_node("execute", execute_node)

    g.add_edge(START, "perceive")
    g.add_conditional_edges("perceive", _after_perceive,
                            {"ask_user": "ask_user", "investigate": "investigate"})
    g.add_edge("ask_user", "investigate")
    g.add_conditional_edges("investigate", _after_investigate,
                            {"act": "act", "investigate": "investigate"})
    g.add_edge("act", "approve")
    g.add_conditional_edges("approve", _after_approve,
                            {"execute": "execute", "refine": "refine", END: END})
    g.add_edge("refine", "approve")
    g.add_edge("execute", END)

    conn = sqlite3.connect(checkpoint_path, check_same_thread=False)
    saver = SqliteSaver(conn)
    return g.compile(checkpointer=saver)
