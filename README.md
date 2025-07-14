# Aira - Office Suite

A modern office suite built with Next.js, TypeScript, and Tailwind CSS. This application provides document and spreadsheet editing capabilities using UniverJS.

## Features

- **Document Editor**: Rich text editing with UniverJS document core
- **Spreadsheet Editor**: Full-featured spreadsheet editing with UniverJS sheets
- **File Management**: Create, open, and delete documents and spreadsheets
- **Tabbed Interface**: Work with multiple files simultaneously
- **Auto-save**: Automatic saving of document changes
- **Responsive Design**: Modern UI with Tailwind CSS

## Tech Stack

- **Next.js 15.3.5** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **UniverJS** - Office suite components
- **React Icons** - Icon library

## Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Run the development server:
```bash
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
aira/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── DocEditor.tsx
│   ├── DriveInterface.tsx
│   └── SheetEditor.tsx
├── context/
│   └── FileContext.tsx
└── package.json
```

## Usage

1. **Creating Files**: Click the "New" button to create a document or spreadsheet
2. **Opening Files**: Click on any file in the sidebar to open it
3. **Editing**: Use the full-featured editors for documents and spreadsheets
4. **Multiple Files**: Files open in tabs for easy switching
5. **Auto-save**: Changes are automatically saved every 2 seconds

## Development

- Built with Next.js App Router for modern React development
- TypeScript for type safety and better developer experience
- Tailwind CSS for consistent and responsive styling
- UniverJS for professional office suite functionality

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
