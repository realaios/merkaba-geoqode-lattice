param([string]$File)
if (-not $File) { Write-Error "Usage: fix-emojibake.ps1 -File <path>"; exit 1 }
$path = $File
$c = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
$orig = $c

$c = $c.Replace('content: "??"', 'content: "🥽"')
$c = $c.Replace('?? Launch VR Theatre', '🥽 Launch VR Theatre')
$c = $c.Replace('?? Browse All Categories', '🔍 Browse All Categories')
$c = $c.Replace('?? Meta Quest Browser Detected', '🥽 Meta Quest Browser Detected')
$c = $c.Replace('?? Upcoming Events', '📅 Upcoming Events')
$c = $c.Replace('?? LIVE NOW', '🔴 LIVE NOW')
$c = $c.Replace('?? Enter in VR', '🥽 Enter in VR')
$c = $c.Replace('?? Live · Free to enter', '● Live · Free to enter')
$c = $c.Replace('??? Creator', '🛠️ Creator')
$c = $c.Replace('??? The Lounge', '🛋️ The Lounge')
$c = $c.Replace('??? Build on the AIOS VR Platform', '🛠️ Build on the AIOS VR Platform')
$c = $c.Replace('?? Cinema', '🎬 Cinema')
$c = $c.Replace('?? Enterprise', '🏢 Enterprise')
$c = $c.Replace('?? Lab', '🔬 Lab')
$c = $c.Replace('?? Arcade', '🎮 Arcade')
$c = $c.Replace('?? Wellness', '🧘 Wellness')
$c = $c.Replace('?? Social', '👥 Social')
$c = $c.Replace('?? Education', '📚 Education')
$c = $c.Replace('?? Art', '🎨 Art')
$c = $c.Replace('? Featured Experience', '★ Featured Experience')
$c = $c.Replace('All Programmes ?', 'All Programmes →')
$c = $c.Replace('Enterprise Plans ?', 'Enterprise Plans →')
$c = $c.Replace('AIOS Lab ?', 'AIOS Lab →')
$c = $c.Replace('Developer Portal ?', 'Developer Portal →')
$c = $c.Replace('>Open Lab ?<', '>Open Lab →<')
$c = $c.Replace('>Submit App ?<', '>Submit App →<')
$c = $c.Replace('AIOS SDK ?', 'AIOS SDK →')
$c = $c.Replace('Join Waitlist ?', 'Join Waitlist →')
$c = $c.Replace('? Coming Q3 2026', '⏳ Coming Q3 2026')
$c = $c.Replace('? Coming Q4 2026', '⏳ Coming Q4 2026')
$c = $c.Replace('? __VR_LIVE__ Live Now', '🔴 __VR_LIVE__ Live Now')
$c = $c.Replace('?? Developer Portal', '🔧 Developer Portal')
$c = $c.Replace('?????', '🎓')

if ($c -ne $orig) {
    [System.IO.File]::WriteAllText($path, $c, [System.Text.Encoding]::UTF8)
    Write-Host "Fixed: $path"
    $remaining = ($c | Select-String -Pattern '\?\?' -AllMatches).Matches.Count
    Write-Host "Remaining ?? count: $remaining"
}
else {
    Write-Host "No changes made to: $path"
}
