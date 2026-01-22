#!/bin/bash
# Wrapper script to run commands with Node 20

# Unset npm_config_prefix if set
unset npm_config_prefix

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use Node 20
nvm use 20 > /dev/null 2>&1

# Run the command passed as arguments
exec "$@"
