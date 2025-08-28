# Claude Code Configuration

This file configures Claude Code for optimal development workflow with the Demo MCP Server project.

## Build and Test Commands

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Start development server
npm run dev

# Build (no build step needed for Lambda)
npm run build
```

## Deployment Commands

```bash
# Deploy to development environment
npm run deploy:dev

# Deploy to production environment
npm run deploy:prod

# View logs
npm run logs

# Remove deployment
npm run remove

# Run local offline server
npm run offline
```

## Development Workflow

### Testing
- Run `npm test` before committing changes
- Ensure all tests pass and coverage remains high
- Use `npm run test:watch` during development

### Code Quality
- Run `npm run lint` to check for code style issues
- Use `npm run lint:fix` to automatically fix issues
- Run `npm run format` to ensure consistent formatting

### Local Development
- Use `npm run dev` for hot-reloaded development
- Use `npm run offline` to simulate AWS Lambda locally
- Test both REST API and MCP protocol endpoints

## Key Files

- `src/index.js` - Main server implementation
- `tests/` - Test suite (tools, api, mcp)
- `serverless.yml` - AWS deployment configuration
- `package.json` - Dependencies and scripts

## Environment Setup

1. Ensure Node.js 18+ is installed
2. Run `npm install` to install dependencies
3. Copy `.env.example` to `.env` and configure if needed
4. For AWS deployment, configure AWS credentials

## Testing Strategy

The project uses Jest with three test suites:

1. **tools.test.js** - Unit tests for MCP tool implementations
2. **api.test.js** - Integration tests for REST API endpoints  
3. **mcp.test.js** - MCP protocol compliance and JSON-RPC validation

## Common Tasks

### Adding a New Tool
1. Add tool definition to `tools` array in `src/index.js`
2. Implement tool logic in `toolImplementations` object
3. Add tests in `tests/tools.test.js`
4. Update documentation

### Debugging Issues
1. Check logs with `npm run logs` after deployment
2. Use `npm run test:coverage` to identify untested code
3. Run `npm run lint` to catch potential issues
4. Use local development server for faster iteration

### Pre-commit Checklist
- [ ] Tests pass (`npm test`)
- [ ] Code is linted (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] Documentation is updated
- [ ] Environment variables are documented

## Deployment Notes

### Development Deployment
- Deployed to AWS Lambda with development stage
- Uses relaxed logging and monitoring
- Suitable for testing and experimentation

### Production Deployment
- Enhanced monitoring and alerting
- Optimized memory and timeout settings
- Consider enabling provisioned concurrency for consistent performance

## Production Testing

### Live Server Testing
The server is deployed at: `https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com`

See `API_TESTS.md` for comprehensive testing commands including:
- REST API endpoint tests
- MCP protocol compliance tests  
- Error handling tests
- Performance and load tests

### Quick Health Check
```bash
curl -s https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/api/health | jq .
```

### Interactive Documentation
- Swagger UI: https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/docs
- OpenAPI Spec: https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/openapi.json

## Troubleshooting

### Common Issues
1. **Import/Export Issues**: Ensure `"type": "module"` is set in package.json
2. **AWS Deployment Failures**: Check AWS credentials and permissions
3. **Test Failures**: Ensure all mocks are properly configured
4. **Lambda Cold Starts**: Consider provisioned concurrency for production
5. **MCP Server Errors**: Ensure server capabilities are configured in constructor

### Useful Debug Commands
```bash
# Check serverless configuration
npx serverless print

# Validate serverless.yml
npx serverless package --package /tmp

# Test function locally
npx serverless invoke local -f handler

# Check AWS CloudWatch logs
aws logs tail /aws/lambda/demo-mcp-server-dev-handler --follow

# Test live deployment
curl -s https://idm0cr9p5c.execute-api.us-east-1.amazonaws.com/ | jq .
```

## Performance Optimization

- Lambda function optimized for minimal cold start
- Hono framework chosen for performance
- Memory setting tuned for typical workload
- Consider CDN for static assets in production

## Security Considerations

- Input sanitization implemented for calculate tool
- CORS configured appropriately
- No sensitive data in logs
- AWS IAM permissions follow principle of least privilege

## Monitoring and Observability

- CloudWatch logs automatically configured
- API Gateway metrics available
- Consider adding custom metrics for business logic
- Error handling provides actionable error messages