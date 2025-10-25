'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, GripVertical, Trash2, Type, List, CheckSquare, Quote, Code, Minus } from 'lucide-react';
import { Block, BlockType, Page } from '@/lib/types';

export default function Home() {
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [blockMenuPosition, setBlockMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [pendingBlockPosition, setPendingBlockPosition] = useState<number | null>(null);

  useEffect(() => {
    loadPages();
  }, []);

  useEffect(() => {
    if (currentPage) {
      loadBlocks(currentPage.id);
    }
  }, [currentPage]);

  const loadPages = async () => {
    try {
      const response = await fetch('/api/pages');
      const data = await response.json();
      setPages(data);
      
      if (data.length === 0) {
        // Create first page
        await createNewPage();
      } else {
        setCurrentPage(data[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading pages:', error);
      setLoading(false);
    }
  };

  const loadBlocks = async (pageId: string) => {
    try {
      const response = await fetch(`/api/blocks?pageId=${pageId}`);
      const data = await response.json();
      setBlocks(data);
    } catch (error) {
      console.error('Error loading blocks:', error);
    }
  };

  const createNewPage = async () => {
    try {
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Untitled' })
      });
      const newPage = await response.json();
      setPages(prev => [newPage, ...prev]);
      setCurrentPage(newPage);
    } catch (error) {
      console.error('Error creating page:', error);
    }
  };

  const updatePageTitle = async (title: string) => {
    if (!currentPage) return;
    try {
      await fetch(`/api/pages/${currentPage.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      setCurrentPage({ ...currentPage, title });
      setPages(prev => prev.map(p => p.id === currentPage.id ? { ...p, title } : p));
    } catch (error) {
      console.error('Error updating page title:', error);
    }
  };

  const createBlock = async (type: BlockType, position: number) => {
    if (!currentPage) return;
    
    try {
      const response = await fetch('/api/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_id: currentPage.id,
          type,
          content: '',
          position,
          properties: type === 'checkbox' ? { checked: false } : {}
        })
      });
      const newBlock = await response.json();
      
      // Reorder blocks
      const updatedBlocks = [...blocks];
      updatedBlocks.splice(position, 0, newBlock);
      setBlocks(updatedBlocks.map((b, idx) => ({ ...b, position: idx })));
      
      // Update positions in database
      updatedBlocks.forEach(async (b, idx) => {
        if (b.position !== idx) {
          await fetch(`/api/blocks/${b.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ position: idx })
          });
        }
      });
    } catch (error) {
      console.error('Error creating block:', error);
    }
  };

  const updateBlock = async (id: string, updates: Partial<Block>) => {
    try {
      await fetch(`/api/blocks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    } catch (error) {
      console.error('Error updating block:', error);
    }
  };

  const deleteBlock = async (id: string) => {
    try {
      await fetch(`/api/blocks/${id}`, { method: 'DELETE' });
      setBlocks(prev => prev.filter(b => b.id !== id));
    } catch (error) {
      console.error('Error deleting block:', error);
    }
  };

  const handleAddBlock = (e: React.MouseEvent, position: number) => {
    e.preventDefault();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setBlockMenuPosition({ top: rect.bottom + window.scrollY, left: rect.left });
    setPendingBlockPosition(position);
    setShowBlockMenu(true);
  };

  const handleBlockTypeSelect = (type: BlockType) => {
    if (pendingBlockPosition !== null) {
      createBlock(type, pendingBlockPosition);
    }
    setShowBlockMenu(false);
    setPendingBlockPosition(null);
  };

  const blockTypes = [
    { type: 'paragraph' as BlockType, icon: <Type size={16} />, label: 'Text' },
    { type: 'heading1' as BlockType, icon: <Type size={16} />, label: 'Heading 1' },
    { type: 'heading2' as BlockType, icon: <Type size={16} />, label: 'Heading 2' },
    { type: 'heading3' as BlockType, icon: <Type size={16} />, label: 'Heading 3' },
    { type: 'bullet_list' as BlockType, icon: <List size={16} />, label: 'Bulleted List' },
    { type: 'numbered_list' as BlockType, icon: <List size={16} />, label: 'Numbered List' },
    { type: 'checkbox' as BlockType, icon: <CheckSquare size={16} />, label: 'Checkbox' },
    { type: 'quote' as BlockType, icon: <Quote size={16} />, label: 'Quote' },
    { type: 'code' as BlockType, icon: <Code size={16} />, label: 'Code' },
    { type: 'divider' as BlockType, icon: <Minus size={16} />, label: 'Divider' },
  ];

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <>
      <div className="sidebar">
        <div className="sidebar-title">Pages</div>
        <ul className="page-list">
          {pages.map(page => (
            <li
              key={page.id}
              className={`page-list-item ${currentPage?.id === page.id ? 'active' : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              📄 {page.title}
            </li>
          ))}
        </ul>
        <button className="new-page-btn" onClick={createNewPage}>
          <Plus size={16} /> New Page
        </button>
      </div>

      <div className="main-content">
        <div className="container">
          {currentPage && (
            <>
              <textarea
                className="page-title"
                value={currentPage.title}
                onChange={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                  updatePageTitle(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (blocks.length === 0) {
                      createBlock('paragraph', 0);
                    }
                  }
                }}
                rows={1}
              />

              {blocks.map((block, index) => (
                <BlockComponent
                  key={block.id}
                  block={block}
                  index={index}
                  updateBlock={updateBlock}
                  deleteBlock={deleteBlock}
                  onEnter={() => createBlock('paragraph', index + 1)}
                  totalBlocks={blocks.length}
                />
              ))}

              <button className="add-block-btn" onClick={(e) => handleAddBlock(e, blocks.length)}>
                <Plus size={16} /> Add a block
              </button>
            </>
          )}
        </div>
      </div>

      {showBlockMenu && blockMenuPosition && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999
            }}
            onClick={() => setShowBlockMenu(false)}
          />
          <div
            className="block-menu"
            style={{
              position: 'absolute',
              top: blockMenuPosition.top,
              left: blockMenuPosition.left,
            }}
          >
            {blockTypes.map(({ type, icon, label }) => (
              <div
                key={type}
                className="block-menu-item"
                onClick={() => handleBlockTypeSelect(type)}
              >
                <span className="block-menu-item-icon">{icon}</span>
                <span className="block-menu-item-label">{label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}

function BlockComponent({
  block,
  index,
  updateBlock,
  deleteBlock,
  onEnter,
  totalBlocks
}: {
  block: Block;
  index: number;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  deleteBlock: (id: string) => void;
  onEnter: () => void;
  totalBlocks: number;
}) {
  const inputRef = useRef<HTMLDivElement>(null);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.textContent || '';
    updateBlock(block.id, { content });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && block.type !== 'code') {
      e.preventDefault();
      onEnter();
    }
    if (e.key === 'Backspace' && !block.content && totalBlocks > 1) {
      e.preventDefault();
      deleteBlock(block.id);
    }
  };

  useEffect(() => {
    if (inputRef.current && !inputRef.current.textContent) {
      inputRef.current.textContent = block.content;
    }
  }, []);

  if (block.type === 'divider') {
    return (
      <div className="block-container">
        <div className="block-controls">
          <button className="block-control-btn" onClick={() => deleteBlock(block.id)}>
            <Trash2 size={16} />
          </button>
        </div>
        <hr className="block-divider" />
      </div>
    );
  }

  if (block.type === 'checkbox') {
    return (
      <div className={`block-container block-checkbox ${block.properties?.checked ? 'checked' : ''}`}>
        <div className="block-controls">
          <button className="block-control-btn">
            <GripVertical size={16} />
          </button>
          <button className="block-control-btn" onClick={() => deleteBlock(block.id)}>
            <Trash2 size={16} />
          </button>
        </div>
        <input
          type="checkbox"
          checked={block.properties?.checked || false}
          onChange={(e) => updateBlock(block.id, { properties: { checked: e.target.checked } })}
        />
        <div
          ref={inputRef}
          className="block-input"
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          data-placeholder="To-do"
        />
      </div>
    );
  }

  return (
    <div className={`block-container block-${block.type}`} data-number={index + 1}>
      <div className="block-controls">
        <button className="block-control-btn">
          <GripVertical size={16} />
        </button>
        <button className="block-control-btn" onClick={() => deleteBlock(block.id)}>
          <Trash2 size={16} />
        </button>
      </div>
      <div
        ref={inputRef}
        className="block-input"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder={`Type something...`}
      />
    </div>
  );
}
