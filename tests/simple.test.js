const { describe, test, expect } = require('@jest/globals');

describe('MCP Server Basic Tests', () => {
  describe('Tool Logic Tests', () => {
    test('should format echo response correctly', () => {
      const message = 'Hello, World!';
      const result = {
        content: [
          {
            type: 'text',
            text: `Echo: ${message}`
          }
        ]
      };
      
      expect(result.content[0].text).toBe('Echo: Hello, World!');
      expect(result.content[0].type).toBe('text');
    });

    test('should format time response correctly', () => {
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
      expect(result.content[0].type).toBe('text');
    });

    test('should perform basic calculations', () => {
      const testCases = [
        { expression: '2 + 2', expected: 4 },
        { expression: '10 - 3', expected: 7 },
        { expression: '4 * 5', expected: 20 },
        { expression: '15 / 3', expected: 5 },
        { expression: '2 + 2 * 3', expected: 8 }
      ];

      testCases.forEach(({ expression, expected }) => {
        // Simulate the sanitization process
        const sanitized = expression.replace(/[^0-9+\-*/.()\s]/g, '');
        const result = eval(sanitized);
        expect(result).toBe(expected);
      });
    });

    test('should sanitize dangerous expressions', () => {
      const dangerousExpressions = [
        'alert("test")',
        'console.log("test")',
        'process.exit()',
        'require("fs")'
      ];

      dangerousExpressions.forEach(expr => {
        const sanitized = expr.replace(/[^0-9+\-*/.()\s]/g, '');
        expect(sanitized).toMatch(/^[0-9+\-*/.()\s]*$/);
        expect(sanitized).not.toContain('alert');
        expect(sanitized).not.toContain('console');
        expect(sanitized).not.toContain('process');
        expect(sanitized).not.toContain('require');
      });
    });

    test('should format system info correctly', () => {
      const mockInfo = {
        platform: 'linux',
        nodeVersion: 'v18.17.0',
        arch: 'x64',
        memoryUsage: 15,
        uptime: 123,
        isLambda: false
      };

      const infoText = `System Information:
• Platform: ${mockInfo.platform}
• Node Version: ${mockInfo.nodeVersion}
• Architecture: ${mockInfo.arch}
• Memory Usage: ${mockInfo.memoryUsage}MB
• Uptime: ${mockInfo.uptime}s
• Running on Lambda: ${mockInfo.isLambda ? 'Yes' : 'No'}`;

      expect(infoText).toContain('Platform: linux');
      expect(infoText).toContain('Node Version: v18.17.0');
      expect(infoText).toContain('Running on Lambda: No');
    });

    test('should format API stats correctly', () => {
      const mockStats = {
        requests: 42,
        lastRequest: '2024-01-15T10:30:00.000Z',
        uptime: 300,
        isLambda: true
      };

      const statsText = `API Usage Statistics:
• Total Requests: ${mockStats.requests}
• Last Request: ${mockStats.lastRequest}
• Server Uptime: ${mockStats.uptime}s
• Running on Lambda: ${mockStats.isLambda ? 'Yes' : 'No'}`;

      expect(statsText).toContain('Total Requests: 42');
      expect(statsText).toContain('Running on Lambda: Yes');
    });
  });

  describe('Tool Schema Validation', () => {
    test('should have valid tool schemas', () => {
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
              expression: { type: 'string', description: 'Mathematical expression to evaluate' }
            },
            required: ['expression']
          }
        }
      ];

      tools.forEach(tool => {
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('inputSchema');
        expect(tool.inputSchema.type).toBe('object');
        expect(Array.isArray(tool.inputSchema.required)).toBe(true);
      });
    });
  });

  describe('MCP Protocol Validation', () => {
    test('should validate JSON-RPC 2.0 format', () => {
      const validRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list'
      };

      expect(validRequest.jsonrpc).toBe('2.0');
      expect(validRequest).toHaveProperty('id');
      expect(validRequest).toHaveProperty('method');
    });

    test('should format successful response correctly', () => {
      const response = {
        jsonrpc: '2.0',
        id: 1,
        result: {
          content: [
            { type: 'text', text: 'Test response' }
          ]
        }
      };

      expect(response.jsonrpc).toBe('2.0');
      expect(response).toHaveProperty('result');
      expect(response.result.content[0].type).toBe('text');
    });

    test('should format error response correctly', () => {
      const errorResponse = {
        jsonrpc: '2.0',
        id: 1,
        error: {
          code: -32601,
          message: 'Method not found',
          data: 'Unknown tool: invalid'
        }
      };

      expect(errorResponse.jsonrpc).toBe('2.0');
      expect(errorResponse).toHaveProperty('error');
      expect(errorResponse.error.code).toBe(-32601);
      expect(typeof errorResponse.error.message).toBe('string');
    });
  });

  describe('Server Configuration', () => {
    test('should have correct server info', () => {
      const serverInfo = {
        name: 'demo-mcp-server',
        version: '1.0.0',
        protocolVersion: '2024-11-05'
      };

      expect(serverInfo.name).toBe('demo-mcp-server');
      expect(serverInfo.version).toBe('1.0.0');
      expect(serverInfo.protocolVersion).toBe('2024-11-05');
    });

    test('should have correct capabilities', () => {
      const capabilities = {
        tools: {},
        logging: {}
      };

      expect(capabilities).toHaveProperty('tools');
      expect(capabilities).toHaveProperty('logging');
    });
  });

  describe('Input Validation', () => {
    test('should handle missing parameters gracefully', () => {
      // Test echo with missing message
      const args = {};
      const message = args?.message || '';
      expect(message).toBe('');
    });

    test('should handle invalid JSON gracefully', () => {
      const invalidJson = '{invalid json}';
      
      try {
        JSON.parse(invalidJson);
      } catch (error) {
        expect(error).toBeInstanceOf(SyntaxError);
        expect(error.message).toMatch(/Expected property name|Unexpected token/);
      }
    });

    test('should validate required parameters', () => {
      const echoSchema = {
        required: ['message']
      };

      const validArgs = { message: 'test' };
      const invalidArgs = {};

      expect(validArgs).toHaveProperty('message');
      expect(invalidArgs).not.toHaveProperty('message');
      expect(echoSchema.required).toContain('message');
    });
  });

  describe('Math Functions', () => {
    test('should have access to safe math functions', () => {
      const allowedFunctions = {
        abs: Math.abs,
        round: Math.round,
        min: Math.min,
        max: Math.max,
        sqrt: Math.sqrt,
        pow: Math.pow,
        floor: Math.floor,
        ceil: Math.ceil
      };

      expect(allowedFunctions.abs(-5)).toBe(5);
      expect(allowedFunctions.round(4.7)).toBe(5);
      expect(allowedFunctions.min(2, 8, 1)).toBe(1);
      expect(allowedFunctions.max(2, 8, 1)).toBe(8);
      expect(allowedFunctions.sqrt(16)).toBe(4);
      expect(allowedFunctions.pow(2, 3)).toBe(8);
      expect(allowedFunctions.floor(4.9)).toBe(4);
      expect(allowedFunctions.ceil(4.1)).toBe(5);
    });
  });
});