# MCP Client Configuration Examples

This folder contains configuration examples for different MCP clients to connect to the deployed demo MCP server.

**Server URL**: `https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/mcp`

## Available Tools

Once configured, you'll have access to these 5 tools:

| Tool | Description | Parameters |
|------|-------------|------------|
| `echo` | Echo back the input text | `message` (string, required) |
| `get_time` | Get the current date and time | None |
| `calculate` | Perform basic mathematical calculations | `expression` (string, required) |
| `get_system_info` | Get basic system information | None |
| `api_stats` | Get API usage statistics | None |

## Claude Code

### Preferred Configuration (HTTP Transport)

Use `claude-code/mcp-settings.json`:

```json
{
  "mcpServers": {
    "demo-mcp-server": {
      "transport": {
        "type": "http",
        "baseUrl": "https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/mcp"
      }
    }
  }
}
```

### Fallback Configuration (Command-based)

If HTTP transport doesn't work, use `claude-code/mcp-settings-fallback.json`:

```json
{
  "mcpServers": {
    "demo-mcp-server": {
      "command": "npx",
      "args": [
        "--yes",
        "@modelcontextprotocol/client-http@latest",
        "https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/mcp"
      ]
    }
  }
}
```

### Setup Instructions

1. Access Claude Code settings/preferences
2. Navigate to MCP server configuration section
3. Copy the preferred configuration above
4. Save and restart Claude Code
5. Verify connection by trying the `echo` tool

## Cursor

### HTTP Transport Configuration

Use `cursor/mcp-config.json`:

```json
{
  "mcp": {
    "servers": {
      "demo-mcp-server": {
        "transport": {
          "type": "http",
          "baseUrl": "https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/mcp"
        }
      }
    }
  }
}
```

### Command-based Configuration

Use `cursor/cursor-settings.json`:

```json
{
  "mcp": {
    "servers": {
      "demo-mcp-server": {
        "command": "npx",
        "args": [
          "--yes",
          "@modelcontextprotocol/client-http@latest",
          "https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/mcp"
        ],
        "env": {
          "MCP_SERVER_URL": "https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/mcp"
        }
      }
    }
  }
}
```

### Setup Instructions

1. Open Cursor IDE
2. Access settings (usually `Cmd/Ctrl + ,`)
3. Look for MCP or Extensions settings
4. Add the configuration above
5. Restart Cursor
6. Test with a simple tool like `get_time`

## Testing Your Configuration

### Quick Test Commands

Once configured, test these tools:

1. **Echo Test**: `echo` with message "Hello MCP!"
2. **Time Test**: `get_time` (no parameters)
3. **Math Test**: `calculate` with expression "2 + 2 * 3"
4. **Info Test**: `get_system_info` (no parameters)
5. **Stats Test**: `api_stats` (no parameters)

### Expected Responses

All tools return responses in this format:
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

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check internet connectivity
   - Verify the server URL is correct
   - Try the fallback command-based configuration

2. **Tools Not Available**
   - Restart your MCP client
   - Check the configuration syntax
   - Verify the server is responding: `curl https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/mcp`

3. **HTTP Transport Not Working**
   - Use the command-based fallback configurations
   - Ensure your MCP client supports HTTP transport

### Manual Testing

You can test the server manually with curl:

```bash
# Test server discovery
curl -s https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/mcp | jq .

# Test echo tool
curl -s -X POST https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "echo",
      "arguments": {
        "message": "Hello from curl!"
      }
    }
  }' | jq .
```

## Server Information

- **Deployment**: AWS Lambda (Serverless)
- **Runtime**: Node.js 18.x
- **Region**: us-east-1
- **Protocol**: JSON-RPC 2.0 over HTTP
- **Documentation**: https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/docs
- **Repository**: https://github.com/fbriou/mcp-server-poc

For more detailed testing commands, see `API_TESTS.md` in the root directory.