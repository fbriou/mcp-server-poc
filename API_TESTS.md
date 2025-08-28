# API Testing Commands

This file contains all the curl commands to test the deployed MCP server.

## Server Information

**Base URL**: `https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com`

## Basic Endpoints

### Server Info
```bash
curl -s https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/ | jq .
```

### Health Check
```bash
curl -s https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/api/health | jq .
```

### API Statistics
```bash
curl -s https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/api/stats | jq .
```

### Available Tools
```bash
curl -s https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/api/tools | jq .
```

### OpenAPI Specification
```bash
curl -s https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/openapi.json | jq .
```

### Swagger UI Documentation
```bash
# Check headers (returns HTML)
curl -s -I https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/docs

# Open in browser
open https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/docs
```

## REST API Tool Tests

### Echo Tool
```bash
curl -s -X POST https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/api/tools/echo \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello from AWS Lambda!"}' | jq .
```

### Get Time Tool
```bash
curl -s -X POST https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/api/tools/get_time \
  -H "Content-Type: application/json" \
  -d '{}' | jq .
```

### Calculate Tool
```bash
# Basic arithmetic
curl -s -X POST https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/api/tools/calculate \
  -H "Content-Type: application/json" \
  -d '{"expression": "2 + 2 * 3"}' | jq .

# With decimals
curl -s -X POST https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/api/tools/calculate \
  -H "Content-Type: application/json" \
  -d '{"expression": "3.14159 * 2 * 5"}' | jq .

# Complex expression
curl -s -X POST https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/api/tools/calculate \
  -H "Content-Type: application/json" \
  -d '{"expression": "(10 + 5) * 2 - 8"}' | jq .
```

### Get System Info Tool
```bash
curl -s -X POST https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/api/tools/get_system_info \
  -H "Content-Type: application/json" \
  -d '{}' | jq .
```

### API Stats Tool
```bash
curl -s -X POST https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/api/tools/api_stats \
  -H "Content-Type: application/json" \
  -d '{}' | jq .
```

## MCP Protocol Tests

### Server Discovery
```bash
curl -s https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/mcp | jq .
```

### Initialize MCP Session
```bash
curl -s -X POST https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {
        "name": "test-client",
        "version": "1.0.0"
      }
    }
  }' | jq .
```

### List Available Tools
```bash
curl -s -X POST https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list"
  }' | jq .
```

### Call Tools via MCP

#### Echo Tool via MCP
```bash
curl -s -X POST https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "echo",
      "arguments": {
        "message": "Hello from MCP protocol!"
      }
    }
  }' | jq .
```

#### Calculate Tool via MCP
```bash
curl -s -X POST https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 4,
    "method": "tools/call",
    "params": {
      "name": "calculate",
      "arguments": {
        "expression": "3.14159 * 2 * 5"
      }
    }
  }' | jq .
```

#### Get Time Tool via MCP
```bash
curl -s -X POST https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 5,
    "method": "tools/call",
    "params": {
      "name": "get_time",
      "arguments": {}
    }
  }' | jq .
```

#### System Info Tool via MCP
```bash
curl -s -X POST https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 6,
    "method": "tools/call",
    "params": {
      "name": "get_system_info",
      "arguments": {}
    }
  }' | jq .
```

#### API Stats Tool via MCP
```bash
curl -s -X POST https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 7,
    "method": "tools/call",
    "params": {
      "name": "api_stats",
      "arguments": {}
    }
  }' | jq .
```

## Error Testing

### Invalid Tool Name
```bash
curl -s -X POST https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/api/tools/invalid_tool \
  -H "Content-Type: application/json" \
  -d '{}' | jq .
```

### Invalid MCP Method
```bash
curl -s -X POST https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "invalid/method"
  }' | jq .
```

### Invalid JSON
```bash
curl -s -X POST https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/mcp \
  -H "Content-Type: application/json" \
  -d '{invalid json}' | jq .
```

### Invalid Mathematical Expression
```bash
curl -s -X POST https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/api/tools/calculate \
  -H "Content-Type: application/json" \
  -d '{"expression": "Math.PI * alert(1)"}' | jq .
```

## Performance Tests

### Multiple Requests (Test Load)
```bash
# Run 10 concurrent requests
for i in {1..10}; do
  curl -s https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/api/health &
done
wait
```

### Memory Usage Test
```bash
# Check system info before and after some operations
curl -s -X POST https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/api/tools/get_system_info \
  -H "Content-Type: application/json" \
  -d '{}' | jq '.content[0].text' | grep "Memory Usage"
```

## Browser Tests

### Interactive Documentation
```bash
# Open Swagger UI in browser
open https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/docs
```

### CORS Test (from browser console)
```javascript
fetch('https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/api/health')
  .then(response => response.json())
  .then(data => console.log(data));
```

## Monitoring Commands

### Check Deployment Status
```bash
npm run logs
```

### Redeploy if Needed
```bash
npm run deploy:dev
```

### Remove Deployment
```bash
npm run remove
```

## Expected Response Formats

### REST API Response Format
```json
{
  "content": [
    {
      "type": "text",
      "text": "Tool response here"
    }
  ]
}
```

### MCP Success Response Format
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text", 
        "text": "Tool response here"
      }
    ]
  }
}
```

### MCP Error Response Format
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32601,
    "message": "Method not found",
    "data": "Additional error details"
  }
}
```

## Notes

- All requests return JSON responses
- The server automatically handles CORS for cross-origin requests
- Mathematical expressions are sanitized for security
- Request counters increment with each API call
- Lambda functions have cold start latency for first request
- Use `jq .` for pretty-printing JSON responses