create table
  public.code_embeddings (
    id serial,
    owner text not null,
    repo_name text not null,
    path text not null,
    file_name text not null,
    content text not null,
    embedding public.vector null,
    metadata JSONB,
    constraint code_embeddings_pkey primary key (id)
  ) tablespace pg_default;

create view distinct_repo as
  select distinct owner, repo_name from public.code_embeddings;

create table
  user_chat (
    id serial primary key,
    owner text not null,
    repo_name text not null
  );

create table
  user_chat_messages (
    id serial primary key,
    user_chat_id integer not null REFERENCES user_chat(id),
    message text not null,
    sender text not null,
    created_at timestamp not null default now()
  );

create or replace function match_code (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  repo_name text,
  owner text
)
returns TABLE (
  id bigint,
  content text,
  file_name text,
  similarity double precision
)
language sql stable
as $$
  select
    code_embeddings.id,
    code_embeddings.content,
    code_embeddings.file_name,
    1 - (code_embeddings.embedding <=> query_embedding) as similarity
  from code_embeddings
  where code_embeddings.embedding <=> query_embedding < 1 - match_threshold
    and code_embeddings.repo_name = repo_name
    and code_embeddings.owner = owner
  order by code_embeddings.embedding <=> query_embedding
  limit match_count;
$$;

-- from langchain docs
create function match_documents (
  query_embedding vector(1536),
  match_count int DEFAULT null,
  filter jsonb DEFAULT '{}'
) returns table (
  id int,
  content text,
  metadata jsonb,
  embedding jsonb,
  similarity float
)
language plpgsql
as $$
#variable_conflict use_column
begin
  return query
  select
    id,
    content,
    metadata,
    (embedding::text)::jsonb as embedding,
    1 - (supabase_vector_store.embedding <=> query_embedding) as similarity
  from supabase_vector_store
  where metadata @> filter
  order by supabase_vector_store.embedding <=> query_embedding
  limit match_count;
end;
$$;

create table supabase_vector_store (
  content text not null,
  embedding vector(1536) not null,
  metadata JSONB,
  id serial primary key
);
