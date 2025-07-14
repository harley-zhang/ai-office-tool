"use client";

import React, { useEffect, useRef } from 'react';
import { createUniver, LocaleType, merge } from '@univerjs/presets';
import { UniverDocsCorePreset } from '@univerjs/preset-docs-core';
import UniverPresetDocsCoreEnUS from '@univerjs/preset-docs-core/locales/en-US';
import '@univerjs/preset-docs-core/lib/index.css';
import { useFiles } from '../context/FileContext';

const debounce = (fn: Function, delay: number = 500) => {
  let t: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
};

interface DocEditorProps {
  fileId: string;
}

export default function DocEditor({ fileId }: DocEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const univerRef = useRef<any>(null);
  const lastSnapRef = useRef<string | null>(null);
  const { files, updateFile } = useFiles();
  const updateFileRef = useRef(updateFile);

  // keep latest updateFile in ref
  useEffect(() => {
    updateFileRef.current = updateFile;
  }, [updateFile]);
  
  const file = files.find(f => f.id === fileId);

  // mount editor once when file becomes available
  useEffect(() => {
    if (!containerRef.current || !file || univerRef.current) return;

    const { univer, univerAPI } = createUniver({
      locale: LocaleType.EN_US,
      locales: { [LocaleType.EN_US]: merge({}, UniverPresetDocsCoreEnUS) },
      presets: [
        UniverDocsCorePreset({ container: containerRef.current }),
      ],
    });

    univerRef.current = { univer, univerAPI };

    try {
      if (file.content && Object.keys(file.content).length) {
        univerAPI.createUniverDoc(file.content);
      } else {
        univerAPI.createUniverDoc({});
      }
    } catch (e) {
      console.error('createUniverDoc failed', e);
      univerAPI.createUniverDoc({});
    }
    console.log('Opened file', fileId, 'with content:', file.content);

    const debouncedSave = debounce((snap: any) => {
      console.log('Saving snapshot for file', fileId, snap);
      updateFileRef.current(fileId, snap);
    }, 500);
    
    const grabSnapshot = () => {
      const doc = univerAPI.getActiveDocument?.();
      const snap = doc?.getSnapshot?.();
      if (!snap) return;
      const snapStr = JSON.stringify(snap);
      if (lastSnapRef.current === null) {
        lastSnapRef.current = snapStr;
        return;
      }
      if (snapStr !== lastSnapRef.current) {
        lastSnapRef.current = snapStr;
        debouncedSave(snap);
      }
    };
    
    const intervalId = setInterval(grabSnapshot, 2000);
 
    return () => {
      clearInterval(intervalId);
      if (lastSnapRef.current !== null) {
        grabSnapshot();
      }
      if (univerRef.current) {
        univerRef.current.univer.dispose();
        univerRef.current = null;
      }
    };
  }, [fileId, !!file]);

  useEffect(() => {
    // Listen for AI flag insertion request
    const handler = (e: any) => {
      if (!e?.detail || e.detail.id !== fileId) return;
      try {
        const api = univerRef.current?.univerAPI;
        if (!api) return;
        const doc = api.getActiveDocument?.();
        // Append text; Univer will handle model integrity
        doc?.appendText?.('\rUsed by AI');
      } catch (err) {
        console.error('appendText failed', err);
      }
    };
    window.addEventListener('insert-ai-flag', handler);
    return () => window.removeEventListener('insert-ai-flag', handler);
  }, [fileId]);

  useEffect(() => {
    return () => {
      if (univerRef.current) {
        univerRef.current.univer.dispose();
        univerRef.current = null;
      }
    };
  }, []);

  if (!file) {
    return <div className="flex items-center justify-center h-full text-gray-500">File not found</div>;
  }

  return (
    <div className="h-full w-full">
      <div
        ref={containerRef}
        id={`doc-editor-${fileId}`}
        className="h-full w-full"
      />
    </div>
  );
} 