# Health Check API Documentation

## Overview
The Motor Backend API includes comprehensive health check endpoints to monitor the status and availability of all critical services. These endpoints help ensure system reliability and enable proactive monitoring.

## Health Check Endpoints

### 1. Overall System Health
**GET** `/api/health/status`

Returns comprehensive health status of all services in the system.

**Response Format:**
```json
{
  "success": true,
  "data": {
    "status": "healthy|degraded|unhealthy",
    "timestamp": "2025-07-31T17:00:00.000Z",
    "services": [
      {
        "service": "Database",
        "status": "healthy",
        "responseTime": 45,
        "details": {
          "dialect": "postgres",
          "version": "PostgreSQL"
        }
      }
    ],
    "summary": {
      "total": 9,
      "healthy": 8,
      "unhealthy": 0,
      "degraded": 1
    }
  },
  "message": "System is healthy"
}
```

**Status Codes:**
- `200` - All services healthy
- `207` - Some services degraded (partial functionality)
- `503` - One or more services unhealthy

### 2. Individual Service Health Checks

#### Database Health
**GET** `/api/health/database`

Checks database connectivity and basic information.

**Health Criteria:**
- ✅ Database connection successful
- ✅ Can authenticate with database
- ❌ Connection timeout or authentication failure

#### S3 Service Health
**GET** `/api/health/s3`

Validates AWS S3 service configuration and connectivity.

**Health Criteria:**
- ✅ AWS credentials configured
- ✅ S3 bucket accessible
- ✅ Can generate pre-signed URLs
- ❌ Missing credentials or bucket access issues

#### LLM Service Health
**GET** `/api/health/llm`

Checks OpenAI API configuration for language model services.

**Health Criteria:**
- ✅ OpenAI API key configured
- ✅ Service initialization successful
- ❌ Missing API key or configuration errors

#### Embedding Service Health
**GET** `/api/health/embedding`

Validates embedding service configuration for vector operations.

**Health Criteria:**
- ✅ OpenAI API key configured
- ✅ Embedding model accessible
- ❌ Missing API key or model unavailable

#### Document Service Health
**GET** `/api/health/document`

Checks document processing service availability.

**Health Criteria:**
- ✅ Service can be instantiated
- ✅ Dependencies available
- ❌ Service initialization failures

#### Chat Service Health
**GET** `/api/health/chat`

Validates chat and RAG functionality.

**Health Criteria:**
- ✅ Chat service operational
- ✅ Dependencies initialized
- ❌ Service or dependency failures

#### Authentication Service Health
**GET** `/api/health/auth`

Checks authentication and authorization service status.

**Health Criteria:**
- ✅ JWT secret configured
- ✅ Service operational
- ⚠️ Missing JWT secret (degraded)
- ❌ Service initialization failure

#### User Service Health
**GET** `/api/health/user`

Validates user management service availability.

**Health Criteria:**
- ✅ Service methods accessible
- ❌ Service unavailable

#### Token Blacklist Service Health
**GET** `/api/health/token-blacklist`

Checks token blacklist service for security operations.

**Health Criteria:**
- ✅ Service operational
- ❌ Service initialization failure

## Response Status Definitions

### Healthy 🟢
- Service is fully operational
- All dependencies available
- Normal response times
- No errors detected

### Degraded 🟡
- Service is partially operational
- Some features may be limited
- Non-critical dependencies missing
- Performance may be reduced

### Unhealthy 🔴
- Service is not operational
- Critical dependencies missing
- Service errors occurring
- Immediate attention required

## Integration Examples

### Basic Health Check
```bash
curl -X GET http://localhost:3000/api/health/status
```

### Check Specific Service
```bash
curl -X GET http://localhost:3000/api/health/database
```

### Monitoring Script Example
```bash
#!/bin/bash
# Simple health monitoring script

HEALTH_URL="http://localhost:3000/api/health/status"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE -eq 200 ]; then
    echo "✅ System is healthy"
elif [ $RESPONSE -eq 207 ]; then
    echo "⚠️ System is degraded"
else
    echo "❌ System is unhealthy"
    # Send alert or take corrective action
fi
```

## Monitoring Best Practices

### 1. Regular Health Checks
- Check overall system health every 30 seconds
- Monitor individual services every 2 minutes
- Set up alerts for unhealthy states

### 2. Response Time Monitoring
- Track response times for performance trends
- Alert on response times > 5 seconds
- Investigate degraded performance patterns

### 3. Dependency Monitoring
- Monitor external service dependencies (OpenAI, AWS)
- Check configuration status regularly
- Validate API keys and credentials

### 4. Automated Recovery
- Implement automatic service restarts for transient failures
- Set up configuration validation on startup
- Use circuit breakers for external services

## Security Considerations

### Public Access
Health check endpoints are publicly accessible to support:
- Load balancer health checks
- External monitoring systems
- Container orchestration platforms

### Information Disclosure
Health checks provide minimal information to prevent:
- Exposing internal system details
- Revealing configuration specifics
- Leaking sensitive data

### Rate Limiting
Consider implementing rate limiting for health endpoints to prevent:
- Excessive monitoring requests
- Potential DoS attacks
- Resource exhaustion

## Troubleshooting Guide

### Common Issues

#### Database Unhealthy
```
Symptoms: Database health check fails
Causes:
- Database server down
- Connection string incorrect
- Network connectivity issues
- Database credentials invalid

Solutions:
- Verify database server status
- Check connection environment variables
- Test network connectivity
- Validate database credentials
```

#### S3 Service Unhealthy
```
Symptoms: S3 health check fails
Causes:
- AWS credentials missing/invalid
- S3 bucket doesn't exist
- Network/DNS issues
- AWS service outage

Solutions:
- Verify AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
- Check S3 bucket name and region
- Test AWS connectivity
- Check AWS service status
```

#### LLM/Embedding Service Unhealthy
```
Symptoms: OpenAI service checks fail
Causes:
- OPENAI_API_KEY missing/invalid
- API quota exceeded
- OpenAI service outage
- Network connectivity issues

Solutions:
- Verify OPENAI_API_KEY
- Check OpenAI usage limits
- Test API connectivity
- Check OpenAI service status
```

## Related Documentation
- [Architecture Documentation](./ARCHITECTURE.md)
- [Document Service Documentation](./DOCUMENT_SERVICE.md)
- [OpenAI Services Documentation](./OPENAI_SERVICES.md)
- [Main README](./README.md)
