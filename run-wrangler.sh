#!/bin/bash

# Wrangler wrapper script - fixes cache permission issue
# by using a writable cache directory

export WRANGLER_HOME="$HOME/.wrangler"
export XDG_CACHE_HOME="$HOME/.cache"

# Run wrangler with all passed arguments
wrangler "$@"
