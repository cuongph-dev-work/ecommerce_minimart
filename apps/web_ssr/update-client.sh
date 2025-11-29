#!/bin/bash

# Script to add 'use client' directive and fix Link props

COMPONENTS_DIR="apps/web_ssr/components"

echo "Adding 'use client' directives and fixing Link props..."

# Find all .tsx files that don't already have 'use client'
find "$COMPONENTS_DIR" -type f -name "*.tsx" | while read -r file; do
  # Check if file uses hooks or interactive features
  if grep -q -E "(useState|useEffect|useRouter|usePathname|onClick|onChange)" "$file"; then
    # Check if it doesn't already have 'use client'
    if ! grep -q "'use client'" "$file"; then
      echo "Adding 'use client' to: $file"
      # Add 'use client' at the top
      sed -i '' "1s/^/'use client';\n\n/" "$file"
    fi
  fi
  
  # Fix Link component props: to -> href
  if grep -q "to=" "$file"; then
    echo "Fixing Link props in: $file"
    sed -i '' 's/<Link to=/<Link href=/g' "$file"
  fi
done

echo "Done!"
