"use client";

import React, { useEffect, useRef } from 'react';
import { createUniver, defaultTheme, LocaleType, merge } from '@univerjs/presets';
import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core';
import UniverPresetSheetsCoreEnUS from '@univerjs/presets/preset-sheets-core/locales/en-US';
import '@univerjs/presets/lib/styles/preset-sheets-core.css';
import { useFiles } from '../context/FileContext';

const debounce = (fn: Function, delay: number = 500) => {
  let t: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
};

interface SheetEditorProps {
  fileId: string;
}

export default function SheetEditor({ fileId }: SheetEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const univerRef = useRef<any>(null);
  const lastSnapRef = useRef<string | null>(null);
  const { files, updateFile } = useFiles();
  const updateFileRef = useRef(updateFile);

  useEffect(() => {
    updateFileRef.current = updateFile;
  }, [updateFile]);
  
  const file = files.find(f => f.id === fileId);

  useEffect(() => {
    if (!containerRef.current || !file || univerRef.current) return;

    const { univer, univerAPI } = createUniver({
      locale: LocaleType.EN_US,
      locales: { [LocaleType.EN_US]: merge({}, UniverPresetSheetsCoreEnUS) },
      theme: defaultTheme,
      presets: [
        UniverSheetsCorePreset({ container: containerRef.current }),
      ],
    });

    univerRef.current = { univer, univerAPI };

    try {
      if (file.content && Object.keys(file.content).length) {
        univerAPI.createWorkbook(file.content);
      } else {
        univerAPI.createWorkbook({ name: file.name || 'Sheet1' });
      }
    } catch (e) {
      console.error('createWorkbook failed', e);
      univerAPI.createWorkbook({ name: file.name || 'Sheet1' });
    }
    console.log('Opened sheet', fileId, 'with content:', file.content);

    const debouncedSave = debounce((snap: any) => {
      console.log('Saving snapshot for sheet', fileId, snap);
      updateFileRef.current(fileId, snap);
    }, 500);
    
    const grabSnapshot = () => {
      const wb = univerAPI.getActiveWorkbook?.();
      const snap = wb?.getSnapshot?.();
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
    // handler to insert Used by AI in A1
    const h = (e: any) => {
      if (e?.detail?.id !== fileId) return;
      try {
        const api = univerRef.current?.univerAPI;
        if (!api) return;
        const wb = api.getActiveWorkbook?.();
        const sheet = wb?.getActiveSheet?.();
        // Most univer sheet APIs support setValue(row,col,value)
        // fallback: getRange and setValue
        if (sheet?.setValue) {
          sheet.setValue(0, 0, 'Used by AI'); // row 0 col 0 is A1
        } else if (sheet?.getRange) {
          sheet.getRange('A1')?.setValue?.('Used by AI');
        }
      } catch (err) {
        console.error('Sheet appendText failed', err);
      }
    };
    window.addEventListener('insert-ai-flag', h);
    return () => window.removeEventListener('insert-ai-flag', h);
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
        id={`sheet-editor-${fileId}`}
        className="h-full w-full"
      />
    </div>
  );
} 