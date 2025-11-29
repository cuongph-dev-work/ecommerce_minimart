#!/bin/bash

# Script to update React Router imports to Next.js equivalents in all components

COMPONENTS_DIR="apps/web_ssr/components"

echo "Updating React Router imports to Next.js..."

# Find all .tsx and .ts files in components directory
find "$COMPONENTS_DIR" -type f \( -name "*.tsx" -o -name "*.ts" \) | while read -r file; do
  # Check if file contains React Router imports
  if grep -q "from 'react-router-dom'" "$file"; then
    echo "Processing: $file"
    
    # Replace imports
    sed -i '' "s/import { Link } from 'react-router-dom'/import Link from 'next\/link'/g" "$file"
    sed -i '' "s/import { Link, /import Link from 'next\/link';\nimport { /g" "$file"
    sed -i '' "s/import { useNavigate } from 'react-router-dom'/import { useRouter } from 'next\/navigation'/g" "$file"
    sed -i '' "s/import { useLocation } from 'react-router-dom'/import { usePathname } from 'next\/navigation'/g" "$file"
    sed -i '' "s/import { useNavigate, useLocation } from 'react-router-dom'/import { useRouter, usePathname } from 'next\/navigation'/g" "$file"
    
    # Replace usage
    sed -i '' "s/const navigate = useNavigate()/const router = useRouter()/g" "$file"
    sed -i '' "s/const location = useLocation()/const pathname = usePathname()/g" "$file"
    sed -i '' "s/navigate(/router.push(/g" "$file"
    sed -i '' "s/location\.pathname/pathname/g" "$file"
    
    # Replace Link component usage (to prop instead of href)
    # This is more complex and might need manual review
    
    echo "Updated: $file"
  fi
done

echo "Done!"
