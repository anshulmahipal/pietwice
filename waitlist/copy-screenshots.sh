#!/bin/bash

# Script to copy screenshots from parent directory to waitlist folder
# Run this from the waitlist directory: bash copy-screenshots.sh

echo "Copying screenshots to waitlist folder..."

# Create assets/screenshots directory if it doesn't exist
mkdir -p assets/screenshots

# Copy screenshots from parent directory
if [ -d "../assets/screenshots" ]; then
    cp ../assets/screenshots/*.png assets/screenshots/ 2>/dev/null
    echo "✓ Screenshots copied successfully!"
    echo "Found screenshots:"
    ls -1 assets/screenshots/
else
    echo "⚠ Warning: ../assets/screenshots directory not found"
    echo "Please ensure screenshots exist in the parent assets/screenshots folder"
fi

# HTML already uses local paths, no update needed
echo "✓ HTML configured to use local screenshot paths"

echo ""
echo "Done! Your screenshots are ready for Firebase hosting."
