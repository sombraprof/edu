# Scripts Directory

This directory contains development and deployment scripts organized by platform.

## Directory Structure

```
scripts/
├── linux/
│   ├── start_server_open_browser.sh    # Start dev server and open browser (Linux)
│   └── test_production.sh               # Build and test production locally (Linux)
└── windows/
    ├── start_server_open_browser.ps1   # Start dev server and open browser (Windows)
    └── test_production.ps1              # Build and test production locally (Windows)
```

## Usage

### Linux Scripts

```bash
# Start development server
./scripts/linux/start_server_open_browser.sh

# Test production build locally
./scripts/linux/test_production.sh
```

### Windows Scripts

```powershell
# Start development server
.\scripts\windows\start_server_open_browser.ps1

# Test production build locally
.\scripts\windows\test_production.ps1
```

## Script Descriptions

### Development Scripts (`start_server_open_browser.*`)
- Kill any processes using ports 5173-5180
- Start Vite development server on port 5173
- Automatically open browser to the application
- Use strict port configuration to avoid conflicts

### Production Test Scripts (`test_production.*`)
- Build the project for production
- Create symbolic link for base path handling
- Start local HTTP server on port 8080
- Open browser to test the production build
- Handle cleanup automatically

## Requirements

### Linux
- Bash shell
- Node.js and npm
- lsof (for port checking)
- Python 3 (for local server, fallback to npx http-server)

### Windows
- PowerShell
- Node.js and npm
- Python (optional, fallback to npx http-server)