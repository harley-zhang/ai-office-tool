'use client';

import { useChat } from '@ai-sdk/react';
import { useFiles } from '../context/FileContext';
import React, { useState } from 'react';
import { LuFileText, LuFileSpreadsheet } from 'react-icons/lu';

export default function ChatSidebar() {
  const { files } = useFiles();
  const [contextIds, setContextIds] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [messageContexts, setMessageContexts] = useState<Record<string, string[]>>({});

  const { messages, input, setInput, handleInputChange, append } = useChat({ sendExtraMessageFields: true });

  const toggleFile = (id: string) => {
    setContextIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    setShowDropdown(false);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && contextIds.length === 0) return;

    const selectedFiles = files.filter(f => contextIds.includes(f.id));

    const tempId = `temp-${Date.now()}`;
    
    if (selectedFiles.length) {
      setMessageContexts(prev => ({ ...prev, [tempId]: contextIds }));
    }

    append(
      {
        role: 'user',
        content: input,
        data: { contextIds: contextIds, tempId: tempId },
      } as any,
      {
        body: { context: selectedFiles.map(({ id, name, content, type }) => ({ id, name, content, type })) },
      }
    );

    setInput('');
    // keep contextIds until user removes manually
    setShowDropdown(false);
  };

  return (
    <div className="fixed right-0 top-0 h-screen w-96 bg-[#F8FAFD] flex flex-col p-2 border-l border-[#EEEEEC]">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Chat</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`break-words text-sm p-3 ${
              message.role === 'user'
                ? 'bg-white border border-gray-100 rounded-xl'
                : ''
            }`}
          >
            {/* Context pills for this message if exists */}
            {(messageContexts[message.id] || messageContexts[(message.data as any)?.tempId])?.length && (
              <div className="flex items-center flex-wrap gap-1 mb-2">
                {(messageContexts[message.id] || messageContexts[(message.data as any)?.tempId]).map(cid => {
                  const f = files.find(fl => fl.id === cid);
                  if (!f) return null;
                  return (
                    <div key={cid} className="flex items-center space-x-1 h-6 bg-[#F8FAFD] border border-gray-100 rounded-md px-2 text-xs">
                      <div className="flex items-center w-3">
                        {f.type === 'doc' ? (
                          <LuFileText className="w-3 h-3 text-blue-500" />
                        ) : (
                          <LuFileSpreadsheet className="w-3 h-3 text-[#1DB044]" />
                        )}
                      </div>
                      <span className="max-w-[60px] truncate">{f.name}</span>
                    </div>
                  );
                })}
              </div>
            )}
            {message.parts.map((part, i) => {
              if (part.type === 'text') {
                return <span key={`${message.id}-${i}`}>{part.text}</span>;
              }
              return null;
            })}
          </div>
        ))}
      </div>

      {/* Input container */}
      <form onSubmit={onSubmit} className="mt-2">
        <div className="bg-white border border-gray-100 rounded-xl p-3 focus-within:ring-0 focus-within:border-transparent">
          {/* pills row inside input */}
          <div className="flex items-center flex-wrap gap-1 mb-2 relative">
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center justify-center w-6 h-6 text-xs bg-[#F8FAFD] border border-gray-100 rounded-md flex-shrink-0 cursor-pointer"
            >
              @
            </button>
            {contextIds.map(id => {
              const f = files.find(fl => fl.id === id);
              if (!f) return null;
              return (
                <div key={id} className="flex items-center space-x-1 h-6 bg-[#F8FAFD] border border-gray-100 rounded-md px-2 text-xs group cursor-pointer">
                  <div className="flex items-center w-3" onClick={() => toggleFile(id)}>
                    {f.type === 'doc' ? (
                      <LuFileText className="w-3 h-3 text-blue-500 group-hover:hidden" />
                    ) : (
                      <LuFileSpreadsheet className="w-3 h-3 text-[#1DB044] group-hover:hidden" />
                    )}
                    <button type="button" onClick={(e) => { e.stopPropagation(); toggleFile(id); }} className="hidden group-hover:block text-gray-400 hover:text-gray-600 text-xs cursor-pointer">×</button>
                  </div>
                  <span className="max-w-[60px] truncate">{f.name}</span>
                </div>
              );
            })}
            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute bottom-full left-0 mb-2 w-40 max-h-60 overflow-y-auto bg-white border border-gray-100 rounded-md shadow-sm z-20">
                {files.length === 0 && (
                  <div className="p-3 text-sm text-gray-500">No files</div>
                )}
                {files.map(file => (
                  <button
                    key={file.id}
                    onClick={() => toggleFile(file.id)}
                    className={`w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 text-xs cursor-pointer ${contextIds.includes(file.id) ? 'bg-gray-100' : ''}`}
                  >
                    {file.type === 'doc' ? (
                      <LuFileText className="w-3 h-3 mr-2 text-blue-500" />
                    ) : (
                      <LuFileSpreadsheet className="w-3 h-3 mr-2 text-[#1DB044]" />
                    )}
                    <span className="truncate">{file.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Say something..."
            className="w-full text-sm outline-none bg-transparent break-words"
          />
        </div>
      </form>
      {/* Global overlay to close @ dropdown */}
      {showDropdown && (
        <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
      )}
    </div>
  );
} 