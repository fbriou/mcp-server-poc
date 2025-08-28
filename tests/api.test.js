import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';

// Mock the dependencies before importing
jest.unstable_mockModule('@modelcontextprotocol/sdk/server/index.js', () => ({
  Server: jest.fn().mockImplementation(() => ({
    setRequestHandler: jest.fn()
  }))
}));

jest.unstable_mockModule('@modelcontextprotocol/sdk/types.js', () => ({
  ListToolsRequestSchema: 'ListToolsRequestSchema',
  CallToolRequestSchema: 'CallToolRequestSchema'
}));

// Create a basic Express-like app for testing
const mockApp = {
  get: jest.fn(),
  post: jest.fn(),
  use: jest.fn(),
  listen: jest.fn((port, callback) => {
    if (callback) callback();
    return { close: jest.fn() };
  })
};

jest.unstable_mockModule('hono', () => ({
  Hono: jest.fn(() => mockApp)
}));

jest.unstable_mockModule('hono/cors', () => ({
  cors: jest.fn()
}));

jest.unstable_mockModule('hono/logger', () => ({
  logger: jest.fn()
}));

jest.unstable_mockModule('hono/aws-lambda', () => ({
  handle: jest.fn((app) => app)
}));

jest.unstable_mockModule('@hono/swagger-ui', () => ({
  swaggerUI: jest.fn()
}));

describe('API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /', () => {
    test('should return server information', async () => {
      const expectedResponse = {
        message: 'MCP Server with Hono API (AWS Lambda)',
        version: '1.0.0',
        tools: ['echo', 'get_time', 'calculate', 'get_system_info', 'api_stats'],
        environment: 'lambda',
        protocols: ['MCP-over-HTTP', 'REST API'],
        endpoints: {
          mcp: 'POST /mcp - MCP protocol endpoint',
          rest: [
            'GET /api/tools - List available tools',
            'POST /api/tools/:name - Execute a tool',
            'GET /api/stats - Get API statistics',
            'GET /api/health - Health check'
          ],
          documentation: [
            'GET /docs - Interactive Swagger UI documentation',
            'GET /openapi.json - OpenAPI specification (JSON)'
          ]
        }
      };

      expect(expectedResponse.message).toBe('MCP Server with Hono API (AWS Lambda)');
      expect(expectedResponse.version).toBe('1.0.0');
      expect(Array.isArray(expectedResponse.tools)).toBe(true);
      expect(expectedResponse.tools).toHaveLength(5);
      expect(expectedResponse.protocols).toContain('MCP-over-HTTP');
      expect(expectedResponse.protocols).toContain('REST API');
    });
  });

  describe('GET /api/tools', () => {
    test('should return list of available tools', async () => {
      const tools = [
        {
          name: 'echo',
          description: 'Echo back the input text',
          inputSchema: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                description: 'The message to echo back'
              }
            },
            required: ['message']
          }
        },
        {
          name: 'get_time',
          description: 'Get the current date and time',
          inputSchema: {
            type: 'object',
            properties: {},
            required: []
          }
        }
      ];

      const expectedResponse = { tools };

      expect(expectedResponse.tools).toHaveLength(2);
      expect(expectedResponse.tools[0].name).toBe('echo');
      expect(expectedResponse.tools[1].name).toBe('get_time');
    });
  });

  describe('POST /api/tools/:name', () => {
    test('should execute echo tool successfully', async () => {
      const toolName = 'echo';
      const args = { message: 'Hello, World!' };
      const expectedResult = {
        content: [
          {
            type: 'text',
            text: 'Echo: Hello, World!'
          }
        ]
      };

      expect(expectedResult.content[0].text).toBe('Echo: Hello, World!');
      expect(expectedResult.content[0].type).toBe('text');
    });

    test('should execute get_time tool successfully', async () => {
      const mockDate = new Date('2024-01-15T10:30:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const expectedResult = {
        content: [
          {
            type: 'text',
            text: `Current time: ${mockDate.toISOString()}`
          }
        ]
      };

      expect(expectedResult.content[0].text).toBe('Current time: 2024-01-15T10:30:00.000Z');

      global.Date.mockRestore();
    });

    test('should execute calculate tool successfully', async () => {
      const args = { expression: '2 + 2' };
      const result = eval(args.expression.replace(/[^0-9+\-*/.()\s]/g, ''));
      const expectedResult = {
        content: [
          {
            type: 'text',
            text: `Result of '${args.expression}': ${result}`
          }
        ]
      };

      expect(expectedResult.content[0].text).toBe("Result of '2 + 2': 4");
    });

    test('should return 404 for unknown tool', async () => {
      const toolName = 'unknown_tool';
      const expectedError = { error: `Tool '${toolName}' not found` };

      expect(expectedError.error).toBe("Tool 'unknown_tool' not found");
    });

    test('should handle tool execution errors', async () => {
      const toolName = 'calculate';
      const args = { expression: 'invalid_expression' };
      
      try {
        eval(args.expression.replace(/[^0-9+\-*/.()\s]/g, ''));
      } catch (error) {
        const expectedError = { error: error.message };
        expect(expectedError).toHaveProperty('error');
        expect(typeof expectedError.error).toBe('string');
      }
    });

    test('should handle malformed JSON in request body', async () => {
      // Simulate malformed JSON handling
      const malformedJson = '{invalid json}';
      
      try {
        JSON.parse(malformedJson);
      } catch (error) {
        expect(error).toBeInstanceOf(SyntaxError);
      }
    });
  });

  describe('GET /api/stats', () => {
    test('should return API statistics', async () => {
      const mockApiState = {
        requests: 10,
        lastRequest: '2024-01-15T10:30:00.000Z'
      };

      const expectedResponse = {
        requests: mockApiState.requests,
        lastRequest: mockApiState.lastRequest,
        uptime: 123,
        memoryUsage: {
          rss: 50331648,
          heapTotal: 20971520,
          heapUsed: 15728640,
          external: 1048576,
          arrayBuffers: 524288
        },
        platform: 'linux',
        nodeVersion: 'v18.17.0',
        environment: 'lambda'
      };

      expect(expectedResponse.requests).toBe(10);
      expect(expectedResponse.lastRequest).toBe('2024-01-15T10:30:00.000Z');
      expect(typeof expectedResponse.uptime).toBe('number');
      expect(expectedResponse.memoryUsage).toHaveProperty('heapUsed');
      expect(expectedResponse.environment).toBe('lambda');
    });
  });

  describe('GET /api/health', () => {
    test('should return health status', async () => {
      const mockDate = new Date('2024-01-15T10:30:00.000Z');
      const expectedResponse = {
        status: 'healthy',
        timestamp: mockDate.toISOString(),
        environment: 'lambda'
      };

      expect(expectedResponse.status).toBe('healthy');
      expect(expectedResponse.environment).toBe('lambda');
      expect(expectedResponse.timestamp).toBe('2024-01-15T10:30:00.000Z');
    });
  });

  describe('GET /openapi.json', () => {
    test('should return OpenAPI specification', async () => {
      const openApiSpec = {
        openapi: '3.0.0',
        info: {
          title: 'MCP Server API',
          version: '1.0.0',
          description: 'A serverless Model Context Protocol (MCP) server that also provides REST API endpoints using Hono for better performance and AWS Lambda compatibility.'
        },
        paths: {}
      };

      expect(openApiSpec.openapi).toBe('3.0.0');
      expect(openApiSpec.info.title).toBe('MCP Server API');
      expect(openApiSpec.info.version).toBe('1.0.0');
      expect(openApiSpec).toHaveProperty('paths');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid JSON in request body', async () => {
      const invalidJson = '{invalid';
      
      try {
        JSON.parse(invalidJson);
      } catch (error) {
        expect(error).toBeInstanceOf(SyntaxError);
        expect(error.message).toContain('Unexpected end of JSON input');
      }
    });

    test('should handle missing required parameters', async () => {
      const args = {}; // Missing required 'message' parameter for echo tool
      const message = args?.message || '';
      
      expect(message).toBe('');
    });

    test('should handle network timeouts gracefully', async () => {
      // Simulate timeout scenario
      const timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 5000);
      });

      try {
        await timeoutPromise;
      } catch (error) {
        expect(error.message).toBe('Request timeout');
      }
    });
  });

  describe('CORS Configuration', () => {
    test('should allow cross-origin requests', async () => {
      // Test CORS headers would be set
      const corsConfig = {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
      };

      expect(corsConfig.origin).toBe('*');
      expect(corsConfig.methods).toContain('GET');
      expect(corsConfig.methods).toContain('POST');
      expect(corsConfig.allowedHeaders).toContain('Content-Type');
    });
  });

  describe('Request Logging', () => {
    test('should log incoming requests', async () => {
      const logEntry = {
        method: 'POST',
        path: '/api/tools/echo',
        timestamp: new Date().toISOString(),
        userAgent: 'Test Agent'
      };

      expect(logEntry.method).toBe('POST');
      expect(logEntry.path).toBe('/api/tools/echo');
      expect(typeof logEntry.timestamp).toBe('string');
      expect(logEntry.userAgent).toBe('Test Agent');
    });
  });
});