"""Capture local BE HTTP examples in a disposable SQLite database, never production.

Run with the BE virtualenv. The output is documentation data, not an MSW handler.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
from tempfile import TemporaryDirectory
from uuid import uuid4


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--backend", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    backend, output = args.backend.resolve(), args.output.resolve()
    assert (backend / "app/main.py").is_file(), "Pass a BE checkout"
    revision = subprocess.check_output(["git", "-C", str(backend), "rev-parse", "HEAD"], text=True).strip()
    assert not subprocess.check_output(
        ["git", "-C", str(backend), "status", "--porcelain"], text=True
    ).strip(), "Capture from a clean checkout"
    output.mkdir(parents=True, exist_ok=True)
    sys.path.insert(0, str(backend))

    with TemporaryDirectory(prefix="team10-fe-fixtures-") as directory:
        os.environ.update(DATABASE_URL=f"sqlite:///{directory}/fixtures.db", DEMO_MODE="true",
                          STORAGE_DIR=f"{directory}/storage", GROQ_API_KEY="", UPSTAGE_API_KEY="")
        from alembic import command
        from fastapi.testclient import TestClient
        from sqlalchemy import select
        from app.db import schema as t
        from app.db import session
        from app.db.migrations import migration_config
        from app.main import app

        with session.engine.connect() as connection:
            command.upgrade(migration_config(connection), "head")
            connection.commit()
        with TestClient(app) as client:
            # Only this disposable database receives a new anonymous account.
            created = client.post("/api/session")
            assert created.status_code == 200, created.text
            headers = {"X-Anonymous-Id": created.json()["data"]["anonymousId"]}

            def request(name, method, path, body=None, status=200):
                response = client.request(method, path, json=body, headers=headers)
                assert response.status_code == status, (name, response.status_code, response.text)
                assert response.headers.get("cache-control") == "no-store"
                return {
                    "case": name,
                    "request": {"method": method, "path": path, **({"body": body} if body is not None else {})},
                    "response": {"status": status, "headers": {"Cache-Control": "no-store"}, "body": response.json()},
                }

            def save(filename, cases, notes):
                document = {"kind": "captured-local-http", "backendSha": revision,
                            "database": "disposable SQLite", "idsAreExamples": True,
                            "productionVerified": False, "notes": notes, "cases": cases}
                (output / filename).write_text(json.dumps(document, ensure_ascii=False, indent=2) + "\n")

            day9 = request("day9-today", "GET", "/api/today")
            today = day9["response"]["body"]["data"]
            assert (today["progress"]["donePages"], today["progress"]["totalPages"], today["progress"]["rate"]) == (18, 27, 67)
            active = request("day9-focus-active", "GET", "/api/study/sessions/active")
            focus = active["response"]["body"]["data"]
            assert focus is not None
            ended = request("day9-focus-end", "POST", f"/api/study/sessions/{focus['id']}/end")
            task_id = focus["taskId"]
            record = request("day9-partial-record", "POST", "/api/records",
                             {"taskId": task_id, "sessionId": focus["id"], "result": "partial", "toPage": 13})
            after = request("day9-after-record", "GET", "/api/today")
            assert after["response"]["body"]["data"]["progress"]["rate"] == 74
            save("study-day9.json", [day9, active, ended, record, after], [
                "Initial focus elapsed time is 42 minutes and continues advancing; timestamps are examples.",
                "The initial source has known D-03 notification follow-ups; this is observed behavior, not their acceptance oracle.",
                "Replace example IDs with the current session's server response IDs.",
            ])

            ai_subject = next(s["id"] for s in today["subjects"] if s["name"] == "인공지능")
            quiz = request("quiz-before-answer", "GET", f"/api/quiz/{ai_subject}")
            quiz_data = quiz["response"]["body"]["data"]
            assert quiz_data["quizId"] and quiz_data["questions"]
            hidden = {"page", "evidence", "answer", "correct", "score", "explanation", "gradingStatus"}
            assert all(not hidden.intersection(question) for question in quiz_data["questions"])
            save("quiz-unanswered.json", [quiz], [
                "questions[].id is a quiz item ID, not the source question ID.",
                "Q-03 savedAnswers and answer-save API are still a follow-up at this capture SHA.",
                "No grading/provider call or submission was performed.",
            ])

            # Build a second owned PDF with the same displayed unit number.
            # This is an explicit synthetic database setup, followed by the real HTTP GET.
            with session.engine.begin() as connection:
                original = dict(connection.execute(select(t.study_task_ranges).where(
                    t.study_task_ranges.c.task_id == task_id)).mappings().first())
                unit = dict(connection.execute(select(t.units).where(
                    t.units.c.id == original["unit_id"])).mappings().one())
                material = dict(connection.execute(select(t.materials).where(
                    t.materials.c.id == unit["material_id"])).mappings().one())
                material.update(id=str(uuid4()), original_name="fixture-second.pdf",
                                sha256=hashlib.sha256(b"synthetic-second-pdf-fixture").hexdigest(),
                                storage_key=None, original_storage_key=None)
                connection.execute(t.materials.insert().values(**material))
                unit.update(id=str(uuid4()), material_id=material["id"], start_page=1, end_page=5)
                connection.execute(t.units.insert().values(**unit))
                original.update(id=str(uuid4()), unit_id=unit["id"], concept_id=None,
                                start_page=1, end_page=5, sort_order=original["sort_order"] + 1)
                connection.execute(t.study_task_ranges.insert().values(**original))
            compound = request("compound-task-two-pdfs", "GET", "/api/today")
            task = next(item for item in compound["response"]["body"]["data"]["tasks"] if item["id"] == task_id)
            assert task["pages"] == 14 and task["donePages"] == 2
            assert task["from"] is None and task["to"] is None and task["unitNo"] is None
            assert len({item["materialId"] for item in task["ranges"]}) == 2
            save("study-compound.json", [compound], [
                "Synthetic setup: one task gains a second owned PDF's same-number unit, p.1-5.",
                "The HTTP response is real. 9+5=14 pages; only original p.12-13 are complete.",
                "Top-level from/to/unitNo are null; adapters must preserve pages and range identity.",
            ])

            request("select-empty", "POST", "/api/demo/seed", {"seed": "empty"})
            empty = [request("empty-demo-state", "GET", "/api/demo/state"),
                     request("empty-onboarding", "GET", "/api/onboarding"),
                     request("empty-books", "GET", "/api/books"),
                     request("empty-focus", "GET", "/api/study/sessions/active"),
                     request("empty-today", "GET", "/api/today", status=404)]
            assert empty[0]["response"]["body"]["data"]["firstExam"] is None
            assert empty[1]["response"]["body"]["data"]["done"] is False
            assert empty[3]["response"]["body"]["data"] is None
            save("session-empty.json", empty, [
                "firstExam and the active focus session can be null; an empty onboarding is not done.",
                "404 NO_PLAN is the documented empty today response, not a transport outage.",
            ])
            calendar = [request("draft-calendar-empty", "GET", "/api/onboarding/calendar"),
                        request("draft-calendar-weekly", "POST", "/api/onboarding/events",
                                {"kind": "class", "title": "예제 수업", "days": [1, 3],
                                 "start": "09:00", "end": "11:00"})]
            assert calendar[1]["response"]["body"]["data"]["summary"]["fixedMinutes"] == 240
            save("onboarding-calendar.json", calendar, [
                "O-02 is present in this local SHA, not in checkpoint app4c20454.",
                "General CRUD returns addedId:null; natural-language highlighting belongs to O-03.",
            ])
        session.engine.dispose()
    print(f"Captured 5 fixture files from {revision}; temporary database removed.")


if __name__ == "__main__":
    main()
