Set-Location "c:\Users\bradl\source\storm-ai\merkaba-geoqode-lattice"

$utf8 = [System.Text.Encoding]::UTF8

# Build emoji strings from byte sequences to avoid PowerShell encoding issues
$arrow_right = $utf8.GetString([byte[]]@(0xE2, 0x86, 0x92))  # right arrow
$arrow_return = $utf8.GetString([byte[]]@(0xE2, 0x86, 0xA9)) # return arrow
$arrow_left  = $utf8.GetString([byte[]]@(0xE2, 0x86, 0x90))  # left arrow
$cross       = $utf8.GetString([byte[]]@(0xE2, 0x9C, 0x95))  # x cross
$check       = $utf8.GetString([byte[]]@(0xE2, 0x9C, 0x93))  # checkmark
$checkmark   = $utf8.GetString([byte[]]@(0xE2, 0x9C, 0x85))  # green check
$rocket      = $utf8.GetString([byte[]]@(0xF0, 0x9F, 0x9A, 0x80)) # rocket
$goggles     = $utf8.GetString([byte[]]@(0xF0, 0x9F, 0xA5, 0xBD)) # vr goggles
$gamepad     = $utf8.GetString([byte[]]@(0xF0, 0x9F, 0x8E, 0xAE)) # gamepad
$crystal     = $utf8.GetString([byte[]]@(0xF0, 0x9F, 0x94, 0xAE)) # crystal ball
$ghost       = $utf8.GetString([byte[]]@(0xF0, 0x9F, 0x91, 0xBB)) # ghost
$skull       = $utf8.GetString([byte[]]@(0xF0, 0x9F, 0x92, 0x80)) # skull
$cyclone     = $utf8.GetString([byte[]]@(0xF0, 0x9F, 0x8C, 0x80)) # cyclone
$outbox      = $utf8.GetString([byte[]]@(0xF0, 0x9F, 0x93, 0xA4)) # outbox
$hexagon     = $utf8.GetString([byte[]]@(0xE2, 0xAC, 0xA1))       # hexagon

# Common patterns
$launchFix_old = '">? LAUNCH GAME<'
$launchFix_new = '">' + $rocket + ' LAUNCH GAME<'
$backFix_old   = '"lobby-back">? Back to VR Hub'
$backFix_new   = '"lobby-back">' + $arrow_left + ' Back to VR Hub'
$exitFix_old   = '"exit-btn" onclick="exitGame()">? Exit'
$exitFix_new   = '"exit-btn" onclick="exitGame()">' + $cross + ' Exit'
$retryFix_old  = '"btn-retry" onclick="restartGame()">? Play Again'
$retryFix_new  = '"btn-retry" onclick="restartGame()">' + $arrow_return + ' Play Again'
$badgeFix_old  = 'lobby-badge">?? AIOS Arcade'
$badgeFix_new  = 'lobby-badge">' + $gamepad + $hexagon + ' AIOS Arcade'
$vrHubFix_old  = '"btn-back-go">? VR Hub'
$vrHubFix_new  = '"btn-back-go">' + $goggles + ' VR Hub'

foreach ($f in @("public\game-phi-breaker.html", "public\game-lattice-dodge.html", "public\game-lattice-builder.html")) {
    $c = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)
    $orig = $c
    $c = $c.Replace($launchFix_old, $launchFix_new)
    $c = $c.Replace($backFix_old, $backFix_new)
    $c = $c.Replace($exitFix_old, $exitFix_new)
    $c = $c.Replace($retryFix_old, $retryFix_new)
    $c = $c.Replace($badgeFix_old, $badgeFix_new)
    $c = $c.Replace($vrHubFix_old, $vrHubFix_new)
    if ($c -ne $orig) {
        [System.IO.File]::WriteAllText($f, $c, [System.Text.Encoding]::UTF8)
        Write-Host ('Fixed common: ' + (Split-Path $f -Leaf))
    } else {
        Write-Host ('No common change: ' + (Split-Path $f -Leaf))
    }
}

# phi-breaker extra fixes
$f = "public\game-phi-breaker.html"
$c = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)
$orig = $c
$c = $c.Replace('= "? Copied!"', ('= "' + $check + ' Copied!"'))
$c = $c.Replace('= "? Share My Score"', ('= "' + $outbox + ' Share My Score"'))
if ($c -ne $orig) { [System.IO.File]::WriteAllText($f, $c, [System.Text.Encoding]::UTF8); Write-Host ('Fixed extra: ' + (Split-Path $f -Leaf)) }

# lattice-builder extra fixes
$f = "public\game-lattice-builder.html"
$c = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)
$orig = $c
$c = $c.Replace('">3?8</', ('">3' + $arrow_right + '8</'))
$c = $c.Replace('>1 ? 2 ? 3<', ('>' + '1 ' + $arrow_right + ' 2 ' + $arrow_right + ' 3<'))
$c = $c.Replace('">? LATTICE RESTORED<', ('">'+$checkmark+' LATTICE RESTORED<'))
$c = $c.Replace('Next Round ?<', ('Next Round ' + $arrow_right + '<'))
if ($c -ne $orig) { [System.IO.File]::WriteAllText($f, $c, [System.Text.Encoding]::UTF8); Write-Host ('Fixed extra: ' + (Split-Path $f -Leaf)) }

# merkaba-ghosts extra fixes
$f = "public\game-merkaba-ghosts.html"
$c = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)
$orig = $c
$c = $c.Replace('ghost-badge">??', ('ghost-badge">' + $ghost + $cyclone))
$c = $c.Replace('">??? Enter the Lattice<', ('">'+$crystal+' Enter the Lattice<'))
$c = $c.Replace('gameover-icon">??', ('gameover-icon">' + $skull))
$c = $c.Replace('">? Re-enter Lattice', ('">'+$arrow_return+' Re-enter Lattice'))
$c = $c.Replace('">? Arcade<', ('">'+$gamepad+' Arcade<'))
if ($c -ne $orig) { [System.IO.File]::WriteAllText($f, $c, [System.Text.Encoding]::UTF8); Write-Host ('Fixed ghosts: ' + (Split-Path $f -Leaf)) }

# games.html fixes
$f = "public\games.html"
$c = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)
$orig = $c
$c = $c.Replace('btn-launch">? Play Now<', ('btn-launch">' + $rocket + ' Play Now<'))
$c = $c.Replace('">?? Games<', ('">'+$gamepad+' Games<'))
if ($c -ne $orig) { [System.IO.File]::WriteAllText($f, $c, [System.Text.Encoding]::UTF8); Write-Host ('Fixed: ' + (Split-Path $f -Leaf)) }

Write-Host 'All done.'
