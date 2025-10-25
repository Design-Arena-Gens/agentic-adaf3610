import path from 'path';
import fs from 'fs';
import { Page, Block } from './types';

const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const pagesPath = path.join(dbDir, 'pages.json');
const blocksPath = path.join(dbDir, 'blocks.json');

// Initialize JSON files if they don't exist
if (!fs.existsSync(pagesPath)) {
  fs.writeFileSync(pagesPath, '[]', 'utf-8');
}
if (!fs.existsSync(blocksPath)) {
  fs.writeFileSync(blocksPath, '[]', 'utf-8');
}

export class Database {
  private getPagesData(): Page[] {
    try {
      const data = fs.readFileSync(pagesPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private savePagesData(pages: Page[]) {
    fs.writeFileSync(pagesPath, JSON.stringify(pages, null, 2), 'utf-8');
  }

  private getBlocksData(): Block[] {
    try {
      const data = fs.readFileSync(blocksPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private saveBlocksData(blocks: Block[]) {
    fs.writeFileSync(blocksPath, JSON.stringify(blocks, null, 2), 'utf-8');
  }

  // Pages operations
  getAllPages(): Page[] {
    return this.getPagesData().sort((a, b) => b.updated_at - a.updated_at);
  }

  getPageById(id: string): Page | undefined {
    return this.getPagesData().find(p => p.id === id);
  }

  createPage(page: Page): Page {
    const pages = this.getPagesData();
    pages.push(page);
    this.savePagesData(pages);
    return page;
  }

  updatePage(id: string, updates: Partial<Page>): Page | undefined {
    const pages = this.getPagesData();
    const index = pages.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    
    pages[index] = { ...pages[index], ...updates };
    this.savePagesData(pages);
    return pages[index];
  }

  deletePage(id: string): boolean {
    const pages = this.getPagesData();
    const filtered = pages.filter(p => p.id !== id);
    if (filtered.length === pages.length) return false;
    
    this.savePagesData(filtered);
    // Also delete associated blocks
    const blocks = this.getBlocksData().filter(b => b.page_id !== id);
    this.saveBlocksData(blocks);
    return true;
  }

  // Blocks operations
  getBlocksByPageId(pageId: string): Block[] {
    return this.getBlocksData()
      .filter(b => b.page_id === pageId)
      .sort((a, b) => a.position - b.position);
  }

  getBlockById(id: string): Block | undefined {
    return this.getBlocksData().find(b => b.id === id);
  }

  createBlock(block: Block): Block {
    const blocks = this.getBlocksData();
    blocks.push(block);
    this.saveBlocksData(blocks);
    return block;
  }

  updateBlock(id: string, updates: Partial<Block>): Block | undefined {
    const blocks = this.getBlocksData();
    const index = blocks.findIndex(b => b.id === id);
    if (index === -1) return undefined;
    
    blocks[index] = { ...blocks[index], ...updates };
    this.saveBlocksData(blocks);
    return blocks[index];
  }

  deleteBlock(id: string): boolean {
    const blocks = this.getBlocksData();
    const filtered = blocks.filter(b => b.id !== id);
    if (filtered.length === blocks.length) return false;
    
    this.saveBlocksData(filtered);
    return true;
  }
}

const db = new Database();
export default db;
