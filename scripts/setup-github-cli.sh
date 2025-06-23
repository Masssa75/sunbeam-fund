#!/bin/bash

echo "🔧 GitHub CLI Setup Script"
echo "========================="
echo ""

# Check if gh is installed
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI is already installed"
    gh --version
else
    echo "❌ GitHub CLI not found. Installing..."
    
    # Check OS and install accordingly
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            echo "Installing via Homebrew..."
            brew install gh
        else
            echo "Homebrew not found. Please install from: https://brew.sh"
            echo "Then run: brew install gh"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        echo "For Linux, run:"
        echo "  curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo gpg --dearmor -o /usr/share/keyrings/githubcli-archive-keyring.gpg"
        echo "  echo 'deb [signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main' | sudo tee /etc/apt/sources.list.d/github-cli.list"
        echo "  sudo apt update && sudo apt install gh"
        exit 1
    fi
fi

echo ""
echo "📝 Next Steps:"
echo "============="
echo ""

# Check if authenticated
if gh auth status &> /dev/null; then
    echo "✅ Already authenticated with GitHub"
    echo ""
    echo "You can now run:"
    echo "  gh repo create sunbeam-fund --public --source . --push"
else
    echo "❌ Not authenticated. To authenticate:"
    echo ""
    echo "1. Run: gh auth login"
    echo "2. Choose:"
    echo "   - GitHub.com"
    echo "   - HTTPS"
    echo "   - Login with a web browser (easiest)"
    echo ""
    echo "After authentication, I can create repos with:"
    echo "  gh repo create sunbeam-fund --public --source . --push"
fi

echo ""
echo "🤖 For Claude to use gh autonomously:"
echo "====================================="
echo "The 'gh' command needs to be in PATH and authenticated."
echo "Once set up, I can create, manage, and deploy repos automatically!"