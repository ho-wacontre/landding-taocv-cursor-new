#!/bin/bash

# ANSI Color Codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== GitHub Push Utility ===${NC}"

# Check for git installation
if ! command -v git &> /dev/null; then
    echo -e "${RED}Error: git is not installed or not in PATH.${NC}"
    echo -e "${YELLOW}Hint: Try running 'xcode-select --install' on your Mac.${NC}"
    exit 1
fi

# Initialize git if not already
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}Initializing git repository...${NC}"
    git init
fi

# Check for remote origin
REMOTE_URL=$(git remote get-url origin 2>/dev/null)
if [ -z "$REMOTE_URL" ]; then
    echo -e "${YELLOW}No remote 'origin' found.${NC}"
    read -p "Enter GitHub repository URL: " REPO_URL
    if [ ! -z "$REPO_URL" ]; then
        git remote add origin "$REPO_URL"
    else
        echo -e "${RED}Warning: No remote URL provided. Continuing locally only.${NC}"
    fi
fi

# Add all changes
echo -e "${BLUE}Adding changes...${NC}"
git add .

# Prompt for commit message
read -p "Enter commit message (default: 'Update'): " MSG
if [ -z "$MSG" ]; then
    MSG="Update"
fi

# Commit
echo -e "${BLUE}Committing changes...${NC}"
git commit -m "$MSG"

# Get current branch name
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Push to remote
if [ ! -z "$(git remote)" ]; then
    echo -e "${BLUE}Pushing to origin $BRANCH...${NC}"
    git push -u origin "$BRANCH"
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Successfully pushed to GitHub!${NC}"
    else
        echo -e "${RED}Push failed. Please check your network or repository permissions.${NC}"
    fi
else
    echo -e "${YELLOW}Commit done locally. Run 'git remote add origin <url>' to push later.${NC}"
fi
