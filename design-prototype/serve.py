#!/usr/bin/env python3
"""Static prototype plus the Linux I2C benchmark grader.

The grader matches the one on main: a temp directory, gcc, then the binary.
No virtual machine. Held-out check ids are not returned.
"""
import json
import os
import re
import shutil
import subprocess
import tempfile
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
HARNESS = (ROOT / "i2cHarness.c").read_text()
BANNED = re.compile(
    r"#\s*include|__asm|\basm\s*\(|\bsystem\s*\(|\bpopen\s*\(|\bexecve\s*\(|\bfork\s*\(|\bdlopen\s*\("
)
CC = os.environ.get("PICO_CC", "/usr/bin/gcc-13")


def score(passed: int, total: int) -> int:
    if total <= 0:
        return 0
    return round(1000 * passed / total)


def reject(source: str):
    if len(source.strip()) < 20:
        return "Write i2c_read_reg before submitting."
    if len(source) > 20_000:
        return "Submission is too large."
    if BANNED.search(source):
        return "This benchmark only accepts the transfer function, without includes or system calls."
    if "i2c_read_reg" not in source:
        return "Define i2c_read_reg."
    return None


def empty(error: str, compiled: bool = False):
    return {
        "benchmarkId": "linux-i2c-read-reg",
        "compiled": compiled,
        "compileError": error,
        "publicPassed": 0,
        "publicTotal": 5,
        "heldPassed": 0,
        "heldTotal": 4,
        "rating": 0,
        "quality": 0,
        "publicIds": [],
    }


def grade(source: str):
    rejected = reject(source)
    if rejected:
        return empty(rejected)
    env = {key: value for key, value in os.environ.items() if key != "LD_LIBRARY_PATH"}
    env["PATH"] = "/usr/bin:/bin"
    tmp = tempfile.mkdtemp(prefix="pico-i2c-")
    try:
        (Path(tmp) / "harness.c").write_text(HARNESS)
        (Path(tmp) / "user.c").write_text("#include <stddef.h>\n#include <stdint.h>\n" + source)
        try:
            subprocess.run(
                [CC, "-std=c11", "-O1", "-Wall", "-Wextra", "-o", "grade", "harness.c", "user.c"],
                cwd=tmp,
                env=env,
                timeout=15,
                check=True,
                capture_output=True,
                text=True,
            )
        except subprocess.CalledProcessError as error:
            return empty((error.stderr or "compile failed")[:2000])
        except subprocess.TimeoutExpired:
            return empty("Compile timed out.")
        try:
            run = subprocess.run(
                [str(Path(tmp) / "grade")],
                cwd=tmp,
                env=env,
                timeout=2,
                capture_output=True,
                text=True,
            )
        except subprocess.TimeoutExpired:
            return empty("Run timed out.")
        public, held = [], []
        for line in run.stdout.splitlines():
            parts = line.split()
            if len(parts) < 3 or parts[2] not in ("pass", "fail"):
                continue
            row = {"id": parts[1], "pass": parts[2] == "pass"}
            if parts[0] == "public":
                public.append(row)
            elif parts[0] == "held":
                held.append(row)
        public_passed = sum(1 for row in public if row["pass"])
        held_passed = sum(1 for row in held if row["pass"])
        public_total = len(public) or 5
        held_total = len(held) or 4
        return {
            "benchmarkId": "linux-i2c-read-reg",
            "compiled": True,
            "compileError": "",
            "publicPassed": public_passed,
            "publicTotal": public_total,
            "heldPassed": held_passed,
            "heldTotal": held_total,
            "rating": score(public_passed, public_total),
            "quality": score(held_passed, held_total),
            "publicIds": public,
        }
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_POST(self):
        if self.path.split("?", 1)[0] != "/api/benchmark/grade":
            self.send_error(404)
            return
        length = int(self.headers.get("Content-Length") or 0)
        if length <= 0 or length > 100_000:
            self.send_error(413)
            return
        try:
            body = json.loads(self.rfile.read(length))
        except json.JSONDecodeError:
            self.send_error(400)
            return
        payload = json.dumps(grade(body.get("source") or "")).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)


if __name__ == "__main__":
    ThreadingHTTPServer(("127.0.0.1", 3456), Handler).serve_forever()
