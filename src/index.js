/**
 * AWS Lambda Handler for MCP Server with Hono API
 * 
 * This handler provides both MCP-over-HTTP and REST API endpoints
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { handle } from 'hono/aws-lambda';
import { swaggerUI } from '@hono/swagger-ui';

// Initialize MCP Server
const mcpServer = new Server({
  name: 'demo-mcp-server',
  version: '1.0.0',
}, {
  capabilities: {
    tools: {},
    logging: {}
  }
});

// Initialize Hono app
const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger());

// Store for API state
let apiState = {
  requests: 0,
  lastRequest: null
};

// MCP Tools - only the specified ones
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

// Tool implementations
const toolImplementations = {
  echo: async (args) => {
    apiState.requests++;
    apiState.lastRequest = new Date().toISOString();
    const message = args?.message || '';
    return {
      content: [
        {
          type: 'text',
          text: `Echo: ${message}`
        }
      ]
    };
  },

  get_time: async () => {
    apiState.requests++;
    apiState.lastRequest = new Date().toISOString();
    const now = new Date();
    return {
      content: [
        {
          type: 'text',
          text: `Current time: ${now.toISOString()}`
        }
      ]
    };
  },

  calculate: async (args) => {
    apiState.requests++;
    apiState.lastRequest = new Date().toISOString();
    const expression = args.expression;
    try {
      // Safe evaluation - only allow basic math operations
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
      
      // Remove potentially dangerous characters
      const sanitizedExpression = expression.replace(/[^0-9+\-*/.()\s]/g, '');
      
      // Create a safe evaluation context
      const result = Function('Math', `return ${sanitizedExpression}`)(allowedNames);
      
      return {
        content: [
          {
            type: 'text',
            text: `Result of '${expression}': ${result}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error calculating '${expression}': ${error.message}`
          }
        ]
      };
    }
  },

  get_system_info: async () => {
    apiState.requests++;
    apiState.lastRequest = new Date().toISOString();
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
    
    const infoText = `System Information:
• Platform: ${info.platform}
• Node Version: ${info.nodeVersion}
• Architecture: ${info.arch}
• Current Directory: ${info.cwd}
• Memory Usage: ${Math.round(info.memoryUsage.heapUsed / 1024 / 1024)}MB
• Uptime: ${Math.round(info.uptime)}s
• Process ID: ${info.pid}
• Running on Lambda: ${info.isLambda ? 'Yes' : 'No'}`;
    
    return {
      content: [
        {
          type: 'text',
          text: infoText
        }
      ]
    };
  },

  api_stats: async () => {
    const now = new Date().toISOString();
    apiState.requests++;
    apiState.lastRequest = now;
    return {
      content: [
        {
          type: 'text',
          text: `API Usage Statistics:
• Total Requests: ${apiState.requests}
• Last Request: ${apiState.lastRequest}
• Server Uptime: ${Math.round(process.uptime())}s
• Running on Lambda: ${process.env.AWS_LAMBDA_FUNCTION_NAME ? 'Yes' : 'No'}`
        }
      ]
    };
  }
};

// OpenAPI specification
const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'MCP Server API',
    version: '1.0.0',
    description: 'A serverless Model Context Protocol (MCP) server that also provides REST API endpoints using Hono for better performance and AWS Lambda compatibility.',
    contact: {
      name: 'API Support',
      url: 'https://github.com/your-repo/mcp-server'
    }
  },
  servers: [
    {
      url: 'https://okwaj0rdwk.execute-api.us-east-1.amazonaws.com',
      description: 'Production server'
    },
    {
      url: 'http://localhost:3000',
      description: 'Development server'
    }
  ],
  paths: {
    '/': {
      get: {
        summary: 'Get server information',
        description: 'Returns server information, available tools, and endpoints',
        responses: {
          '200': {
            description: 'Server information',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    version: { type: 'string' },
                    tools: { type: 'array', items: { type: 'string' } },
                    environment: { type: 'string' },
                    protocols: { type: 'array', items: { type: 'string' } },
                    endpoints: { type: 'object' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/tools': {
      get: {
        summary: 'List available tools',
        description: 'Returns a list of all available tools with their schemas',
        responses: {
          '200': {
            description: 'List of tools',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    tools: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          name: { type: 'string' },
                          description: { type: 'string' },
                          inputSchema: { type: 'object' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/tools/{name}': {
      post: {
        summary: 'Execute a tool',
        description: 'Execute a specific tool with provided arguments',
        parameters: [
          {
            name: 'name',
            in: 'path',
            required: true,
            description: 'Name of the tool to execute',
            schema: { type: 'string', enum: ['echo', 'get_time', 'calculate', 'get_system_info', 'api_stats'] }
          }
        ],
        requestBody: {
          description: 'Tool arguments',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                additionalProperties: true
              },
              examples: {
                echo: {
                  summary: 'Echo tool example',
                  value: { message: 'Hello, World!' }
                },
                calculate: {
                  summary: 'Calculate tool example',
                  value: { expression: '2 + 2 * 3' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Tool execution result',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    content: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          type: { type: 'string' },
                          text: { type: 'string' }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          '404': {
            description: 'Tool not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Tool execution error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/health': {
      get: {
        summary: 'Health check',
        description: 'Returns server health status',
        responses: {
          '200': {
            description: 'Server is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    timestamp: { type: 'string' },
                    environment: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/stats': {
      get: {
        summary: 'Get API statistics',
        description: 'Returns API usage statistics',
        responses: {
          '200': {
            description: 'API statistics',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    requests: { type: 'number' },
                    lastRequest: { type: 'string', nullable: true },
                    uptime: { type: 'number' },
                    memoryUsage: { type: 'object' },
                    platform: { type: 'string' },
                    nodeVersion: { type: 'string' },
                    environment: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/mcp': {
      get: {
        summary: 'MCP server discovery',
        description: 'Returns MCP server capabilities for discovery',
        responses: {
          '200': {
            description: 'MCP server capabilities',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    version: { type: 'string' },
                    protocolVersion: { type: 'string' },
                    capabilities: { type: 'object' }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'MCP protocol endpoint',
        description: 'Handle MCP JSON-RPC 2.0 requests',
        requestBody: {
          description: 'JSON-RPC 2.0 request',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  jsonrpc: { type: 'string', enum: ['2.0'] },
                  id: { type: ['string', 'number', 'null'] },
                  method: { type: 'string' },
                  params: { type: 'object' }
                },
                required: ['jsonrpc', 'method']
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'JSON-RPC 2.0 response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    jsonrpc: { type: 'string' },
                    id: { type: ['string', 'number', 'null'] },
                    result: { type: 'object' },
                    error: { type: 'object' }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      Tool: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          inputSchema: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              properties: { type: 'object' },
              required: { type: 'array', items: { type: 'string' } }
            }
          }
        }
      },
      ToolResult: {
        type: 'object',
        properties: {
          content: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string' },
                text: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }
};

// Hono API Routes
app.get('/', (c) => {
  return c.json({
    message: 'MCP Server with Hono API (AWS Lambda)',
    version: '1.0.0',
    tools: tools.map(t => t.name),
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
  });
});

app.get('/api/tools', (c) => {
  return c.json({ tools });
});

app.post('/api/tools/:name', async (c) => {
  const toolName = c.req.param('name');
  let args = {};
  
  try {
    const rawBody = await c.req.text();
    if (rawBody) {
      args = JSON.parse(rawBody);
    }
  } catch (error) {
    // Fallback to Hono's built-in method or empty object
    try {
      args = await c.req.json();
    } catch (error2) {
      args = {};
    }
  }
  
  if (!toolImplementations[toolName]) {
    return c.json({ error: `Tool '${toolName}' not found` }, 404);
  }
  
  try {
    const result = await toolImplementations[toolName](args);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

app.get('/api/stats', (c) => {
  return c.json({
    requests: apiState.requests,
    lastRequest: apiState.lastRequest,
    uptime: Math.round(process.uptime()),
    memoryUsage: process.memoryUsage(),
    platform: process.platform,
    nodeVersion: process.version,
    environment: 'lambda'
  });
});

app.get('/api/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: 'lambda'
  });
});

// OpenAPI and Swagger documentation endpoints
app.get('/openapi.json', (c) => {
  return c.json(openApiSpec);
});

app.get('/docs', swaggerUI({ url: '/openapi.json' }));

// Register MCP tools with the MCP server
mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  if (!toolImplementations[name]) {
    throw new Error(`Unknown tool: ${name}`);
  }
  
  try {
    const result = await toolImplementations[name](args || {});
    return result;
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error executing tool '${name}': ${error.message}`
        }
      ]
    };
  }
});

// MCP-over-HTTP endpoint
// MCP endpoint - handle both GET and POST
app.get('/mcp', (c) => {
  // Return server capabilities for discovery
  return c.json({
    name: 'demo-mcp-server',
    version: '1.0.0',
    protocolVersion: '2024-11-05',
    capabilities: {
      tools: {},
      logging: {}
    }
  });
});

app.post('/mcp', async (c) => {
  try {
    const request = await c.req.json();
    const { jsonrpc, id, method, params } = request;
    
    // Handle MCP protocol methods
    if (method === 'initialize') {
      return c.json({
        jsonrpc: '2.0',
        id,
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
      });
    }
    
    if (method === 'notifications/initialized') {
      // This is a notification, return success with no result
      return c.json({ jsonrpc: '2.0', result: null });
    }
    
    if (method === 'tools/list') {
      return c.json({
        jsonrpc: '2.0',
        id,
        result: { tools }
      });
    }
    
    if (method === 'tools/call') {
      const { name, arguments: args } = params;
      
      if (!toolImplementations[name]) {
        return c.json({
          jsonrpc: '2.0',
          id,
          error: {
            code: -32601,
            message: 'Method not found',
            data: `Unknown tool: ${name}`
          }
        });
      }
      
      try {
        const result = await toolImplementations[name](args || {});
        return c.json({
          jsonrpc: '2.0',
          id,
          result
        });
      } catch (error) {
        return c.json({
          jsonrpc: '2.0',
          id,
          error: {
            code: -32603,
            message: 'Internal error',
            data: error.message
          }
        });
      }
    }
    
    // Unknown method
    return c.json({
      jsonrpc: '2.0',
      id,
      error: {
        code: -32601,
        message: 'Method not found',
        data: `Unknown method: ${method}`
      }
    });
    
  } catch (error) {
    return c.json({
      jsonrpc: '2.0',
      error: {
        code: -32700,
        message: 'Parse error',
        data: error.message
      },
      id: null
    }, 400);
  }
});

// Export the Lambda handler
export const handler = handle(app);