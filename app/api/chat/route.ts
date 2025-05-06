import { NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';
import { DeepseekAPI } from '@/lib/deepseek';

interface ProductResponse {
  _id: string;
  name: string;
  description: string;
  price: number;
  variant: string;
  stock: number;
  images: Array<{
    asset: {
      url: string;
    };
  }>;
}

// Initialize Deepseek API with your configuration
const deepseek = new DeepseekAPI({
  apiKey: process.env.DEEPSEEK_API_KEY!,
  endpoint: process.env.DEEPSEEK_ENDPOINT
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // Fetch relevant products from Sanity
    const query = `*[_type == "product"] {
      _id,
      name,
      description,
      price,
      variant,
      stock,
      "imageUrl": images[0].asset->url
    }`;
    const products = await client.fetch<ProductResponse[]>(query);

    // Create context for RAG
    const context = products.map((product) => ({
      text: `${product.name}: ${product.description}. Price: $${product.price}. Variant: ${product.variant}. Stock: ${product.stock}`,
      metadata: { id: product._id }
    }));

    // Get response from Deepseek with RAG
    const response = await deepseek.generateWithRAG({
      query: message,
      context: context,
      options: {
        temperature: 0.7,
        max_tokens: 500
      }
    });

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}