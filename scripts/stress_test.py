import os
import random
import threading
import time
from collections import Counter
from typing import List

import requests

BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8001")
API_TOKEN = os.getenv("API_TOKEN", "")
DURATION_SECONDS = int(os.getenv("DURATION_SECONDS", "60"))
VUS = int(os.getenv("VUS", "10"))

DEFAULT_ENDPOINTS = [
    "/api/v1/hcm/employees/",
    "/api/v1/hcm/departments/",
    "/api/v1/activities/appraisals/",
    "/api/v1/activities/kpis/",
    "/api/v1/activities/case-studies/",
    "/api/v1/activities/reports/",
    "/api/v1/activities/report-types/",
    "/api/v1/payroll/payslips/",
    "/api/v1/payroll/payroll-periods/",
    "/api/v1/analytics/summary/",
]

ENDPOINTS: List[str] = [e.strip() for e in os.getenv("ENDPOINTS", "").split(",") if e.strip()] or DEFAULT_ENDPOINTS

HEADERS = {"Accept": "application/json"}
if API_TOKEN:
    HEADERS["Authorization"] = f"Bearer {API_TOKEN}"


class Metrics:
    def __init__(self) -> None:
        self.lock = threading.Lock()
        self.counts = Counter()
        self.errors = 0
        self.total = 0

    def record(self, status: int) -> None:
        with self.lock:
            self.counts[status] += 1
            self.total += 1

    def record_error(self) -> None:
        with self.lock:
            self.errors += 1
            self.total += 1


def worker(end_time: float, metrics: Metrics) -> None:
    session = requests.Session()
    while time.time() < end_time:
        endpoint = random.choice(ENDPOINTS)
        try:
            response = session.get(f"{BASE_URL}{endpoint}", headers=HEADERS, timeout=10)
            metrics.record(response.status_code)
        except Exception:
            metrics.record_error()


def main() -> None:
    if not API_TOKEN:
        print("Warning: API_TOKEN is not set. Authenticated endpoints may return 401/403.")
    print(f"Running stress test for {DURATION_SECONDS}s with {VUS} VUs...")
    print(f"Base URL: {BASE_URL}")
    print(f"Endpoints: {', '.join(ENDPOINTS)}")

    metrics = Metrics()
    end_time = time.time() + DURATION_SECONDS

    threads = []
    for _ in range(VUS):
        t = threading.Thread(target=worker, args=(end_time, metrics), daemon=True)
        t.start()
        threads.append(t)

    for t in threads:
        t.join()

    duration = DURATION_SECONDS
    rps = metrics.total / duration if duration else 0

    print("\n=== Results ===")
    print(f"Total requests: {metrics.total}")
    print(f"Errors: {metrics.errors}")
    print(f"Requests/sec: {rps:.2f}")
    print("Status codes:")
    for status, count in metrics.counts.most_common():
        print(f"  {status}: {count}")


if __name__ == "__main__":
    main()
