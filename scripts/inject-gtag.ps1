$gtag = @'
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18009079831"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'AW-18009079831');
  </script>
</head>
'@

$dir = Join-Path $PSScriptRoot ".." "public"
$files = Get-ChildItem $dir -Filter "*.html" | Where-Object { $_.Name -ne "googlea5a53438b491ad23.html" }

$count = 0
foreach ($f in $files) {
    $c = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
    if ($c.Contains("AW-18009079831")) { Write-Host "SKIP: $($f.Name)"; continue }
    if (-not $c.Contains("</head>")) { Write-Host "NO_HEAD: $($f.Name)"; continue }
    $new = $c.Replace("</head>", $gtag)
    [System.IO.File]::WriteAllText($f.FullName, $new, (New-Object System.Text.UTF8Encoding $false))
    Write-Host "OK: $($f.Name)"
    $count++
}
Write-Host "Done: $count files updated"
