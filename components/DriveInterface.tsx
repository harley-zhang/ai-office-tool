"use client";

import React, { useState } from 'react';
import { LuFileText, LuFileSpreadsheet } from 'react-icons/lu';
import { FaRegTrashAlt } from 'react-icons/fa';
import { GoPlus } from 'react-icons/go';
import { useFiles } from '../context/FileContext';
import DocEditor from './DocEditor';
import SheetEditor from './SheetEditor';

interface FileToDelete {
  id: string;
  name: string;
}

export default function DriveInterface() {
  const {
    files,
    openTabs,
    activeTab,
    createFile,
    deleteFile,
    openTab,
    closeTab,
    setActiveTab,
  } = useFiles();

  const [showNewFileDropdown, setShowNewFileDropdown] = useState<boolean>(false);
  const [showNameFileModal, setShowNameFileModal] = useState<boolean>(false);
  const [selectedFileType, setSelectedFileType] = useState<'doc' | 'sheet' | ''>('');
  const [newFileName, setNewFileName] = useState<string>('');
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<FileToDelete | null>(null);

  const handleNewFileType = (type: 'doc' | 'sheet') => {
    setSelectedFileType(type);
    setShowNewFileDropdown(false);
    setShowNameFileModal(true);
  };

  const handleCreateFile = () => {
    if (newFileName.trim() && selectedFileType) {
      createFile(newFileName.trim(), selectedFileType);
      setNewFileName('');
      setShowNameFileModal(false);
      setSelectedFileType('');
    }
  };

  const handleDeleteFile = (fileId: string) => {
    deleteFile(fileId);
    setDeleteConfirmModal(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCreateFile();
    }
  };

  const activeFile = files.find(f => f.id === activeTab);

  return (
    <div className="h-screen flex bg-gray-50 pr-96">
      {/* Sidebar */}
      <div className="w-48 bg-[#F8FAFD] flex flex-col px-1.5 py-4 border-r border-[#EEEEEC]">
        <div className="px-4">
          <h1 className="text-xl font-semibold text-gray-800">Aira</h1>
        </div>
        
        {/* Create button */}
        <div className="px-3 py-3">
          <div className="relative">
            <button
              onClick={() => setShowNewFileDropdown(!showNewFileDropdown)}
              className="flex items-center justify-center px-4 py-3 bg-white text-[#1F1F1F] rounded-xl hover:bg-gray-100 transition-colors shadow-sm cursor-pointer"
            >
              <GoPlus className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">New</span>
            </button>
            
            {showNewFileDropdown && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => handleNewFileType('doc')}
                  className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <LuFileText className="w-4 h-4 mr-3 text-blue-500" />
                  <span className="text-sm text-gray-700">Document</span>
                </button>
                <button
                  onClick={() => handleNewFileType('sheet')}
                  className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors border-t border-gray-100 cursor-pointer"
                >
                  <LuFileSpreadsheet className="w-4 h-4 mr-3 text-[#1DB044]" />
                  <span className="text-sm text-gray-700">Spreadsheet</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* File list */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-3 py-3">
            <h2 className="text-sm font-semibold text-[#92928F] mb-2">Files</h2>
            <div className="space-y-0.5">
              {files.map((file) => {
                const isActive = activeTab === file.id;
                const isOpen = openTabs.some(tab => tab.id === file.id);
                
                return (
                  <div
                    key={file.id}
                    className={`-mx-2 flex items-center justify-between px-2 py-1 rounded-lg group transition-colors ${
                      isActive ? 'bg-[#C2E7FE] rounded-full' : 'hover:bg-gray-100'
                    }`}
                  >
                    <div
                      className="flex items-center space-x-2 flex-1 cursor-pointer"
                      onClick={() => openTab(file.id)}
                    >
                      <div className="flex items-center space-x-2">
                        {file.type === 'doc' ? (
                          <LuFileText className="w-4 h-4 text-blue-500" />
                        ) : (
                          <LuFileSpreadsheet className="w-4 h-4 text-[#1DB044]" />
                        )}
                      </div>
                      <span className={`text-sm font-medium truncate max-w-[100px] ${isActive ? 'text-[#004A76]' : 'text-gray-700'}`}>{file.name}</span>
                    </div>
                    <button
                      onClick={() => setDeleteConfirmModal({ id: file.id, name: file.name })}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity p-1 cursor-pointer"
                    >
                      <FaRegTrashAlt className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Tab bar */}
        {openTabs.length > 0 && (
          <div className="bg-[#F8FAFD] border-b border-[#EEEEEC] flex items-center px-3">
            <div className="flex space-x-1 overflow-x-auto">
              {openTabs.map((tab) => (
                <div
                  key={tab.id}
                  className={`flex items-center space-x-2 px-3 py-2 border-b-2 cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-[#004A76] text-[#004A76]'
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.type === 'doc' ? (
                    <LuFileText className="w-3 h-3 text-blue-500" />
                  ) : (
                    <LuFileSpreadsheet className="w-3 h-3 text-[#1DB044]" />
                  )}
                  <span className="text-sm font-medium whitespace-nowrap">{tab.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                    className="text-gray-400 hover:text-gray-600 ml-2"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Editor area */}
        <div className="flex-1 overflow-hidden">
          {activeTab && activeFile ? (
            activeFile.type === 'doc' ? (
              <DocEditor fileId={activeTab} />
            ) : (
              <SheetEditor fileId={activeTab} />
            )
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <h2 className="text-xl font-medium mb-2">Welcome to Aira</h2>
                <p className="text-gray-400">Create a new document or spreadsheet to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Name File Modal */}
      {showNameFileModal && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Name your file</h3>
            <div className="flex items-center mb-4">
              {selectedFileType === 'doc' ? (
                <LuFileText className="w-5 h-5 mr-3 text-blue-500" />
              ) : (
                <LuFileSpreadsheet className="w-5 h-5 mr-3 text-[#1DB044]" />
              )}
              <span className="text-gray-600 capitalize">{selectedFileType === 'doc' ? 'Document' : 'Spreadsheet'}</span>
            </div>
            <input
              type="text"
              placeholder="Enter file name"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              onKeyPress={handleKeyPress}
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowNameFileModal(false);
                  setNewFileName('');
                  setSelectedFileType('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFile}
                disabled={!newFileName.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <div className="flex items-center mb-4">
              <FaRegTrashAlt className="w-5 h-5 mr-3 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-800">Delete File</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{deleteConfirmModal.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setDeleteConfirmModal(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteFile(deleteConfirmModal.id)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside handler for dropdown */}
      {showNewFileDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowNewFileDropdown(false)}
        />
      )}
    </div>
  );
} 