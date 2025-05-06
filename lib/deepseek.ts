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
    metadata?: Record<string, any>;
  }
  
  interface RAGRequest {
    query: string;
    context: RAGContext[];
    options?: RAGOptions;
  }
  
  export class DeepseekAPI {
    private apiKey: string;
    private endpoint: string;
  
    constructor(config: DeepseekConfig) {
      this.apiKey = config.apiKey;
      this.endpoint = config.endpoint || 'https://api.deepseek.com/v1';
    }
  
    async generateWithRAG({ query, context, options = {} }: RAGRequest): Promise<string> {
      try {
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
        });
  
        if (!response.ok) {
          throw new Error(`Deepseek API error: ${response.statusText}`);
        }
  
        const data = await response.json();
        return data.choices[0].message.content;
      } catch (error) {
        console.error('Deepseek API Error:', error);
        throw error;
      }
    }
  }