$files = @(
  "d:\Chintu\HRIS\src\app\dashboard\attendance\page.js",
  "d:\Chintu\HRIS\src\app\dashboard\payslips\page.js",
  "d:\Chintu\HRIS\src\app\dashboard\payslips\[id]\page.js",
  "d:\Chintu\HRIS\src\app\dashboard\users\page.js",
  "d:\Chintu\HRIS\src\app\dashboard\users\new\page.js",
  "d:\Chintu\HRIS\src\app\dashboard\users\[id]\page.js",
  "d:\Chintu\HRIS\src\app\dashboard\employees\new\page.js",
  "d:\Chintu\HRIS\src\app\dashboard\employees\[id]\page.js"
)

$summary = @()

foreach ($file in $files) {
  if (!(Test-Path -LiteralPath $file)) { $summary += "$file - NOT FOUND"; continue }
  $content = Get-Content -LiteralPath $file -Raw
  $original = $content
  $count = 0

  $lines = $content -split "`n"
  $newLines = @()
  foreach ($line in $lines) {
    $originalLine = $line

    # Skip lines with gradient backgrounds
    if ($line -match 'linear-gradient') { $newLines += $line; continue }
    # Skip lines with the avatar colors array
    if ($line -match "const colors\s*=") { $newLines += $line; continue }
    # Skip status badge lines (Active/Inactive conditional with specific colors)
    if ($line -match "isActive\s*\?" -and ($line -match "#ef4444" -or $line -match "#10b981" -or $line -match "#ecfdf5" -or $line -match "#fef2f2" -or $line -match "#059669" -or $line -match "#dc2626")) { $newLines += $line; continue }
    # Skip leave-days semantic coloring
    if ($line -match "leaveDays\s*>" -and ($line -match "#fef2f2" -or $line -match "#ecfdf5" -or $line -match "#dc2626" -or $line -match "#059669" -or $line -match "#ef4444")) { $newLines += $line; continue }

    # background: 'white' or '#fff' or '#ffffff'
    $line = $line -replace "background:\s*'white'", "background: 'var(--bg-card)'"
    $line = $line -replace "background:\s*'#fff'", "background: 'var(--bg-card)'"
    $line = $line -replace "background:\s*'#ffffff'", "background: 'var(--bg-card)'"
    # e.target.style.background = '#fff'
    $line = $line -replace "\.background\s*=\s*'#fff'", ".background = 'var(--bg-card)'"
    # e.target.style.background = '#f5f6fa'
    $line = $line -replace "\.background\s*=\s*'#f5f6fa'", ".background = 'var(--bg-input)'"
    # e.target.style.borderColor handlers
    $line = $line -replace "\.borderColor\s*=\s*'#e8eaf0'", ".borderColor = 'var(--border-color)'"
    $line = $line -replace "\.borderColor\s*=\s*'#e0e3ed'", ".borderColor = 'var(--border-color)'"

    # Color replacements
    $line = $line -replace "#1a1d3b", "var(--text-primary)"
    $line = $line -replace "#6b7194", "var(--text-secondary)"
    $line = $line -replace "#374151", "var(--text-on-card)"
    $line = $line -replace "#9ca3af", "var(--text-muted)"
    $line = $line -replace "#c7c9d9", "var(--text-muted)"
    $line = $line -replace "#e8eaf0", "var(--border-color)"
    $line = $line -replace "#e0e3ed", "var(--border-color)"
    $line = $line -replace "#f0f1f5", "var(--border-light)"
    $line = $line -replace "#f8f9fc", "var(--bg-header)"
    $line = $line -replace "#f5f6fa", "var(--bg-input)"
    $line = $line -replace "#f0f0ff", "var(--bg-input)"
    $line = $line -replace "#6366f1", "var(--primary)"
    $line = $line -replace "#ef4444", "var(--danger)"

    # Remove hover:bg-gray-100 from table header elements
    if ($line -match "uppercase tracking-wider.*hover:bg-gray-100") {
      $line = $line -replace "hover:bg-gray-100\s*", ""
    }

    if ($line -ne $originalLine) { $count++ }
    $newLines += $line
  }

  $newContent = $newLines -join "`n"
  if ($newContent -ne $original) {
    Set-Content -LiteralPath $file -Value $newContent -NoNewline
    $summary += "$file - $count lines changed"
  } else {
    $summary += "$file - 0 changes"
  }
}

Write-Host ""
Write-Host "=== SUMMARY ==="
$summary | ForEach-Object { Write-Host $_ }
