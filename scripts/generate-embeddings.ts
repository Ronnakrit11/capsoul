import { client } from '@/sanity/lib/client';
import { upsertEmbedding } from '@/lib/embeddings';

async function generateProductEmbeddings() {
  const products = await client.fetch(`
    *[_type == "product"] {
      _id,
      name,
      description,
      price,
      variant,
      stock,
      "imageUrl": images[0].asset->url
    }
  `);

  console.log(`Generating embeddings for ${products.length} products...`);

  for (const product of products) {
    const content = `${product.name}: ${product.description}. Price: $${product.price}. Variant: ${product.variant}. Stock: ${product.stock}`;
    
    try {
      await upsertEmbedding(product._id, content, {
        name: product.name,
        price: product.price,
        variant: product.variant,
        imageUrl: product.imageUrl
      });
      console.log(`Generated embedding for ${product.name}`);
    } catch (error) {
      console.error(`Error generating embedding for ${product.name}:`, error);
    }
  }

  console.log('Finished generating embeddings');
}

generateProductEmbeddings().catch(console.error);