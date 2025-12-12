# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QuickBridge is a Chrome extension for cross-device data transfer (text and files up to 20MB) with a Node.js backend. Built on the chrome-extension-boilerplate-react-vite template, it uses an address-based system where users generate/join addresses to share data without authentication.

## Development Commands

### Extension Development
```bash
# Install dependencies (uses pnpm workspaces)
pnpm install

# Development mode (Chrome)
pnpm dev

# Development mode (Firefox)
pnpm dev:firefox

# Production build
pnpm build
pnpm build:firefox

# Type checking across all packages
pnpm type-check

# Linting
pnpm lint
pnpm lint:fix

# Format code
pnpm format

# Package extension as zip
pnpm zip
pnpm zip:firefox

# End-to-end tests
pnpm e2e
pnpm e2e:firefox
```

### Backend Development
```bash
cd backend

# Development with hot reload
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Run tests
pnpm test
```

### Dependency Management
```bash
# Install root dependency
pnpm i <package> -w

# Install dependency for specific module
pnpm i <package> -F <module-name>
# Example: pnpm i axios -F sync-service
```

## Architecture

### Monorepo Structure

This is a Turborepo monorepo with three main areas:

1. **chrome-extension/** - Extension manifest and background scripts
2. **pages/** - Extension UI pages (popup, side-panel, content scripts, etc.)
3. **packages/** - Shared packages and utilities
4. **backend/** - Node.js API server (separate from extension)

### Key Architectural Patterns

**Extension Pages System**: Each page (popup, side-panel, options, etc.) is a separate Vite build target. The main QuickBridge UI lives in [pages/side-panel/](pages/side-panel/), which is the primary user interface.

**Sync Service Package**: [packages/sync-service/](packages/sync-service/) is the core abstraction layer that:
- Wraps backend API calls ([lib/api/](packages/sync-service/lib/api/))
- Manages Chrome storage ([lib/storage/sync-storage.ts](packages/sync-service/lib/storage/sync-storage.ts))
- Provides utilities (QR code generation, file handling)
- Exports TypeScript types for the entire extension

**Backend Architecture**: Express.js server with:
- Controllers in [backend/src/controllers/](backend/src/controllers/)
- Business logic in [backend/src/services/](backend/src/services/)
- Routes in [backend/src/routes/](backend/src/routes/)
- Redis for data storage (addresses, text, file metadata)
- Multer for file uploads to local filesystem

**Data Flow**: Side Panel → useSyncService hook → sync-service API client → Backend API → Redis/Filesystem

### Important Files

- [chrome-extension/manifest.ts](chrome-extension/manifest.ts) - Generates manifest.json, defines permissions and entry points
- [packages/sync-service/lib/index.ts](packages/sync-service/lib/index.ts) - Main export for sync service
- [pages/side-panel/src/SidePanel.tsx](pages/side-panel/src/SidePanel.tsx) - Main UI component
- [turbo.json](turbo.json) - Turborepo task pipeline configuration

## Environment Configuration

### Extension Environment (.env in root)
```bash
# Copy example and edit
cp .example.env .env
```

Key variables:
- `VITE_API_BASE_URL` - Backend API URL (default: http://localhost:3000/api/v1)
- `VITE_POLL_INTERVAL_MS` - Data sync polling interval (default: 3000ms)
- `VITE_MAX_FILE_SIZE` - Max file size in bytes (default: 20971520 = 20MB)

### Backend Environment (backend/.env)
```bash
cd backend
cp .env.example .env
```

Key variables:
- `PORT` - Server port (default: 3000)
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` - Redis connection
- `UPLOAD_DIR` - File upload directory (default: ./uploads)
- `MAX_FILE_SIZE` - Max file size in bytes
- `ADDRESS_TTL_HOURS` - Address expiration time (default: 24)

## Backend Setup

QuickBridge requires a running backend server and Redis:

```bash
# 1. Start Redis
brew services start redis  # macOS
# OR
docker run -d -p 6379:6379 redis:latest

# 2. Configure backend
cd backend
cp .env.example .env
# Edit .env as needed

# 3. Start backend
pnpm dev  # Development
# OR
pnpm build && pnpm start  # Production
```

Backend runs on http://localhost:3000 by default.

## Extension Loading

### Chrome
1. Run `pnpm dev`
2. Open chrome://extensions
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `dist` directory

### Firefox
1. Run `pnpm dev:firefox`
2. Open about:debugging#/runtime/this-firefox
3. Click "Load Temporary Add-on"
4. Select `dist/manifest.json`

## Module System

The boilerplate supports enabling/disabling extension pages:

```bash
pnpm module-manager
```

This allows you to disable unused pages (devtools, new-tab, etc.) to reduce bundle size.

## Custom Packages

- **@extension/sync-service** - QuickBridge sync logic (API client, storage, utilities)
- **@extension/storage** - Chrome storage helpers with type safety
- **@extension/shared** - Shared types, constants, hooks, components
- **@extension/i18n** - Internationalization with type-safe translations
- **@extension/hmr** - Hot module reload for development
- **@extension/ui** - Tailwind config merger and shared UI components
- **@extension/env** - Environment variable access

## Side Panel Development

The main UI is in [pages/side-panel/src/](pages/side-panel/src/):

- [SidePanel.tsx](pages/side-panel/src/SidePanel.tsx) - Root component
- [components/AddressManager.tsx](pages/side-panel/src/components/AddressManager.tsx) - Address creation/joining
- [components/QRCodeDisplay.tsx](pages/side-panel/src/components/QRCodeDisplay.tsx) - QR code generation
- [components/TextTransfer.tsx](pages/side-panel/src/components/TextTransfer.tsx) - Text input/display
- [components/FileUpload.tsx](pages/side-panel/src/components/FileUpload.tsx) - File upload UI
- [components/FileList.tsx](pages/side-panel/src/components/FileList.tsx) - File list and download
- [hooks/useSyncService.ts](pages/side-panel/src/hooks/useSyncService.ts) - Main sync logic hook
- [hooks/usePolling.ts](pages/side-panel/src/hooks/usePolling.ts) - Polling mechanism for data updates

## API Endpoints

All endpoints are prefixed with `/api/v1`:

**Address Management**
- `POST /address/random` - Generate random address
- `POST /address/custom` - Create custom address (5+ chars)
- `GET /address/:address/status` - Check if address exists

**Data Operations**
- `POST /data/:address/text` - Upload text
- `GET /data/:address/text` - Get text
- `POST /data/:address/file` - Upload file (multipart/form-data)
- `GET /data/:address/file/:id` - Download file
- `GET /data/:address/list` - List all data (text + files)
- `DELETE /data/:address` - Delete all data for address

## Troubleshooting

**HMR frozen**: Ctrl+C and restart `pnpm dev`. If you get a grpc error, kill the turbo process and retry.

**Imports not resolving (WSL)**: Install the "Remote - WSL" VS Code extension and connect to WSL remotely.

**Backend connection failed**: Ensure Redis is running and backend is started. Check `VITE_API_BASE_URL` in root .env matches backend URL.

**File upload fails**: Check `MAX_FILE_SIZE` in both backend/.env and root .env match. Ensure backend `UPLOAD_DIR` exists and is writable.

## Version Updates

To update the extension version across all packages:

```bash
pnpm update-version <version>
```

This updates package.json files and the manifest version.
