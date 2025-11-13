#!/bin/bash
# Convert TypeScript files to JavaScript
# This script will be run to convert files

find . -type f \( -name "*.ts" -o -name "*.tsx" \) ! -path "*/node_modules/*" ! -path "*/.git/*" | while read file; do
  if [[ "$file" == *.tsx ]]; then
    newfile="${file%.tsx}.jsx"
  else
    newfile="${file%.ts}.js"
  fi
  
  # Remove TypeScript-specific syntax
  sed -E '
    # Remove type annotations from function parameters
    s/:\s*[A-Za-z0-9_|<>\[\]{}& ]+(\s*[,\)])/\1/g
    # Remove return type annotations
    s/:\s*[A-Za-z0-9_|<>\[\]{}& ]+(\s*\{)/\1/g
    # Remove interface declarations
    /^export\s+interface/d
    /^interface\s+\w+/,/^}/d
    # Remove type declarations
    /^export\s+type/d
    /^type\s+\w+/d
    # Remove generic type parameters
    s/<[^>]+>//g
    # Remove as any casts
    s/\s+as\s+any//g
    # Remove React.FC<...>
    s/: React\.FC<[^>]+>//g
    # Remove : any annotations
    s/:\s*any\s*//g
    # Remove extends clauses from interfaces
    s/\s+extends\s+[^{]+//g
  ' "$file" > "$newfile"
  
  echo "Converted $file to $newfile"
done
