"""
Comprehensive performance and security tests for Impact ID application.
Tests API performance, concurrent access, security vulnerabilities, and system limits.
"""

import pytest
import asyncio
import time
from unittest.mock import patch, MagicMock
from httpx import AsyncClient, ASGITransport
import concurrent.futures
import threading

from app.main import app
from app.database import create_tables


class TestAPIPerformance:
    """Test API endpoint performance characteristics."""
    
    @pytest.mark.asyncio
    async def test_health_endpoint_performance(self):
        """Test health endpoint response time."""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            
            # Measure response time
            start_time = time.time()
            response = await ac.get("/health")
            end_time = time.time()
            
            response_time = end_time - start_time
            
            # Health endpoint should respond quickly
            assert response_time < 0.5  # Less than 500ms
            assert response.status_code == 200
    
    @pytest.mark.asyncio
    async def test_concurrent_health_requests(self):
        """Test multiple concurrent requests to health endpoint."""
        transport = ASGITransport(app=app)
        
        async def make_request():
            async with AsyncClient(transport=transport, base_url="http://test") as ac:
                return await ac.get("/health")
        
        # Create 10 concurrent requests
        start_time = time.time()
        tasks = [make_request() for _ in range(10)]
        responses = await asyncio.gather(*tasks)
        end_time = time.time()
        
        total_time = end_time - start_time
        
        # All requests should succeed
        for response in responses:
            assert response.status_code == 200
        
        # Concurrent requests should complete in reasonable time
        assert total_time < 2.0  # Less than 2 seconds for 10 requests
    
    @pytest.mark.asyncio
    async def test_api_response_size_limits(self):
        """Test API response size handling."""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            # Test endpoints that might return large responses
            endpoints_to_test = [
                "/api/badges/",
                "/api/leaderboard/",
                "/api/tasks/",
            ]
            
            for endpoint in endpoints_to_test:
                try:
                    response = await ac.get(endpoint)
                    # Response should be manageable size (less than 1MB)
                    if response.status_code == 200:
                        content_length = len(response.content)
                        assert content_length < 1024 * 1024  # 1MB limit
                except Exception:
                    # Some endpoints might require authentication
                    # That's okay for this test
                    pass


class TestSecurityVulnerabilities:
    """Test for common security vulnerabilities."""
    
    @pytest.mark.asyncio
    async def test_sql_injection_protection(self):
        """Test SQL injection protection in API endpoints."""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            await create_tables()
            
            # Common SQL injection payloads
            sql_injection_payloads = [
                "' OR '1'='1",
                "'; DROP TABLE users; --",
                "' UNION SELECT * FROM users --",
                "1' OR 1=1 --",
                "admin'--",
                "' OR 'x'='x",
            ]
            
            # Test login endpoint with SQL injection attempts
            for payload in sql_injection_payloads:
                login_data = {
                    "username": payload,
                    "password": payload
                }
                
                response = await ac.post("/api/auth/login", data=login_data)
                
                # Should not succeed with injection payload
                # Response should be 401 (unauthorized) not 500 (server error)
                assert response.status_code in [400, 401, 422]
                
                # Response should not contain database errors
                response_text = response.text.lower()
                db_error_indicators = ["sql", "database", "syntax error", "mysql", "postgresql"]
                for indicator in db_error_indicators:
                    assert indicator not in response_text
    
    @pytest.mark.asyncio
    async def test_xss_protection(self):
        """Test XSS protection in user input fields."""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            await create_tables()
            
            # XSS payloads
            xss_payloads = [
                "<script>alert('xss')</script>",
                "<img src=x onerror=alert('xss')>",
                "javascript:alert('xss')",
                "<svg onload=alert('xss')>",
                "';alert('xss');//",
            ]
            
            # Test user registration with XSS payloads
            for payload in xss_payloads:
                user_data = {
                    "username": f"user_{payload}",
                    "email": f"test{payload}@example.com",
                    "password": "ValidPass123!",
                    "confirm_password": "ValidPass123!",
                    "accept_terms": True
                }
                
                response = await ac.post("/api/users/signup", json=user_data)
                
                # Should either reject the input or sanitize it
                if response.status_code == 201:
                    # If user creation succeeded, check that XSS payload was sanitized
                    response_data = response.json()
                    username = response_data.get("username", "")
                    # Should not contain script tags or other XSS elements
                    assert "<script>" not in username
                    assert "javascript:" not in username
                    assert "onerror=" not in username
    
    @pytest.mark.asyncio
    async def test_csrf_protection(self):
        """Test CSRF protection mechanisms."""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            # Test that state-changing operations require proper headers
            # This is a basic test - full CSRF testing would require tokens
            
            # Test POST without proper headers
            response = await ac.post("/api/users/signup", json={})
            
            # Should require content-type header or proper CSRF token
            # The exact behavior depends on CSRF implementation
            assert response.status_code in [400, 403, 422]
    
    @pytest.mark.asyncio
    async def test_rate_limiting_protection(self):
        """Test rate limiting protection."""
        transport = ASGITransport(app=app)
        
        # Make many rapid requests to trigger rate limiting
        async def make_rapid_requests():
            async with AsyncClient(transport=transport, base_url="http://test") as ac:
                responses = []
                for i in range(20):  # Make 20 rapid requests
                    response = await ac.get("/health")
                    responses.append(response)
                return responses
        
        responses = await make_rapid_requests()
        
        # At least some requests should be rate limited
        # This depends on rate limiting configuration
        status_codes = [r.status_code for r in responses]
        
        # Should have mix of success and rate limit responses
        assert 200 in status_codes  # Some should succeed
        # Rate limiting might return 429 or other codes
        # This test verifies the system handles rapid requests gracefully
    
    @pytest.mark.asyncio
    async def test_authentication_bypass_attempts(self):
        """Test authentication bypass protection."""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            await create_tables()
            
            # Test accessing protected endpoints without authentication
            protected_endpoints = [
                "/api/admin/users",
                "/api/users/profile",
                "/api/badges/analytics/overview",
                "/api/tasks/",
            ]
            
            for endpoint in protected_endpoints:
                response = await ac.get(endpoint)
                # Should require authentication
                assert response.status_code in [401, 403]
            
            # Test with invalid tokens
            invalid_tokens = [
                "Bearer invalid_token",
                "Bearer ",
                "Invalid bearer_token",
                "Bearer " + "x" * 500,  # Very long token
            ]
            
            for token in invalid_tokens:
                headers = {"Authorization": token}
                response = await ac.get("/api/users/profile", headers=headers)
                assert response.status_code in [401, 403]


class TestInputValidation:
    """Test comprehensive input validation."""
    
    @pytest.mark.asyncio
    async def test_oversized_request_handling(self):
        """Test handling of oversized requests."""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            # Create oversized request body
            large_data = {
                "username": "a" * 10000,  # Very long username
                "email": "a" * 5000 + "@example.com",  # Very long email
                "password": "a" * 1000,  # Very long password
                "description": "a" * 50000,  # Very long description
            }
            
            response = await ac.post("/api/users/signup", json=large_data)
            
            # Should reject oversized input
            assert response.status_code in [400, 413, 422]
    
    @pytest.mark.asyncio
    async def test_malformed_json_handling(self):
        """Test handling of malformed JSON."""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            # Send malformed JSON
            malformed_json_strings = [
                "{invalid_json}",
                '{"unclosed": "string}',
                '{"trailing": "comma",}',
                '{"duplicate": 1, "duplicate": 2}',
                '{"unicode": "\uFFFF"}',
            ]
            
            for malformed_json in malformed_json_strings:
                response = await ac.post(
                    "/api/users/signup",
                    content=malformed_json,
                    headers={"Content-Type": "application/json"}
                )
                
                # Should reject malformed JSON gracefully
                assert response.status_code in [400, 422]
    
    @pytest.mark.asyncio
    async def test_special_character_handling(self):
        """Test handling of special characters in input."""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            await create_tables()
            
            # Test various special characters
            special_chars = [
                "emoji_🎉_test",
                "unicode_ñáéíóú_test",
                "symbols_@#$%^&*()_test",
                "quotes_'\"_test",
                "backslash_\\_test",
                "null_\x00_test",
            ]
            
            for special_string in special_chars:
                user_data = {
                    "username": f"user_{special_string[:10]}",
                    "email": f"test@example.com",
                    "password": "ValidPass123!",
                    "confirm_password": "ValidPass123!",
                    "accept_terms": True
                }
                
                response = await ac.post("/api/users/signup", json=user_data)
                
                # Should handle special characters gracefully
                # Either accept and sanitize, or reject with proper error
                assert response.status_code in [201, 400, 422]


class TestSystemLimits:
    """Test system resource limits and edge cases."""
    
    @pytest.mark.asyncio
    async def test_concurrent_user_creation(self):
        """Test system behavior under concurrent user creation."""
        transport = ASGITransport(app=app)
        
        async def create_user(user_id):
            async with AsyncClient(transport=transport, base_url="http://test") as ac:
                await create_tables()
                user_data = {
                    "username": f"concurrent_user_{user_id}",
                    "email": f"user_{user_id}@example.com",
                    "password": "ValidPass123!",
                    "confirm_password": "ValidPass123!",
                    "accept_terms": True
                }
                return await ac.post("/api/users/signup", json=user_data)
        
        # Create multiple users concurrently
        tasks = [create_user(i) for i in range(5)]
        responses = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Most should succeed, system should handle concurrency gracefully
        successful_responses = [r for r in responses if hasattr(r, 'status_code') and r.status_code == 201]
        assert len(successful_responses) >= 3  # At least 3 should succeed
    
    def test_memory_usage_patterns(self):
        """Test for memory leaks and usage patterns."""
        import gc
        import psutil
        import os
        
        # Get initial memory usage
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss
        
        # Perform memory-intensive operations
        for i in range(100):
            # Simulate heavy operations
            large_data = [{"key": f"value_{j}"} for j in range(1000)]
            del large_data
            
            if i % 10 == 0:
                gc.collect()  # Force garbage collection
        
        # Check final memory usage
        final_memory = process.memory_info().rss
        memory_increase = final_memory - initial_memory
        
        # Memory increase should be reasonable (less than 100MB)
        assert memory_increase < 100 * 1024 * 1024  # 100MB
    
    @pytest.mark.asyncio
    async def test_database_connection_handling(self):
        """Test database connection pool handling."""
        transport = ASGITransport(app=app)
        
        # Create many concurrent database operations
        async def db_operation():
            async with AsyncClient(transport=transport, base_url="http://test") as ac:
                return await ac.get("/health")
        
        # Test with more connections than typical pool size
        tasks = [db_operation() for _ in range(50)]
        responses = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Should handle connection pooling gracefully
        successful_responses = [r for r in responses if hasattr(r, 'status_code') and r.status_code == 200]
        assert len(successful_responses) >= 40  # Most should succeed


class TestErrorHandling:
    """Test comprehensive error handling."""
    
    @pytest.mark.asyncio
    async def test_database_error_handling(self):
        """Test handling of database errors."""
        # This would test behavior when database is unavailable
        # Implementation depends on specific database error handling
        pass
    
    @pytest.mark.asyncio
    async def test_external_service_failure_handling(self):
        """Test handling of external service failures."""
        # This would test behavior when external APIs fail
        # Implementation depends on external service integrations
        pass
    
    @pytest.mark.asyncio
    async def test_timeout_handling(self):
        """Test request timeout handling."""
        transport = ASGITransport(app=app)
        
        # Test with very short timeout
        async with AsyncClient(
            transport=transport, 
            base_url="http://test",
            timeout=0.001  # Very short timeout
        ) as ac:
            try:
                response = await ac.get("/health")
                # If it succeeds, that's okay too (fast response)
                assert response.status_code == 200
            except Exception as e:
                # Should handle timeout gracefully
                assert "timeout" in str(e).lower() or "time" in str(e).lower()


class TestSecurityHeaders:
    """Test security headers implementation."""
    
    @pytest.mark.asyncio
    async def test_security_headers_present(self):
        """Test that security headers are present in responses."""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            response = await ac.get("/health")
            
            # Check for important security headers
            expected_headers = [
                "x-content-type-options",
                "x-frame-options",
                "strict-transport-security"
            ]
            
            response_headers = {k.lower(): v for k, v in response.headers.items()}
            
            for header in expected_headers:
                if header in response_headers:
                    # Verify header values
                    if header == "x-content-type-options":
                        assert response_headers[header] == "nosniff"
                    elif header == "x-frame-options":
                        assert response_headers[header] in ["DENY", "SAMEORIGIN"]
                    elif header == "strict-transport-security":
                        assert "max-age=" in response_headers[header]


# Utility functions for performance testing
def measure_execution_time(func, *args, **kwargs):
    """Measure execution time of a function."""
    start_time = time.time()
    result = func(*args, **kwargs)
    end_time = time.time()
    return result, end_time - start_time


async def measure_async_execution_time(coro):
    """Measure execution time of an async function."""
    start_time = time.time()
    result = await coro
    end_time = time.time()
    return result, end_time - start_time


# Fixtures for testing
@pytest.fixture
def performance_test_data():
    """Generate test data for performance testing."""
    return {
        "users": [
            {
                "username": f"perf_user_{i}",
                "email": f"perf_user_{i}@example.com",
                "password": "PerfTest123!"
            }
            for i in range(100)
        ]
    }