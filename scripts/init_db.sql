create table
  public.code_embeddings (
    id serial,
    owner text not null,
    repo_name text not null,
    path text not null,
    file_name text not null,
    file_content text not null,
    embedding public.vector null,
    constraint code_embeddings_pkey primary key (id)
  ) tablespace pg_default;

create view distinct_repo as
  select distinct owner, repo_name from public.code_embeddings;
