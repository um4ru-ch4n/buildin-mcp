// Block types supported by Buildin API
export const BLOCK_TYPES = [
  'paragraph', 'heading_1', 'heading_2', 'heading_3',
  'bulleted_list_item', 'numbered_list_item', 'to_do',
  'quote', 'toggle', 'code', 'image', 'file', 'bookmark',
  'embed', 'callout', 'equation', 'link_to_page',
  'template', 'synced_block', 'divider', 'column_list',
  'column', 'table', 'table_row', 'child_page', 'child_database',
] as const;

export type BlockType = typeof BLOCK_TYPES[number];

// Property types for databases
export const PROPERTY_TYPES = [
  'title', 'rich_text', 'number', 'select', 'multi_select',
  'date', 'people', 'files', 'checkbox', 'url', 'email',
  'phone_number', 'formula', 'relation', 'rollup',
  'created_time', 'created_by', 'last_edited_time', 'last_edited_by',
] as const;

export type PropertyType = typeof PROPERTY_TYPES[number];

// Rich text
export interface TextContent {
  content: string;
  link?: { url: string } | null;
}

export interface Annotations {
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  underline: boolean;
  code: boolean;
  color: string;
}

export interface RichTextItem {
  type: 'text' | 'mention' | 'equation';
  text?: TextContent;
  mention?: {
    type: 'user' | 'page' | 'date' | 'database';
    user?: { id: string };
    page?: { id: string };
    database?: { id: string };
    date?: { start: string; end?: string | null; time_zone?: string | null };
  };
  equation?: { expression: string };
  annotations?: Annotations;
  plain_text?: string;
  href?: string | null;
}

// Icon
export type Icon =
  | { type: 'emoji'; emoji: string }
  | { type: 'external'; external: { url: string } }
  | { type: 'file'; file: { url: string } };

// Cover
export type Cover =
  | { type: 'external'; external: { url: string } }
  | { type: 'file'; file: { url: string } };

// Parent
export type Parent =
  | { type: 'page_id'; page_id: string }
  | { type: 'database_id'; database_id: string }
  | { type: 'block_id'; block_id: string }
  | { type: 'space_id'; space_id: string }
  | { type: 'workspace' };

// User
export interface User {
  object: 'user';
  id: string;
  type?: 'person' | 'bot';
  name?: string;
  avatar_url?: string | null;
  person?: { email?: string };
}

// Block data (content varies by block type, using record for flexibility)
export interface BlockData {
  rich_text?: RichTextItem[];
  text_color?: string;
  background_color?: string;
  checked?: boolean;
  language?: string;
  url?: string;
  caption?: RichTextItem[];
  icon?: Icon;
  expression?: string;
  page_id?: string;
  table_width?: number;
  has_column_header?: boolean;
  has_row_header?: boolean;
  cells?: RichTextItem[][];
  title?: string;
  synced_from?: { block_id: string } | null;
  [key: string]: unknown;
}

// Block
export interface Block {
  object: 'block';
  id: string;
  parent: Parent;
  created_time: string;
  created_by: User;
  last_edited_time: string;
  last_edited_by: User;
  archived: boolean;
  has_children: boolean;
  type: BlockType;
  data: BlockData;
}

// Page property value
export interface PropertyValue {
  id?: string;
  type: PropertyType;
  title?: RichTextItem[];
  rich_text?: RichTextItem[];
  number?: number | null;
  select?: { id?: string; name: string; color?: string } | null;
  multi_select?: Array<{ id?: string; name: string; color?: string }>;
  date?: { start: string; end?: string | null; time_zone?: string | null } | null;
  people?: User[];
  files?: Array<{ name: string; type: 'external' | 'file'; external?: { url: string }; file?: { url: string } }>;
  checkbox?: boolean;
  url?: string | null;
  email?: string | null;
  phone_number?: string | null;
  formula?: unknown;
  relation?: Array<{ id: string }>;
  rollup?: unknown;
  created_time?: string;
  created_by?: User;
  last_edited_time?: string;
  last_edited_by?: User;
}

// Page
export interface Page {
  object: 'page';
  id: string;
  created_time: string;
  created_by: User;
  last_edited_time: string;
  last_edited_by: User;
  archived: boolean;
  properties: Record<string, PropertyValue>;
  parent: Parent;
  url: string;
  icon?: Icon | null;
  cover?: Cover | null;
}

// Database property schema
export interface DatabaseProperty {
  id?: string;
  name: string;
  type: PropertyType;
  title?: Record<string, never>;
  rich_text?: Record<string, never>;
  number?: { format?: string };
  select?: { options?: Array<{ id?: string; name: string; color?: string }> };
  multi_select?: { options?: Array<{ id?: string; name: string; color?: string }> };
  date?: Record<string, never>;
  people?: Record<string, never>;
  files?: Record<string, never>;
  checkbox?: Record<string, never>;
  url?: Record<string, never>;
  email?: Record<string, never>;
  phone_number?: Record<string, never>;
  formula?: { expression?: string; version?: number; refProps?: Record<string, string> };
  relation?: { database_id?: string; synced_property_id?: string };
  rollup?: { relation_property_id?: string; rollup_property_id?: string; function?: string };
  created_time?: Record<string, never>;
  created_by?: Record<string, never>;
  last_edited_time?: Record<string, never>;
  last_edited_by?: Record<string, never>;
}

// Database
export interface Database {
  object: 'database';
  id: string;
  created_time: string;
  created_by: User;
  last_edited_time: string;
  last_edited_by: User;
  title: RichTextItem[];
  icon?: Icon | null;
  cover?: Cover | null;
  properties: Record<string, DatabaseProperty>;
  parent: Parent;
  url: string;
  archived: boolean;
  is_inline: boolean;
}

// Paginated list response
export interface PaginatedList<T> {
  object: 'list';
  results: T[];
  next_cursor: string | null;
  has_more: boolean;
  type?: string;
}

// Error response
export interface ApiErrorResponse {
  object: 'error';
  status: number;
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
