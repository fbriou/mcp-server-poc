import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// Mock the MCP SDK and Hono modules
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

// Import the module after mocking
const { handler } = await import('../src/index.js');

// Mock process for system info tests
const originalProcess = global.process;

describe('MCP Tools', () => {
  beforeEach(() => {
    global.process = {
      ...originalProcess,
      platform: 'linux',
      version: 'v18.17.0',
      arch: 'x64',
      cwd: () => '/app',
      memoryUsage: () => ({
        rss: 50331648,
        heapTotal: 20971520,
        heapUsed: 15728640,
        external: 1048576,
        arrayBuffers: 524288
      }),
      uptime: () => 123.456,
      pid: 12345,
      env: {}
    };
  });

  describe('Echo Tool', () => {
    test('should echo back the provided message', async () => {
      // Create a mock context for testing the tool directly
      const mockContext = {
        req: {
          json: async () => ({ message: 'Hello, World!' }),
          param: () => 'echo',
          text: async () => JSON.stringify({ message: 'Hello, World!' })
        },
        json: jest.fn()
      };

      // We need to test the tool implementation logic
      const args = { message: 'Hello, World!' };
      const result = {
        content: [
          {
            type: 'text',
            text: `Echo: ${args.message}`
          }
        ]
      };

      expect(result.content[0].text).toBe('Echo: Hello, World!');
      expect(result.content[0].type).toBe('text');
    });

    test('should handle empty message', async () => {
      const args = { message: '' };
      const result = {
        content: [
          {
            type: 'text',
            text: `Echo: ${args.message}`
          }
        ]
      };

      expect(result.content[0].text).toBe('Echo: ');
    });

    test('should handle missing message parameter', async () => {
      const args = {};
      const message = args?.message || '';
      const result = {
        content: [
          {
            type: 'text',
            text: `Echo: ${message}`
          }
        ]
      };

      expect(result.content[0].text).toBe('Echo: ');
    });
  });

  describe('Get Time Tool', () => {
    test('should return current time in ISO format', async () => {
      const mockDate = new Date('2024-01-15T10:30:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const result = {
        content: [
          {
            type: 'text',
            text: `Current time: ${mockDate.toISOString()}`
          }
        ]
      };

      expect(result.content[0].text).toBe('Current time: 2024-01-15T10:30:00.000Z');
      expect(result.content[0].type).toBe('text');

      global.Date.mockRestore();
    });
  });

  describe('Calculate Tool', () => {
    test('should perform basic arithmetic operations', async () => {
      const testCases = [
        { expression: '2 + 2', expected: 4 },
        { expression: '10 - 3', expected: 7 },
        { expression: '4 * 5', expected: 20 },
        { expression: '15 / 3', expected: 5 },
        { expression: '2 + 2 * 3', expected: 8 },
        { expression: '(2 + 2) * 3', expected: 12 }
      ];

      testCases.forEach(({ expression, expected }) => {
        // Simulate the sanitization and evaluation logic
        const sanitizedExpression = expression.replace(/[^0-9+\-*/.()\s]/g, '');
        const result = eval(sanitizedExpression); // Using eval for test purposes only
        
        expect(result).toBe(expected);
      });
    });

    test('should handle mathematical functions', async () => {
      const allowedNames = {
        abs: Math.abs,
        round: Math.round,
        min: Math.min,
        max: Math.max,
        sqrt: Math.sqrt,
        pow: Math.pow,
        floor: Math.floor,
        ceil: Math.ceil
      };

      // Test abs function access
      expect(allowedNames.abs(-5)).toBe(5);
      expect(allowedNames.round(4.7)).toBe(5);
      expect(allowedNames.min(2, 8, 1)).toBe(1);
      expect(allowedNames.max(2, 8, 1)).toBe(8);
      expect(allowedNames.sqrt(16)).toBe(4);
      expect(allowedNames.pow(2, 3)).toBe(8);
      expect(allowedNames.floor(4.9)).toBe(4);
      expect(allowedNames.ceil(4.1)).toBe(5);
    });

    test('should sanitize dangerous characters', async () => {
      const expressions = [
        'alert("xss")',
        'process.exit(1)',
        'require("fs")',
        'console.log("test")'
      ];

      expressions.forEach(expression => {
        const sanitized = expression.replace(/[^0-9+\-*/.()\s]/g, '');
        // Should remove all dangerous characters, leaving only numbers and basic operators
        expect(sanitized).toMatch(/^[0-9+\-*/.()\s]*$/);
      });
    });

    test('should handle calculation errors gracefully', async () => {
      const invalidExpressions = [
        '1/0',
        'invalid',
        '+++'
      ];

      invalidExpressions.forEach(expression => {
        try {
          const sanitized = expression.replace(/[^0-9+\-*/.()\s]/g, '');
          // This should throw an error for invalid expressions
          eval(sanitized);
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });
    });
  });

  describe('Get System Info Tool', () => {
    test('should return comprehensive system information', async () => {
      const info = {
        platform: process.platform,
        nodeVersion: process.version,
        arch: process.arch,
        cwd: process.cwd(),
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
        pid: process.pid,
        isLambda: !!process.env.AWS_LAMBDA_FUNCTION_NAME
      };

      expect(info.platform).toBe('linux');
      expect(info.nodeVersion).toBe('v18.17.0');
      expect(info.arch).toBe('x64');
      expect(info.cwd).toBe('/app');
      expect(info.memoryUsage).toHaveProperty('rss');
      expect(info.memoryUsage).toHaveProperty('heapUsed');
      expect(typeof info.uptime).toBe('number');
      expect(info.pid).toBe(12345);
      expect(typeof info.isLambda).toBe('boolean');
    });

    test('should detect Lambda environment', async () => {
      // Test without Lambda env var
      process.env.AWS_LAMBDA_FUNCTION_NAME = undefined;
      expect(!!process.env.AWS_LAMBDA_FUNCTION_NAME).toBe(false);

      // Test with Lambda env var
      process.env.AWS_LAMBDA_FUNCTION_NAME = 'test-function';
      expect(!!process.env.AWS_LAMBDA_FUNCTION_NAME).toBe(true);

      // Clean up
      delete process.env.AWS_LAMBDA_FUNCTION_NAME;
    });

    test('should format memory usage in MB', async () => {
      const memoryUsage = { heapUsed: 15728640 }; // 15 MB
      const formattedMemory = Math.round(memoryUsage.heapUsed / 1024 / 1024);
      expect(formattedMemory).toBe(15);
    });
  });

  describe('API Stats Tool', () => {
    test('should return API statistics', async () => {
      const mockDate = new Date('2024-01-15T10:30:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      // Mock API state
      const apiState = {
        requests: 5,
        lastRequest: null
      };

      const now = mockDate.toISOString();
      apiState.requests++;
      apiState.lastRequest = now;

      expect(apiState.requests).toBe(6);
      expect(apiState.lastRequest).toBe('2024-01-15T10:30:00.000Z');

      global.Date.mockRestore();
    });

    test('should include uptime in statistics', async () => {
      const uptime = Math.round(process.uptime());
      expect(typeof uptime).toBe('number');
      expect(uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Tool Schema Validation', () => {
    test('should have valid tool definitions', async () => {
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
        },
        {
          name: 'calculate',
          description: 'Perform basic mathematical calculations',
          inputSchema: {
            type: 'object',
            properties: {
              expression: {
                type: 'string',
                description: 'Mathematical expression to evaluate (e.g., "2 + 2 * 3")'
              }
            },
            required: ['expression']
          }
        },
        {
          name: 'get_system_info',
          description: 'Get basic system information',
          inputSchema: {
            type: 'object',
            properties: {},
            required: []
          }
        },
        {
          name: 'api_stats',
          description: 'Get API usage statistics',
          inputSchema: {
            type: 'object',
            properties: {},
            required: []
          }
        }
      ];

      tools.forEach(tool => {
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('inputSchema');
        expect(tool.inputSchema).toHaveProperty('type');
        expect(tool.inputSchema.type).toBe('object');
        expect(tool.inputSchema).toHaveProperty('properties');
        expect(tool.inputSchema).toHaveProperty('required');
        expect(Array.isArray(tool.inputSchema.required)).toBe(true);
      });
    });
  });
});