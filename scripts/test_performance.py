#!/usr/bin/env python3
"""
Performance testing script for Impact_ID application.
Measures test execution times, memory usage, and generates performance reports.
"""

import time
import psutil
import os
import subprocess
import json
from datetime import datetime
from pathlib import Path


class TestPerformanceMonitor:
    """Monitor and measure test performance metrics."""
    
    def __init__(self):
        self.results = {
            'timestamp': datetime.now().isoformat(),
            'backend_tests': {},
            'frontend_tests': {},
            'system_metrics': {}
        }
        self.process = psutil.Process(os.getpid())
    
    def measure_backend_tests(self):
        """Measure backend test performance."""
        print("🔍 Measuring backend test performance...")
        
        test_commands = [
            ("Unit Tests", ["python", "-m", "pytest", "backend/app/tests/test_security_utils.py", "-v", "--tb=short"]),
            ("Integration Tests", ["python", "-m", "pytest", "backend/app/tests/test_badges_comprehensive.py", "-v", "--tb=short"]),
            ("Comprehensive Tests", ["python", "-m", "pytest", "backend/app/tests/test_comprehensive_coverage.py", "-v", "--tb=short"]),
            ("Smoke Test", ["python", "-m", "pytest", "backend/app/tests/test_hello.py", "-v"])
        ]
        
        for test_name, command in test_commands:
            print(f"  Running {test_name}...")
            result = self._run_timed_command(command)
            self.results['backend_tests'][test_name] = result
            print(f"    ✓ Completed in {result['duration']:.2f}s")
    
    def measure_frontend_tests(self):
        """Measure frontend test performance."""
        print("🎨 Measuring frontend test performance...")
        
        # Change to frontend directory for npm commands
        frontend_dir = Path(__file__).parent.parent / "frontend"
        
        test_commands = [
            ("All Tests", ["npm", "test", "--", "--run", "--reporter=basic"]),
            ("Coverage", ["npm", "run", "test:coverage", "--", "--run", "--reporter=basic"])
        ]
        
        for test_name, command in test_commands:
            print(f"  Running {test_name}...")
            result = self._run_timed_command(command, cwd=frontend_dir)
            self.results['frontend_tests'][test_name] = result
            print(f"    ✓ Completed in {result['duration']:.2f}s")
    
    def measure_system_metrics(self):
        """Measure system resource usage."""
        print("📊 Measuring system metrics...")
        
        # Memory usage
        memory = self.process.memory_info()
        self.results['system_metrics']['memory_rss_mb'] = memory.rss / 1024 / 1024
        self.results['system_metrics']['memory_vms_mb'] = memory.vms / 1024 / 1024
        
        # CPU usage
        cpu_percent = self.process.cpu_percent()
        self.results['system_metrics']['cpu_percent'] = cpu_percent
        
        # System memory
        system_memory = psutil.virtual_memory()
        self.results['system_metrics']['system_memory_percent'] = system_memory.percent
        self.results['system_metrics']['system_memory_available_gb'] = system_memory.available / 1024 / 1024 / 1024
        
        print(f"  Memory: {self.results['system_metrics']['memory_rss_mb']:.1f} MB")
        print(f"  CPU: {cpu_percent:.1f}%")
        print(f"  System Memory: {system_memory.percent:.1f}% used")
    
    def _run_timed_command(self, command, cwd=None):
        """Run a command and measure its performance."""
        start_time = time.time()
        start_memory = self.process.memory_info().rss
        
        try:
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                timeout=300,  # 5 minute timeout
                cwd=cwd
            )
            
            end_time = time.time()
            end_memory = self.process.memory_info().rss
            
            return {
                'duration': end_time - start_time,
                'memory_delta_mb': (end_memory - start_memory) / 1024 / 1024,
                'return_code': result.returncode,
                'stdout_length': len(result.stdout),
                'stderr_length': len(result.stderr),
                'success': result.returncode == 0
            }
        
        except subprocess.TimeoutExpired:
            return {
                'duration': 300,  # timeout duration
                'memory_delta_mb': 0,
                'return_code': -1,
                'stdout_length': 0,
                'stderr_length': 0,
                'success': False,
                'error': 'Timeout'
            }
        
        except Exception as e:
            return {
                'duration': time.time() - start_time,
                'memory_delta_mb': 0,
                'return_code': -1,
                'stdout_length': 0,
                'stderr_length': 0,
                'success': False,
                'error': str(e)
            }
    
    def generate_report(self):
        """Generate performance report."""
        print("\n📈 Performance Report")
        print("=" * 50)
        
        # Backend tests summary
        print("\n🔧 Backend Tests:")
        total_backend_time = 0
        backend_success_count = 0
        
        for test_name, result in self.results['backend_tests'].items():
            status = "✅ PASS" if result['success'] else "❌ FAIL"
            print(f"  {test_name}: {result['duration']:.2f}s {status}")
            total_backend_time += result['duration']
            if result['success']:
                backend_success_count += 1
        
        print(f"  Total Backend Time: {total_backend_time:.2f}s")
        print(f"  Success Rate: {backend_success_count}/{len(self.results['backend_tests'])}")
        
        # Frontend tests summary
        print("\n🎨 Frontend Tests:")
        total_frontend_time = 0
        frontend_success_count = 0
        
        for test_name, result in self.results['frontend_tests'].items():
            status = "✅ PASS" if result['success'] else "❌ FAIL"
            print(f"  {test_name}: {result['duration']:.2f}s {status}")
            total_frontend_time += result['duration']
            if result['success']:
                frontend_success_count += 1
        
        print(f"  Total Frontend Time: {total_frontend_time:.2f}s")
        print(f"  Success Rate: {frontend_success_count}/{len(self.results['frontend_tests'])}")
        
        # System metrics
        print("\n💻 System Metrics:")
        metrics = self.results['system_metrics']
        print(f"  Memory Usage: {metrics['memory_rss_mb']:.1f} MB")
        print(f"  System Memory Available: {metrics['system_memory_available_gb']:.1f} GB")
        print(f"  CPU Usage: {metrics['cpu_percent']:.1f}%")
        
        # Performance analysis
        print("\n🎯 Performance Analysis:")
        total_time = total_backend_time + total_frontend_time
        print(f"  Total Test Time: {total_time:.2f}s")
        
        # Performance benchmarks
        if total_backend_time < 30:
            print("  ✅ Backend tests are performing well (< 30s)")
        elif total_backend_time < 60:
            print("  ⚠️  Backend tests are acceptable (30-60s)")
        else:
            print("  ❌ Backend tests are slow (> 60s)")
        
        if total_frontend_time < 60:
            print("  ✅ Frontend tests are performing well (< 60s)")
        elif total_frontend_time < 120:
            print("  ⚠️  Frontend tests are acceptable (60-120s)")
        else:
            print("  ❌ Frontend tests are slow (> 120s)")
        
        return self.results
    
    def save_results(self, filename="test_performance_results.json"):
        """Save results to JSON file."""
        results_file = Path(__file__).parent.parent / filename
        
        with open(results_file, 'w') as f:
            json.dump(self.results, f, indent=2)
        
        print(f"\n💾 Results saved to: {results_file}")
        return results_file


def main():
    """Main performance testing function."""
    print("🚀 Impact_ID Test Performance Monitor")
    print("=" * 50)
    
    monitor = TestPerformanceMonitor()
    
    try:
        # Measure system baseline
        monitor.measure_system_metrics()
        
        # Run backend tests
        monitor.measure_backend_tests()
        
        # Run frontend tests (if available)
        try:
            monitor.measure_frontend_tests()
        except Exception as e:
            print(f"⚠️  Frontend tests skipped: {e}")
        
        # Generate report
        results = monitor.generate_report()
        
        # Save results
        monitor.save_results()
        
        print("\n✅ Performance monitoring completed!")
        
        return results
        
    except KeyboardInterrupt:
        print("\n🛑 Performance monitoring interrupted by user")
        return monitor.results
    
    except Exception as e:
        print(f"\n❌ Error during performance monitoring: {e}")
        return monitor.results


if __name__ == "__main__":
    main()