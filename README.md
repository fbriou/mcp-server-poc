# Demo MCP Server

A serverless Model Context Protocol (MCP) server that provides both MCP-over-HTTP and REST API endpoints using Hono for AWS Lambda deployment.

## Features

- **Dual Protocol Support**: Both MCP-over-HTTP and REST API endpoints
- **Serverless Architecture**: Optimized for AWS Lambda deployment
- **High Performance**: Built with Hono for minimal cold start times
- **Interactive Documentation**: Swagger UI for API exploration
- **Comprehensive Testing**: Full test suite with coverage reporting
- **Production Ready**: Complete with monitoring, logging, and error handling

## Available Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `echo` | Echo back the input text | `message` (string, required) |
| `get_time` | Get the current date and time | None |
| `calculate` | Perform basic mathematical calculations | `expression` (string, required) |
| `get_system_info` | Get basic system information | None |
| `api_stats` | Get API usage statistics | None |

## Quick Start

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Run tests**:
   ```bash
   npm test
   ```

4. **View test coverage**:
   ```bash
   npm run test:coverage
   ```

### AWS Lambda Deployment

1. **Install Serverless Framework globally**:
   ```bash
   npm install -g serverless
   ```

2. **Configure AWS credentials**:
   ```bash
   aws configure
   # or
   export AWS_ACCESS_KEY_ID=your-key
   export AWS_SECRET_ACCESS_KEY=your-secret
   ```

3. **Deploy to AWS Lambda**:
   ```bash
   # Deploy to development stage
   npm run deploy:dev
   
   # Deploy to production stage  
   npm run deploy:prod
   ```

4. **Monitor logs**:
   ```bash
   npm run logs
   ```

## API Endpoints

### REST API

- **GET** `/` - Server information and available endpoints
- **GET** `/api/tools` - List available tools with schemas
- **POST** `/api/tools/:name` - Execute a specific tool
- **GET** `/api/stats` - Get API usage statistics
- **GET** `/api/health` - Health check endpoint
- **GET** `/docs` - Interactive Swagger UI documentation
- **GET** `/openapi.json` - OpenAPI specification

### MCP Protocol

- **GET** `/mcp` - Server discovery and capabilities
- **POST** `/mcp` - MCP JSON-RPC 2.0 endpoint

## Live Demo

🚀 **Deployed Server**: `https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com`

📖 **Interactive Documentation**: https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/docs

## Usage Examples

### Test the Live Server

#### Server Information
```bash
curl https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/
```

#### Health Check
```bash
curl https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/api/health
```

### REST API Examples

#### Echo Tool
```bash
curl -X POST https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/api/tools/echo \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello from AWS Lambda!"}'
```

#### Calculate Tool
```bash
curl -X POST https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/api/tools/calculate \
  -H "Content-Type: application/json" \
  -d '{"expression": "2 + 2 * 3"}'
```

#### Get Time Tool
```bash
curl -X POST https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/api/tools/get_time \
  -H "Content-Type: application/json" \
  -d '{}'
```

#### Get System Info
```bash
curl -X POST https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/api/tools/get_system_info \
  -H "Content-Type: application/json" \
  -d '{}'
```

#### Get API Stats
```bash
curl -X POST https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/api/tools/api_stats \
  -H "Content-Type: application/json" \
  -d '{}'
```

### MCP Protocol Examples

#### Server Discovery
```bash
curl https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/mcp
```

#### List Tools
```bash
curl -X POST https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'
```

#### Initialize MCP Session
```bash
curl -X POST https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/mcp \
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
  }'
```

#### Call Tool via MCP
```bash
curl -X POST https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "echo",
      "arguments": {
        "message": "Hello from MCP!"
      }
    }
  }'
```

## Project Structure

```
demo-mcp-server/
├── src/
│   └── index.js                 # Main server implementation
├── tests/
│   ├── tools.test.js           # Tool implementation tests
│   ├── api.test.js             # REST API endpoint tests
│   └── mcp.test.js             # MCP protocol compliance tests
├── package.json                # Dependencies and scripts
├── serverless.yml              # AWS Lambda deployment config
├── README.md                   # Project documentation
├── CLAUDE.md                   # Claude Code configuration
├── .gitignore                  # Git ignore rules
└── .env.example               # Environment variables template
```

## MCP Client Configuration

### Claude Code Configuration

For Claude Code and other MCP clients that support direct HTTP transport:

```json
{
  "mcpServers": {
    "demo-mcp-server": {
      "url": "https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/mcp"
    }
  }
}
```

**Note**: Replace the URL with your own deployed server URL after running `npm run deploy:dev` or `npm run deploy:prod`.

### Cursor Configuration

For Cursor IDE, add this to your MCP configuration file:

```json
{
  "mcpServers": {
    "demo-mcp-server": {
      "url": "https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/mcp"
    }
  }
}
```

### Manual MCP Client Testing

You can also test the MCP server manually with any JSON-RPC 2.0 client:

```bash
# Test with curl (Initialize)
curl -X POST https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {"name": "curl", "version": "1.0.0"}
    }
  }'

# List available tools
curl -X POST https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list"
  }'

# Call a tool
curl -X POST https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "calculate",
      "arguments": {"expression": "2 * Math.PI * 5"}
    }
  }'
```

## Development

### Available Scripts

- `npm start` - Start the server locally
- `npm run dev` - Start development server with hot reload
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier

### Testing

The project includes comprehensive tests covering:

- **Tool Tests**: Unit tests for all MCP tools
- **API Tests**: Integration tests for REST endpoints
- **MCP Tests**: Protocol compliance and JSON-RPC 2.0 validation

Run tests with:
```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage report
```

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Optional environment variables
NODE_ENV=development
LOG_LEVEL=debug
AWS_REGION=us-east-1
```

## Deployment

### Serverless Framework Configuration

The `serverless.yml` file includes:

- **Runtime**: Node.js 18.x
- **Memory**: 512MB (configurable)
- **Timeout**: 30 seconds
- **API Gateway**: HTTP API with proxy integration
- **CloudWatch**: Automatic log group creation
- **IAM**: Minimal required permissions

### Deployment Stages

- **Development**: `npm run deploy:dev`
- **Production**: `npm run deploy:prod`

### Monitoring

After deployment, monitor your function:

```bash
# View logs
npm run logs

# Invoke function directly
npm run invoke

# Remove deployment
npm run remove
```

## Security

- **Input Sanitization**: Mathematical expressions are sanitized to prevent code injection
- **Error Handling**: Comprehensive error handling with proper HTTP status codes
- **CORS**: Configured for cross-origin requests
- **Rate Limiting**: Consider adding rate limiting for production use

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm test`
5. Commit changes: `git commit -m "Description"`
6. Push to branch: `git push origin feature-name`
7. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/your-username/demo-mcp-server/issues)
- **Documentation**: [API Documentation](https://your-api-gateway-url/docs)
- **MCP Specification**: [Model Context Protocol](https://spec.modelcontextprotocol.io/)

## Changelog

### v1.0.0 (Initial Release)
- MCP-over-HTTP and REST API support
- Five core tools (echo, get_time, calculate, get_system_info, api_stats)
- AWS Lambda deployment ready
- Comprehensive test suite
- Interactive API documentation
- Production logging and monitoring