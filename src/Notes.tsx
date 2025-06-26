import React, { useState, useRef, useEffect } from 'react';
import { Plus, Type, List, Hash, Quote, Code, Trash2, GripVertical } from 'lucide-react';

const NotionNotesApp = () => {
  const [blocks, setBlocks] = useState([
    { id: '1', type: 'text', content: '', placeholder: "Type '/' for commands" },
    { id: '2', type: 'text', content: '', placeholder: "Type '/' for commands" }
  ]);

  const [showCommands, setShowCommands] = useState(false);
  const [commandPosition, setCommandPosition] = useState({ x: 0, y: 0 });
  const [activeBlockId, setActiveBlockId] = useState(null);

  const blockRefs = useRef({});

  const blockTypes = [
    { type: 'text', icon: Type, label: 'Text', placeholder: 'Start writing...' },
    { type: 'heading', icon: Hash, label: 'Heading', placeholder: 'Heading' },
    { type: 'list', icon: List, label: 'Bullet List', placeholder: 'List item' },
    { type: 'quote', icon: Quote, label: 'Quote', placeholder: 'Quote' },
    { type: 'code', icon: Code, label: 'Code', placeholder: 'Code snippet' }
  ];

  const addBlock = (afterId = null, type = 'text') => {
    const newBlock = {
      id: Date.now().toString(),
      type,
      content: '',
      placeholder: blockTypes.find(bt => bt.type === type)?.placeholder || 'Start writing...'
    };

    setBlocks(prevBlocks => {
      if (afterId) {
        const index = prevBlocks.findIndex(block => block.id === afterId);
        const newBlocks = [...prevBlocks];
        newBlocks.splice(index + 1, 0, newBlock);
        return newBlocks;
      }
      return [...prevBlocks, newBlock];
    });

    // Focus the new block after it's rendered
    setTimeout(() => {
      blockRefs.current[newBlock.id]?.focus();
    }, 50);
  };

  const updateBlock = (id, content) => {
    setBlocks(prevBlocks =>
      prevBlocks.map(block =>
        block.id === id ? { ...block, content } : block
      )
    );
  };

  const deleteBlock = (id) => {
    if (blocks.length <= 1) return;
    
    setBlocks(prevBlocks => prevBlocks.filter(block => block.id !== id));
  };

  const changeBlockType = (id, newType) => {
    const typeConfig = blockTypes.find(bt => bt.type === newType);
    setBlocks(prevBlocks =>
      prevBlocks.map(block =>
        block.id === id 
          ? { ...block, type: newType, placeholder: typeConfig?.placeholder || 'Start writing...' }
          : block
      )
    );
    setShowCommands(false);
  };

  const handleKeyDown = (e, blockId) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addBlock(blockId);
    } else if (e.key === 'Backspace') {
      const block = blocks.find(b => b.id === blockId);
      if (block && block.content === '' && blocks.length > 1) {
        e.preventDefault();
        deleteBlock(blockId);
        // Focus previous block
        const blockIndex = blocks.findIndex(b => b.id === blockId);
        const prevBlock = blocks[blockIndex - 1];
        if (prevBlock) {
          setTimeout(() => {
            blockRefs.current[prevBlock.id]?.focus();
          }, 50);
        }
      }
    } else if (e.key === '/') {
      const rect = e.target.getBoundingClientRect();
      setCommandPosition({ x: rect.left, y: rect.bottom + 5 });
      setActiveBlockId(blockId);
      setTimeout(() => setShowCommands(true), 100);
    } else if (e.key === 'Escape') {
      setShowCommands(false);
    }
  };

  const handleInput = (e, blockId) => {
    const content = e.target.value;
    updateBlock(blockId, content);
    
    if (!content.includes('/')) {
      setShowCommands(false);
    }
  };

  const getBlockComponent = (block) => {
    const baseClasses = "w-full bg-transparent border-none outline-none resize-none text-gray-200 leading-relaxed";
    
    switch (block.type) {
      case 'heading':
        return (
          <textarea
            ref={el => blockRefs.current[block.id] = el}
            className={`${baseClasses} text-2xl font-bold text-white`}
            placeholder={block.placeholder}
            value={block.content}
            onChange={(e) => handleInput(e, block.id)}
            onKeyDown={(e) => handleKeyDown(e, block.id)}
            rows={1}
            style={{ minHeight: '3rem' }}
          />
        );
      case 'quote':
        return (
          <div className="border-l-4 border-blue-500 pl-4">
            <textarea
              ref={el => blockRefs.current[block.id] = el}
              className={`${baseClasses} italic text-gray-300`}
              placeholder={block.placeholder}
              value={block.content}
              onChange={(e) => handleInput(e, block.id)}
              onKeyDown={(e) => handleKeyDown(e, block.id)}
              rows={1}
              style={{ minHeight: '2.5rem' }}
            />
          </div>
        );
      case 'code':
        return (
          <div className="bg-gray-800 rounded-lg p-4 font-mono">
            <textarea
              ref={el => blockRefs.current[block.id] = el}
              className="w-full bg-transparent border-none outline-none resize-none text-green-400 font-mono text-sm"
              placeholder={block.placeholder}
              value={block.content}
              onChange={(e) => handleInput(e, block.id)}
              onKeyDown={(e) => handleKeyDown(e, block.id)}
              rows={3}
            />
          </div>
        );
      case 'list':
        return (
          <div className="flex items-start gap-3">
            <span className="text-gray-400 mt-1">•</span>
            <textarea
              ref={el => blockRefs.current[block.id] = el}
              className={`${baseClasses} flex-1`}
              placeholder={block.placeholder}
              value={block.content}
              onChange={(e) => handleInput(e, block.id)}
              onKeyDown={(e) => handleKeyDown(e, block.id)}
              rows={1}
              style={{ minHeight: '2.5rem' }}
            />
          </div>
        );
      default:
        return (
          <textarea
            ref={el => blockRefs.current[block.id] = el}
            className={baseClasses}
            placeholder={block.placeholder}
            value={block.content}
            onChange={(e) => handleInput(e, block.id)}
            onKeyDown={(e) => handleKeyDown(e, block.id)}
            rows={1}
            style={{ minHeight: '2.5rem' }}
          />
        );
    }
  };

  // Click outside to close command menu
  useEffect(() => {
    const handleClickOutside = () => {
      setShowCommands(false);
    };

    if (showCommands) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showCommands]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <div className="max-w-4xl mx-auto px-8 py-16">
        {/* Header */}
        <div className="mb-16 animate-fade-in">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Notes
          </h1>
          <p className="text-xl text-gray-400">
            Your thoughts, organized beautifully
          </p>
        </div>

        {/* Blocks */}
        <div className="space-y-1">
          {blocks.map((block, index) => (
            <div
              key={block.id}
              className="group relative rounded-lg transition-all duration-200 hover:bg-gray-800/30"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Block controls */}
              <div className="absolute -left-12 top-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
                <button
                  onClick={() => addBlock(block.id)}
                  className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-gray-700 rounded transition-colors"
                  title="Add block"
                >
                  <Plus size={16} />
                </button>
                <button
                  className="p-1.5 text-gray-500 hover:text-gray-300 cursor-grab active:cursor-grabbing"
                  title="Drag to reorder"
                >
                  <GripVertical size={16} />
                </button>
              </div>

              {/* Block content */}
              <div className="px-4 py-3">
                {getBlockComponent(block)}
              </div>

              {/* Delete button */}
              {blocks.length > 1 && (
                <button
                  onClick={() => deleteBlock(block.id)}
                  className="absolute -right-10 top-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 text-gray-500 hover:text-red-400 hover:bg-gray-700 rounded"
                  title="Delete block"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add Block Button */}
        <button
          onClick={() => addBlock()}
          className="mt-8 flex items-center gap-2 px-4 py-3 text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 rounded-lg transition-all duration-200 group"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-200" />
          <span>Add a block</span>
        </button>

        {/* Command Menu */}
        {showCommands && (
          <div
            className="fixed z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl py-2 min-w-48 animate-slide-in"
            style={{ 
              left: commandPosition.x, 
              top: commandPosition.y,
              backdropFilter: 'blur(12px)',
              backgroundColor: 'rgba(31, 41, 55, 0.95)'
            }}
          >
            {blockTypes.map((blockType) => {
              const IconComponent = blockType.icon;
              return (
                <button
                  key={blockType.type}
                  onClick={() => changeBlockType(activeBlockId, blockType.type)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors duration-150 flex items-center gap-3 group"
                >
                  <IconComponent size={18} className="text-gray-400 group-hover:text-gray-200" />
                  <span className="text-gray-200 group-hover:text-white">
                    {blockType.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(-10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-slide-in {
          animation: slide-in 0.2s ease-out;
        }
        
        textarea {
          font-family: inherit;
        }
        
        textarea::placeholder {
          color: rgb(107, 114, 128);
        }
        
        /* Auto-resize textareas */
        textarea {
          overflow: hidden;
          resize: none;
        }
      `}</style>
    </div>
  );
};

export default NotionNotesApp;