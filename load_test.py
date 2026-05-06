#!/usr/bin/env python
"""Load test script for HRMS backend performance validation.

Tests key optimized endpoints to measure latency improvements.

Usage:
    python load_test.py <base_url> <username> <password> [num_requests]

Example:
    python load_test.py http://localhost:8000 admin admin123 50
    python load_test.py https://hrms-backend.onrender.com admin admin123 100
"""

import sys
import time
import requests
from statistics import mean, median, stdev
from urllib.parse import urljoin
from collections import defaultdict

class LoadTester:
    def __init__(self, base_url, username, password, num_requests=50):
        self.base_url = base_url.rstrip('/')
        self.username = username
        self.password = password
        self.num_requests = num_requests
        self.results = defaultdict(list)
        self.errors = defaultdict(int)
        self.access_token = None
        self.workspace_id = None
        self._get_access_token()
        
    def _get_access_token(self):
        """Authenticate and get JWT access token."""
        print("[AUTH] Authenticating...")
        url = urljoin(self.base_url, '/api/v1/auth/token/')
        
        try:
            response = requests.post(
                url,
                json={'username': self.username, 'password': self.password},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.access_token = data.get('access')
                self.workspace_id = data.get('selected_workspace_id') or data.get('default_workspace_id')
                if self.access_token:
                    print("[OK] Authentication successful")
                    if self.workspace_id:
                        print(f"[OK] Workspace selected: {self.workspace_id}")
                    else:
                        print("[WARN] No workspace id found in token response")
                else:
                    print("[ERROR] No access token in response")
                    sys.exit(1)
            else:
                print(f"[ERROR] Authentication failed: HTTP {response.status_code}")
                print(f"  Response: {response.text}")
                sys.exit(1)
        except Exception as e:
            print(f"[ERROR] Authentication error: {type(e).__name__}: {e}")
            sys.exit(1)
        
    def _get_headers(self):
        """Return headers with JWT authentication."""
        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
        if self.workspace_id:
            headers['X-Workspace-ID'] = str(self.workspace_id)
        return headers
    
    def test_endpoint(self, endpoint_name, path, params=None):
        """
        Load test a single endpoint.
        
        Args:
            endpoint_name: Human-readable name for the endpoint
            path: API endpoint path (e.g., '/api/hcm/employees/')
            params: Query parameters dict (optional)
        """
        url = urljoin(self.base_url, path)
        headers = self._get_headers()
        
        print(f"\n[TEST] {endpoint_name}...")
        print(f"   URL: {url}")
        print(f"   Requests: {self.num_requests}")
        
        latencies = []
        
        for i in range(self.num_requests):
            try:
                start = time.time()
                response = requests.get(
                    url,
                    headers=headers,
                    params=params,
                    timeout=30
                )
                elapsed = (time.time() - start) * 1000  # Convert to ms
                
                if response.status_code == 200:
                    latencies.append(elapsed)
                    if (i + 1) % 10 == 0:
                        print(f"   [OK] Request {i+1}/{self.num_requests}: {elapsed:.1f}ms")
                else:
                    self.errors[endpoint_name] += 1
                    print(f"   [ERR] Request {i+1}: HTTP {response.status_code}")
                    
            except requests.exceptions.Timeout:
                self.errors[endpoint_name] += 1
                print(f"   [ERR] Request {i+1}: Timeout")
            except Exception as e:
                self.errors[endpoint_name] += 1
                print(f"   [ERR] Request {i+1}: {type(e).__name__}")
        
        if latencies:
            self.results[endpoint_name] = {
                'min': min(latencies),
                'max': max(latencies),
                'mean': mean(latencies),
                'median': median(latencies),
                'p95': sorted(latencies)[int(len(latencies) * 0.95)] if len(latencies) > 20 else 'N/A',
                'stdev': stdev(latencies) if len(latencies) > 1 else 0,
                'count': len(latencies),
            }
        
        return latencies
    
    def run(self):
        """Run the full load test suite."""
        print("=" * 70)
        print("HRMS Backend Load Test Suite")
        print("=" * 70)
        print(f"Base URL: {self.base_url}")
        print(f"Total requests per endpoint: {self.num_requests}")
        print(f"Start time: {time.strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 70)
        
        # Test endpoints (order matches optimization priority)
        self.test_endpoint(
            'Employees List (N+1 Fixed)',
            '/api/v1/hcm/employees/',
            params={'page_size': 20}
        )
        
        self.test_endpoint(
            'KPI Summary (Cached)',
            '/api/v1/performance/kpis/summary/',
            params={}
        )
        
        self.test_endpoint('Recruitment Funnel (Cached)', '/api/v1/performance/kpis/recruitment_funnel/')
        self.test_endpoint('Department Distribution (Cached)', '/api/v1/performance/kpis/department_distribution/')
        
        self.test_endpoint(
            'Department List (Reference)',
            '/api/v1/hcm/departments/',
            params={'page_size': 20}
        )
        
        # Print results
        self._print_results()
    
    def _print_results(self):
        """Print comprehensive results summary."""
        print("\n" + "=" * 70)
        print("Load Test Results Summary")
        print("=" * 70)
        
        for endpoint_name, metrics in self.results.items():
            errors = self.errors.get(endpoint_name, 0)
            success_rate = ((metrics['count'] / self.num_requests) * 100)
            
            print(f"\n{endpoint_name}")
            print(f"  Success: {metrics['count']}/{self.num_requests} ({success_rate:.1f}%)")
            if errors > 0:
                print(f"  Errors: {errors}")
            print(f"  Min:     {metrics['min']:.1f}ms")
            print(f"  Max:     {metrics['max']:.1f}ms")
            print(f"  Mean:    {metrics['mean']:.1f}ms")
            print(f"  Median:  {metrics['median']:.1f}ms")
            if isinstance(metrics['p95'], str):
                print(f"  P95:     {metrics['p95']}")
            else:
                print(f"  P95:     {metrics['p95']:.1f}ms")
            print(f"  StdDev:  {metrics['stdev']:.1f}ms")
        
        # Overall summary
        print("\n" + "=" * 70)
        print("Overall Performance Assessment")
        print("=" * 70)
        
        if not self.results:
            print("[WARN] No successful requests. Check connectivity and authentication.")
            return
        
        all_latencies = []
        for metrics in self.results.values():
            all_latencies.extend([metrics['min'], metrics['max'], metrics['mean']])
        
        avg_mean = mean([m['mean'] for m in self.results.values()])
        total_errors = sum(self.errors.values())
        
        print(f"Average response time across all endpoints: {avg_mean:.1f}ms")
        print(f"Total errors: {total_errors}")
        
        # Performance targets
        targets = {
            'Excellent': avg_mean < 200,
            'Good': avg_mean < 500,
            'Fair': avg_mean < 1000,
            'Slow': avg_mean >= 1000,
        }
        
        for rating, met in targets.items():
            if met:
                print(f"[OK] Rating: {rating} ({avg_mean:.1f}ms is below {300 if rating == 'Excellent' else 500 if rating == 'Good' else 1000}ms target)")
                break
        
        print("=" * 70)
        print(f"End time: {time.strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 70)


def main():
    if len(sys.argv) < 4:
        print("Usage: python load_test.py <base_url> <username> <password> [num_requests]")
        print("\nExamples:")
        print("  python load_test.py http://localhost:8000 admin admin123 50")
        print("  python load_test.py https://hrms-backend.onrender.com admin admin123 100")
        sys.exit(1)
    
    base_url = sys.argv[1]
    username = sys.argv[2]
    password = sys.argv[3]
    num_requests = int(sys.argv[4]) if len(sys.argv) > 4 else 50
    
    tester = LoadTester(base_url, username, password, num_requests)
    tester.run()


if __name__ == '__main__':
    main()
