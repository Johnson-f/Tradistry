import React, { useState } from 'react';

interface NotionBlockProps {
  block: {
    id: string;
    content: string;
  };
  onUpdate: (id: string, content: string) => void;
}

const NotionBlock: React.FC<NotionBlockProps> = ({ block, onUpdate }) => {
  const [content, setContent] = useState(block.content);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
    onUpdate(block.id, e.target.value);
  };

  return (
    <div className="notion-block px-2 py-1 hover:bg-gray-100 rounded transition-colors">
      <input
        value={content}
        onChange={handleChange}
        className="w-full border-none bg-transparent outline-none text-base"
        placeholder="Type '/' for commands"
      />
    </div>
  );
};

export default NotionBlock; 