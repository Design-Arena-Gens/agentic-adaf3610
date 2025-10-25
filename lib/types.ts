export interface Page {
  id: string;
  title: string;
  created_at: number;
  updated_at: number;
}

export interface Block {
  id: string;
  page_id: string;
  type: BlockType;
  content: string;
  position: number;
  properties?: Record<string, any>;
  created_at: number;
  updated_at: number;
}

export type BlockType = 
  | 'heading1' 
  | 'heading2' 
  | 'heading3' 
  | 'paragraph' 
  | 'bullet_list' 
  | 'numbered_list' 
  | 'checkbox' 
  | 'quote' 
  | 'code' 
  | 'divider';
