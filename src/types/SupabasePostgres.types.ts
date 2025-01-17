export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
    graphql_public: {
        Tables: {
            [_ in never]: never
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            graphql: {
                Args: {
                    operationName?: string
                    query?: string
                    variables?: Json
                    extensions?: Json
                }
                Returns: Json
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
    public: {
        Tables: {
            code_embeddings: {
                Row: {
                    content: string
                    embedding: string | null
                    file_name: string
                    id: number
                    metadata: Json | null
                    owner: string
                    path: string
                    repo_name: string
                }
                Insert: {
                    content: string
                    embedding?: string | null
                    file_name: string
                    id?: number
                    metadata?: Json | null
                    owner: string
                    path: string
                    repo_name: string
                }
                Update: {
                    content?: string
                    embedding?: string | null
                    file_name?: string
                    id?: number
                    metadata?: Json | null
                    owner?: string
                    path?: string
                    repo_name?: string
                }
                Relationships: []
            }
            supabase_vector_store: {
                Row: {
                    content: string
                    embedding: string
                    id: number
                    metadata: Json | null
                }
                Insert: {
                    content: string
                    embedding: string
                    id?: number
                    metadata?: Json | null
                }
                Update: {
                    content?: string
                    embedding?: string
                    id?: number
                    metadata?: Json | null
                }
                Relationships: []
            }
            user_chat: {
                Row: {
                    id: number
                    owner: string
                    repo_name: string
                }
                Insert: {
                    id?: number
                    owner: string
                    repo_name: string
                }
                Update: {
                    id?: number
                    owner?: string
                    repo_name?: string
                }
                Relationships: []
            }
            user_chat_messages: {
                Row: {
                    created_at: string
                    id: number
                    message: string
                    sender: string
                    user_chat_id: number
                }
                Insert: {
                    created_at?: string
                    id?: number
                    message: string
                    sender: string
                    user_chat_id: number
                }
                Update: {
                    created_at?: string
                    id?: number
                    message?: string
                    sender?: string
                    user_chat_id?: number
                }
                Relationships: [
                    {
                        foreignKeyName: 'user_chat_messages_user_chat_id_fkey'
                        columns: ['user_chat_id']
                        referencedRelation: 'user_chat'
                        referencedColumns: ['id']
                    }
                ]
            }
        }
        Views: {
            distinct_repo: {
                Row: {
                    owner: string | null
                    repo_name: string | null
                }
                Relationships: []
            }
        }
        Functions: {
            hnswhandler: {
                Args: {
                    '': unknown
                }
                Returns: unknown
            }
            ivfflathandler: {
                Args: {
                    '': unknown
                }
                Returns: unknown
            }
            match_code: {
                Args: {
                    query_embedding: string
                    match_threshold: number
                    match_count: number
                    repo_name: string
                    owner: string
                }
                Returns: {
                    id: number
                    content: string
                    file_name: string
                    similarity: number
                }[]
            }
            match_documents: {
                Args: {
                    query_embedding: string
                    match_count?: number
                    filter?: Json
                }
                Returns: {
                    id: number
                    content: string
                    metadata: Json
                    embedding: Json
                    similarity: number
                }[]
            }
            vector_avg: {
                Args: {
                    '': number[]
                }
                Returns: string
            }
            vector_dims: {
                Args: {
                    '': string
                }
                Returns: number
            }
            vector_norm: {
                Args: {
                    '': string
                }
                Returns: number
            }
            vector_out: {
                Args: {
                    '': string
                }
                Returns: unknown
            }
            vector_send: {
                Args: {
                    '': string
                }
                Returns: string
            }
            vector_typmod_in: {
                Args: {
                    '': unknown[]
                }
                Returns: number
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
    storage: {
        Tables: {
            buckets: {
                Row: {
                    allowed_mime_types: string[] | null
                    avif_autodetection: boolean | null
                    created_at: string | null
                    file_size_limit: number | null
                    id: string
                    name: string
                    owner: string | null
                    public: boolean | null
                    updated_at: string | null
                }
                Insert: {
                    allowed_mime_types?: string[] | null
                    avif_autodetection?: boolean | null
                    created_at?: string | null
                    file_size_limit?: number | null
                    id: string
                    name: string
                    owner?: string | null
                    public?: boolean | null
                    updated_at?: string | null
                }
                Update: {
                    allowed_mime_types?: string[] | null
                    avif_autodetection?: boolean | null
                    created_at?: string | null
                    file_size_limit?: number | null
                    id?: string
                    name?: string
                    owner?: string | null
                    public?: boolean | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: 'buckets_owner_fkey'
                        columns: ['owner']
                        referencedRelation: 'users'
                        referencedColumns: ['id']
                    }
                ]
            }
            migrations: {
                Row: {
                    executed_at: string | null
                    hash: string
                    id: number
                    name: string
                }
                Insert: {
                    executed_at?: string | null
                    hash: string
                    id: number
                    name: string
                }
                Update: {
                    executed_at?: string | null
                    hash?: string
                    id?: number
                    name?: string
                }
                Relationships: []
            }
            objects: {
                Row: {
                    bucket_id: string | null
                    created_at: string | null
                    id: string
                    last_accessed_at: string | null
                    metadata: Json | null
                    name: string | null
                    owner: string | null
                    path_tokens: string[] | null
                    updated_at: string | null
                    version: string | null
                }
                Insert: {
                    bucket_id?: string | null
                    created_at?: string | null
                    id?: string
                    last_accessed_at?: string | null
                    metadata?: Json | null
                    name?: string | null
                    owner?: string | null
                    path_tokens?: string[] | null
                    updated_at?: string | null
                    version?: string | null
                }
                Update: {
                    bucket_id?: string | null
                    created_at?: string | null
                    id?: string
                    last_accessed_at?: string | null
                    metadata?: Json | null
                    name?: string | null
                    owner?: string | null
                    path_tokens?: string[] | null
                    updated_at?: string | null
                    version?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: 'objects_bucketId_fkey'
                        columns: ['bucket_id']
                        referencedRelation: 'buckets'
                        referencedColumns: ['id']
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            can_insert_object: {
                Args: {
                    bucketid: string
                    name: string
                    owner: string
                    metadata: Json
                }
                Returns: undefined
            }
            extension: {
                Args: {
                    name: string
                }
                Returns: string
            }
            filename: {
                Args: {
                    name: string
                }
                Returns: string
            }
            foldername: {
                Args: {
                    name: string
                }
                Returns: unknown
            }
            get_size_by_bucket: {
                Args: Record<PropertyKey, never>
                Returns: {
                    size: number
                    bucket_id: string
                }[]
            }
            search: {
                Args: {
                    prefix: string
                    bucketname: string
                    limits?: number
                    levels?: number
                    offsets?: number
                    search?: string
                    sortcolumn?: string
                    sortorder?: string
                }
                Returns: {
                    name: string
                    id: string
                    updated_at: string
                    created_at: string
                    last_accessed_at: string
                    metadata: Json
                }[]
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
