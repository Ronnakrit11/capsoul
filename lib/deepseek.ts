interface DeepseekConfig {
    apiKey: string;
    endpoint?: string;
  }
  
  interface RAGOptions {
    temperature?: number;
    max_tokens?: number;
    top_k?: number;
    top_p?: number;
  }
  
  interface RAGContext {
    text: string;
    metadata?: Record<string, unknown>;
  }
  
  interface RAGRequest {
    query: string;
    context: RAGContext[];
    options?: RAGOptions;
  }
  
  interface DeepseekResponse {
    choices: Array<{
      message: {
        content: string;
      };
    }>;
  }
  
  export class DeepseekAPI {
    private apiKey: string;
    private endpoint: string;
    private timeout: number;
  
    constructor(config: DeepseekConfig) {
      this.apiKey = config.apiKey;
      this.endpoint = config.endpoint || 'https://api.deepseek.com/v1';
      this.timeout = 25000; // 25 second timeout
    }
  
    async generateWithRAG({ query, context, options = {} }: RAGRequest): Promise<string> {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
  
        const response = await fetch(`${this.endpoint}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              {
                role: 'system',
                content: 'You are a helpful product assistant. Use the provided context to answer questions about products accurately and professionally.'
              },
              {
                role: 'user',
                content: `Context: ${context.map(c => c.text).join('\n\n')}\n\nQuestion: ${query}`
              }
            ],
            ...options
          }),
          signal: controller.signal
        });
  
        clearTimeout(timeoutId);
  
        if (!response.ok) {
          throw new Error(`Deepseek API error: ${response.statusText}`);
        }
  
        const data = await response.json() as DeepseekResponse;
        return data.choices[0].message.content;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        console.error('Deepseek API Error:', error);
        throw error;
      }
    }
  }