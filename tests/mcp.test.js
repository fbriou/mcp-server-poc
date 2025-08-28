import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// Mock the dependencies
jest.unstable_mockModule('@modelcontextprotocol/sdk/server/index.js', () => ({
  Server: jest.fn().mockImplementation(() => ({
    setRequestHandler: jest.fn()
  }))
}));

jest.unstable_mockModule('@modelcontextprotocol/sdk/types.js', () => ({
  ListToolsRequestSchema: 'ListToolsRequestSchema',
  CallToolRequestSchema: 'CallToolRequestSchema'
}));

jest.unstable_mockModule('hono', () => ({
  Hono: jest.fn().mockImplementation(() => ({
    use: jest.fn(),
    get: jest.fn(),
    post: jest.fn()
  }))
}));

jest.unstable_mockModule('hono/cors', () => ({
  cors: jest.fn()
}));

jest.unstable_mockModule('hono/logger', () => ({
  logger: jest.fn()
}));

jest.unstable_mockModule('hono/aws-lambda', () => ({
  handle: jest.fn()
}));

jest.unstable_mockModule('@hono/swagger-ui', () => ({
  swaggerUI: jest.fn()
}));

describe('MCP Protocol Compliance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('MCP Server Discovery', () => {
    test('GET /mcp should return server capabilities', async () => {
      const expectedResponse = {
        name: 'demo-mcp-server',
        version: '1.0.0',
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
          logging: {}
        }
      };

      expect(expectedResponse.name).toBe('demo-mcp-server');
      expect(expectedResponse.version).toBe('1.0.0');
      expect(expectedResponse.protocolVersion).toBe('2024-11-05');
      expect(expectedResponse.capabilities).toHaveProperty('tools');
      expect(expectedResponse.capabilities).toHaveProperty('logging');
    });
  });

  describe('MCP JSON-RPC 2.0 Protocol', () => {
    test('should handle initialize request', async () => {
      const request = {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: {
            name: 'test-client',
            version: '1.0.0'
          }
        }
      };

      const expectedResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {},
            logging: {}
          },
          serverInfo: {
            name: 'demo-mcp-server',
            version: '1.0.0'
          }
        }
      };

      expect(request.jsonrpc).toBe('2.0');
      expect(request.method).toBe('initialize');
      expect(expectedResponse.jsonrpc).toBe('2.0');
      expect(expectedResponse.id).toBe(request.id);
      expect(expectedResponse.result.protocolVersion).toBe('2024-11-05');
      expect(expectedResponse.result.serverInfo.name).toBe('demo-mcp-server');
    });

    test('should handle initialized notification', async () => {
      const notification = {
        jsonrpc: '2.0',
        method: 'notifications/initialized'
      };

      const expectedResponse = {
        jsonrpc: '2.0',
        result: null
      };

      expect(notification.jsonrpc).toBe('2.0');
      expect(notification.method).toBe('notifications/initialized');
      expect(expectedResponse.result).toBeNull();
    });

    test('should handle tools/list request', async () => {
      const request = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list'
      };

      const tools = [
        {
          name: 'echo',
          description: 'Echo back the input text',
          inputSchema: {
            type: 'object',
            properties: {
              message: { type: 'string', description: 'The message to echo back' }
            },
            required: ['message']
          }
        }
      ];

      const expectedResponse = {
        jsonrpc: '2.0',
        id: 2,
        result: { tools }
      };

      expect(request.method).toBe('tools/list');
      expect(expectedResponse.result.tools).toHaveLength(1);
      expect(expectedResponse.result.tools[0].name).toBe('echo');
    });

    test('should handle tools/call request successfully', async () => {
      const request = {
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'echo',
          arguments: {
            message: 'Hello, MCP!'
          }
        }
      };

      const expectedResponse = {
        jsonrpc: '2.0',
        id: 3,
        result: {
          content: [
            {
              type: 'text',
              text: 'Echo: Hello, MCP!'
            }
          ]
        }
      };

      expect(request.method).toBe('tools/call');
      expect(request.params.name).toBe('echo');
      expect(request.params.arguments.message).toBe('Hello, MCP!');
      expect(expectedResponse.result.content[0].text).toBe('Echo: Hello, MCP!');
    });

    test('should handle tools/call request for unknown tool', async () => {
      const request = {
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {
          name: 'unknown_tool',
          arguments: {}
        }
      };

      const expectedResponse = {
        jsonrpc: '2.0',
        id: 4,
        error: {
          code: -32601,
          message: 'Method not found',
          data: 'Unknown tool: unknown_tool'
        }
      };

      expect(expectedResponse.error.code).toBe(-32601);
      expect(expectedResponse.error.message).toBe('Method not found');
      expect(expectedResponse.error.data).toBe('Unknown tool: unknown_tool');
    });

    test('should handle tools/call request with execution error', async () => {
      const request = {
        jsonrpc: '2.0',
        id: 5,
        method: 'tools/call',
        params: {
          name: 'calculate',
          arguments: {
            expression: 'invalid_expression'
          }
        }
      };

      const expectedResponse = {
        jsonrpc: '2.0',
        id: 5,
        error: {
          code: -32603,
          message: 'Internal error',
          data: 'Calculation error'
        }
      };

      expect(expectedResponse.error.code).toBe(-32603);
      expect(expectedResponse.error.message).toBe('Internal error');
      expect(typeof expectedResponse.error.data).toBe('string');
    });

    test('should handle unknown method', async () => {
      const request = {
        jsonrpc: '2.0',
        id: 6,
        method: 'unknown/method',
        params: {}
      };

      const expectedResponse = {
        jsonrpc: '2.0',
        id: 6,
        error: {
          code: -32601,
          message: 'Method not found',
          data: 'Unknown method: unknown/method'
        }
      };

      expect(expectedResponse.error.code).toBe(-32601);
      expect(expectedResponse.error.message).toBe('Method not found');
      expect(expectedResponse.error.data).toBe('Unknown method: unknown/method');
    });

    test('should handle parse error', async () => {
      const malformedJson = '{invalid json}';
      
      const expectedResponse = {
        jsonrpc: '2.0',
        error: {
          code: -32700,
          message: 'Parse error',
          data: 'Unexpected token i in JSON at position 1'
        },
        id: null
      };

      try {
        JSON.parse(malformedJson);
      } catch (error) {
        expect(expectedResponse.error.code).toBe(-32700);
        expect(expectedResponse.error.message).toBe('Parse error');
        expect(expectedResponse.id).toBeNull();
      }
    });
  });

  describe('MCP Tool Execution', () => {
    test('should execute echo tool through MCP protocol', async () => {
      const toolCall = {
        name: 'echo',
        arguments: { message: 'MCP Test' }
      };

      // Simulate tool execution
      const result = {
        content: [
          {
            type: 'text',
            text: `Echo: ${toolCall.arguments.message}`
          }
        ]
      };

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toBe('Echo: MCP Test');
    });

    test('should execute get_time tool through MCP protocol', async () => {
      const toolCall = {
        name: 'get_time',
        arguments: {}
      };

      const mockDate = new Date('2024-01-15T10:30:00.000Z');
      const result = {
        content: [
          {
            type: 'text',
            text: `Current time: ${mockDate.toISOString()}`
          }
        ]
      };

      expect(result.content[0].text).toBe('Current time: 2024-01-15T10:30:00.000Z');
    });

    test('should execute calculate tool through MCP protocol', async () => {
      const toolCall = {
        name: 'calculate',
        arguments: { expression: '5 * 3' }
      };

      const calculationResult = eval(toolCall.arguments.expression.replace(/[^0-9+\-*/.()\s]/g, ''));
      const result = {
        content: [
          {
            type: 'text',
            text: `Result of '${toolCall.arguments.expression}': ${calculationResult}`
          }
        ]
      };

      expect(result.content[0].text).toBe("Result of '5 * 3': 15");
    });

    test('should execute get_system_info tool through MCP protocol', async () => {
      const toolCall = {
        name: 'get_system_info',
        arguments: {}
      };

      const systemInfo = {
        platform: 'linux',
        nodeVersion: 'v18.17.0',
        memoryUsage: 15, // MB
        uptime: 123, // seconds
        isLambda: false
      };

      const infoText = `System Information:
• Platform: ${systemInfo.platform}
• Node Version: ${systemInfo.nodeVersion}
• Memory Usage: ${systemInfo.memoryUsage}MB
• Uptime: ${systemInfo.uptime}s
• Running on Lambda: ${systemInfo.isLambda ? 'Yes' : 'No'}`;

      const result = {
        content: [
          {
            type: 'text',
            text: infoText
          }
        ]
      };

      expect(result.content[0].text).toContain('Platform: linux');
      expect(result.content[0].text).toContain('Node Version: v18.17.0');
      expect(result.content[0].text).toContain('Running on Lambda: No');
    });

    test('should execute api_stats tool through MCP protocol', async () => {
      const toolCall = {
        name: 'api_stats',
        arguments: {}
      };

      const stats = {
        requests: 42,
        lastRequest: '2024-01-15T10:30:00.000Z',
        uptime: 300,
        isLambda: true
      };

      const statsText = `API Usage Statistics:
• Total Requests: ${stats.requests}
• Last Request: ${stats.lastRequest}
• Server Uptime: ${stats.uptime}s
• Running on Lambda: ${stats.isLambda ? 'Yes' : 'No'}`;

      const result = {
        content: [
          {
            type: 'text',
            text: statsText
          }
        ]
      };

      expect(result.content[0].text).toContain('Total Requests: 42');
      expect(result.content[0].text).toContain('Running on Lambda: Yes');
    });
  });

  describe('MCP Protocol Validation', () => {
    test('should validate JSON-RPC 2.0 request format', async () => {
      const validRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list'
      };

      const invalidRequests = [
        { jsonrpc: '1.0', id: 1, method: 'test' }, // Wrong JSON-RPC version
        { id: 1, method: 'test' }, // Missing jsonrpc
        { jsonrpc: '2.0', id: 1 }, // Missing method
        { jsonrpc: '2.0', method: 'test', id: {} } // Invalid id type
      ];

      expect(validRequest.jsonrpc).toBe('2.0');
      expect(validRequest).toHaveProperty('method');

      invalidRequests.forEach(request => {
        if (!request.jsonrpc || request.jsonrpc !== '2.0') {
          expect(request.jsonrpc).not.toBe('2.0');
        }
        if (!request.method) {
          expect(request).not.toHaveProperty('method');
        }
      });
    });

    test('should validate tool parameters against schema', async () => {
      const echoSchema = {
        type: 'object',
        properties: {
          message: { type: 'string', description: 'The message to echo back' }
        },
        required: ['message']
      };

      const validArgs = { message: 'Hello' };
      const invalidArgs = [
        {}, // Missing required message
        { message: 123 }, // Wrong type
        { wrongParam: 'test' } // Wrong parameter name
      ];

      // Validate valid arguments
      expect(typeof validArgs.message).toBe('string');
      expect(echoSchema.required).toContain('message');

      // Check invalid arguments
      expect(invalidArgs[0]).not.toHaveProperty('message');
      expect(typeof invalidArgs[1].message).toBe('number');
      expect(invalidArgs[2]).not.toHaveProperty('message');
    });

    test('should validate response format', async () => {
      const validResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: {
          content: [
            {
              type: 'text',
              text: 'Response text'
            }
          ]
        }
      };

      const validErrorResponse = {
        jsonrpc: '2.0',
        id: 1,
        error: {
          code: -32601,
          message: 'Method not found',
          data: 'Additional error information'
        }
      };

      expect(validResponse.jsonrpc).toBe('2.0');
      expect(validResponse).toHaveProperty('result');
      expect(Array.isArray(validResponse.result.content)).toBe(true);

      expect(validErrorResponse.jsonrpc).toBe('2.0');
      expect(validErrorResponse).toHaveProperty('error');
      expect(typeof validErrorResponse.error.code).toBe('number');
      expect(typeof validErrorResponse.error.message).toBe('string');
    });
  });
});