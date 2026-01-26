# MCP GitHub Integration Setup

This project is configured to use the Model Context Protocol (MCP) for GitHub issues integration with Cursor IDE.

## Setup Instructions

### 1. Create a GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "Cursor MCP Integration")
4. Select the following scopes:
   - `repo` - Full control of private repositories (includes issues, pull requests, etc.)
5. Click "Generate token"
6. Copy the token immediately (you won't be able to see it again)

### 2. Set the Environment Variable

#### macOS/Linux:
Add to your `~/.zshrc` or `~/.bashrc`:
```bash
export GITHUB_PERSONAL_ACCESS_TOKEN="your_token_here"
```

Then reload your shell:
```bash
source ~/.zshrc  # or source ~/.bashrc
```

#### Windows:
Add as a system environment variable:
1. System Properties → Environment Variables
2. Add new variable: `GITHUB_PERSONAL_ACCESS_TOKEN` with your token value

### 3. Restart Cursor IDE

After setting the environment variable, restart Cursor IDE for the changes to take effect.

## Available Features

Once configured, you can use the following GitHub operations directly from Cursor:

- **Issue Management**: Create, update, close, reopen, comment on issues
- **Issue Search**: Search and list issues across repositories
- **Labels & Assignments**: Add/remove labels and assign issues
- **Repository Operations**: Create repos, search code, manage repositories

## Configuration File

The MCP configuration is located at `.cursor/mcp.json`. This file uses the GitHub MCP server via NPX, which will automatically download and run the latest version when needed.

## Troubleshooting

- **Token not working**: Ensure your token has the `repo` scope
- **MCP server not connecting**: Restart Cursor IDE after setting the environment variable
- **Permission errors**: Verify your token has access to the repository you're working with
