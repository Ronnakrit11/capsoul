/*
  # Create product embeddings table and search function

  1. New Tables
    - `product_embeddings`
      - `id` (text, primary key) - Product ID
      - `content` (text) - Product content for embedding
      - `embedding` (vector) - Vector embedding of content
      - `metadata` (jsonb) - Additional product metadata
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Functions
    - `match_products` - Performs vector similarity search
*/

-- Enable vector extension
create extension if not exists vector;

-- Create product embeddings table
create table if not exists product_embeddings (
  id text primary key,
  content text,
  embedding vector(1536),
  metadata jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create function for similarity search
create or replace function match_products (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id text,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    product_embeddings.id,
    product_embeddings.content,
    product_embeddings.metadata,
    1 - (product_embeddings.embedding <=> query_embedding) as similarity
  from product_embeddings
  where 1 - (product_embeddings.embedding <=> query_embedding) > match_threshold
  order by product_embeddings.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Create index for faster similarity search
create index on product_embeddings 
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);