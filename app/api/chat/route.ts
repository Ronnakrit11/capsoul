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

const deepseek = new DeepseekAPI({
  apiKey: process.env.DEEPSEEK_API_KEY!,
  endpoint: process.env.DEEPSEEK_ENDPOINT
});

export const maxDuration = 300; // Set max duration to 5 minutes
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // Add timeout to Sanity query
    const query = `*[_type == "product"] {
      _id,
      name,
      description,
      price,
      variant,
      stock,
      "imageUrl": images[0].asset->url
    }`;
    
    const products = await Promise.race([
      client.fetch<ProductResponse[]>(query),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 10000)
      )
    ]) as ProductResponse[];

    const context = products.map((product) => ({
      text: `${product.name}: ${product.description}. Price: $${product.price}. Variant: ${product.variant}. Stock: ${product.stock}`,
      metadata: { id: product._id }
    }));

    // Add timeout to Deepseek API call
    const response = await Promise.race([
      deepseek.generateWithRAG({
        query: message,
        context: context,
        options: {
          temperature: 0.7,
          max_tokens: 500
        }
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI response timeout')), 25000)
      )
    ]);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: error instanceof Error && error.message.includes('timeout') ? 504 : 500 }
    );
  }
}