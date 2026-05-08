# Fix JS data emoji fields in vr-hub.html using context-aware regex
$path = "c:\Users\bradl\source\storm-ai\merkaba-geoqode-lattice\public\vr-hub.html"
$c = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
$orig = $c

# Code-point constructors to avoid encoding issues in this script file
function E([int]$cp) { [System.Char]::ConvertFromUtf32($cp) }
function EV([int]$cp) { [System.Char]::ConvertFromUtf32($cp) + [char]0xFE0F }

# emoji → title mappings using regex lookahead
$maps = @(
    # CINEMA_XP
    @{ pat = 'emoji: "\?\?\?",(\s+title: "The Matrix")'; rep = "emoji: `"$(E 0x1F3AC)`",`$1" },
    @{ pat = 'emoji: "\?\?\?",(\s+title: "Inception Dream Arch")'; rep = "emoji: `"$(E 0x1F300)`",`$1" },
    @{ pat = 'emoji: "\?\?",(\s+title: "Star Wars Galactic")'; rep = "emoji: `"$(E 0x1F31F)`",`$1" },
    @{ pat = 'emoji: "\?\?",(\s+title: "Apollo 11 Mission")'; rep = "emoji: `"$(E 0x1F680)`",`$1" },
    @{ pat = 'emoji: "\?\?",(\s+title: "Investor Deck",)'; rep = "emoji: `"$(E 0x1F4CA)`",`$1" },
    @{ pat = 'emoji: "\?\?",(\s+title: "Governance Council",)'; rep = "emoji: `"$(EV 0x2696)`",`$1" },
    @{ pat = 'emoji: "\?\?",(\s+title: "Training Simulator",)'; rep = "emoji: `"$(E 0x1F393)`",`$1" },
    @{ pat = 'emoji: "\?\?\?",(\s+title: "Remote HQ",)'; rep = "emoji: `"$(E 0x1F3E0)`",`$1" },
    # LAB_XP
    @{ pat = 'emoji: "\?\?",(\s+title: "AIOS",)'; rep = "emoji: `"$(E 0x1F52C)`",`$1" },
    @{ pat = 'emoji: "\?\?",(\s+title: "Particle Field Sim")'; rep = "emoji: `"$(EV 0x269B)`",`$1" },
    @{ pat = 'emoji: "\?\?",(\s+title: "Molecular Chemistry Lab")'; rep = "emoji: `"$(E 0x1F9EC)`",`$1" },
    @{ pat = 'emoji: "\?\?",(\s+title: "Solar System VR")'; rep = "emoji: `"$(E 0x1F30C)`",`$1" },
    @{ pat = 'emoji: "\?\?",(\s+title: "Fractal Space")'; rep = "emoji: `"$(E 0x267E)`",`$1" },
    @{ pat = 'emoji: "\?\?",(\s+title: "Spectrum Journey")'; rep = "emoji: `"$(E 0x1F308)`",`$1" },
    # ARCADE_LIVE
    @{ pat = 'emoji: "\?\?",(\s+title: "PHI Breaker")'; rep = "emoji: `"$(E 0x1F3AF)`",`$1" },
    @{ pat = 'emoji: "\?",(\s+title: "Lattice Dodge")'; rep = "emoji: `"$(E 0x1F579)`",`$1" },
    @{ pat = 'emoji: "\?\?",(\s+title: "Lattice Builder")'; rep = "emoji: `"$(E 0x1F3D7)`",`$1" },
    @{ pat = 'emoji: "\?",(\s+title: "Merkaba Ghosts")'; rep = "emoji: `"$(E 0x1F47B)`",`$1" },
    @{ pat = 'emoji: "\?\?\?",(\s+title: "PHI Architect")'; rep = "emoji: `"$(EV 0x1F3DB)`",`$1" },
    @{ pat = 'emoji: "\?\?",(\s+title: "Swarm Defender")'; rep = "emoji: `"$(E 0x1F6E1)`",`$1" },
    # ARCADE_TEASER single-line
    @{ pat = 'emoji: "\?\?", title: "AIOS Puzzle"'; rep = "emoji: `"$(E 0x1F9E9)`", title: `"AIOS Puzzle`"" },
    @{ pat = 'emoji: "\?\?", title: "Zero Gravity"'; rep = "emoji: `"$(E 0x1F30C)`", title: `"Zero Gravity`"" },
    @{ pat = 'emoji: "\?\?", title: "Drone Wars"'; rep = "emoji: `"$(E 0x1F916)`", title: `"Drone Wars`"" },
    @{ pat = 'emoji: "\?\?", title: "AIOS Build"'; rep = "emoji: `"$(E 0x1F3D7)`", title: `"AIOS Build`"" },
    @{ pat = 'emoji: "\?\?", title: "PHI Runner"'; rep = "emoji: `"$(E 0x1F3C3)`", title: `"PHI Runner`"" },
    # WELLNESS_XP
    @{ pat = 'emoji: "\?\?",(\s+title: "Star Meditate")'; rep = "emoji: `"$(EV 0x2B50)`",`$1" },
    @{ pat = 'emoji: "\?\?",(\s+title: "Forest Calm")'; rep = "emoji: `"$(E 0x1F33F)`",`$1" },
    @{ pat = 'emoji: "\?\?",(\s+title: "Breathwork Space")'; rep = "emoji: `"$(E 0x1F4A8)`",`$1" },
    @{ pat = 'emoji: "\?\?",(\s+title: "Ocean Presence")'; rep = "emoji: `"$(E 0x1F30A)`",`$1" },
    @{ pat = 'emoji: "\?\?",(\s+title: "Deep Cosmos")'; rep = "emoji: `"$(E 0x1F30C)`",`$1" },
    @{ pat = 'emoji: "\?\?\?",(\s+title: "Mountain Silence")'; rep = "emoji: `"$(EV 0x26F0)`",`$1" },
    # EDUCATION_XP
    @{ pat = "emoji: `"\?\?\?`",(`` `\s+``title: `"Ancient Rome)"; rep = "emoji: `"$(EV 0x1F3DB)`",`$1" },
    @{ pat = 'emoji: "\?\?",(\s+title: "Inside the Human Body")'; rep = "emoji: `"$(E 0x1F9EC)`",`$1" },
    @{ pat = 'emoji: "\?\?",(\s+title: "Mathematical Dimensions")'; rep = "emoji: `"$(E 0x1F4D0)`",`$1" },
    @{ pat = 'emoji: "\?\?\?",(\s+title: "Language Immersion")'; rep = "emoji: `"$(E 0x1F30D)`",`$1" },
    # ART_XP
    @{ pat = 'emoji: "\?\?",(\s+title: "Spatial Canvas")'; rep = "emoji: `"$(E 0x1F3A8)`",`$1" },
    @{ pat = 'emoji: "\?\?",(\s+title: "Frequency Composer")'; rep = "emoji: `"$(E 0x1F3B5)`",`$1" },
    @{ pat = 'emoji: "\?\?\?",(\s+title: "Infinite AI Gallery")'; rep = "emoji: `"$(EV 0x1F5BC)`",`$1" },
    @{ pat = 'emoji: "\?\?",(\s+title: "Generative Theatre")'; rep = "emoji: `"$(E 0x1F3AD)`",`$1" },
    # SOCIAL_XP
    @{ pat = 'emoji: "\?\?\?",(\s+title: "The Lounge",)'; rep = "emoji: `"$(EV 0x1F6CB)`",`$1" },
    @{ pat = 'emoji: "\?\?",(\s+title: "AIOS Live Events")'; rep = "emoji: `"$(E 0x1F4E1)`",`$1" },
    @{ pat = 'emoji: "\?\?",(\s+title: "Creator Studio")'; rep = "emoji: `"$(EV 0x1F6E0)`",`$1" },
    @{ pat = 'emoji: "\?\?\?",(\s+title: "AIOS Academy")'; rep = "emoji: `"$(E 0x1F393)`",`$1" }
)

foreach ($m in $maps) {
    try {
        $c = [regex]::Replace($c, $m.pat, $m.rep, [System.Text.RegularExpressions.RegexOptions]::Singleline)
    }
    catch {
        Write-Host "FAILED: $($m.pat) -> $_"
    }
}

# Template literal emojis (JS rendering code)
$share = E 0x1F517   # 🔗
$redC = E 0x1F534   # 🔴
$calC = E 0x1F4C5   # 📅
$pplC = E 0x1F465   # 👥
$gogC = E 0x1F97D   # 🥽
$arrowC = [char]0x2192 # →

$c = $c.Replace('btn.textContent = "?? Share"', "btn.textContent = `"$share Share`"")
$c = $c.Replace('"?? LIVE"', "`"$redC LIVE`"")
$c = $c.Replace('<span>?? ${dateStr}</span>', "<span>$calC `${dateStr}</span>")
$c = $c.Replace('<span>?? ${ev.maxAttendees', "<span>$pplC `${ev.maxAttendees")
$c = $c.Replace('class="event-enter-btn">?? ${ev.isLive ? "Join Now" : "View ?"}<',
    "class=`"event-enter-btn`">$gogC `${ev.isLive ? `"Join Now`" : `"View $arrowC`"}<")

# Remaining ent-icon for Remote HQ (single remaining after prior replacement)
$homeC = E 0x1F3E0   # 🏠
$testC = E 0x1F52C   # 🔬
$c = $c -replace '<div class="ent-icon">\?\?</div>(\s+<div class="ent-title">Remote HQ)', "<div class=`"ent-icon`">$homeC</div>`$1"
$c = $c -replace '<div class="ent-icon">\?\?</div>(\s+<div class="ent-title">QA)', "<div class=`"ent-icon`">$testC</div>`$1"

# Featured visual div ?? (single ? from earlier mis-replacement)
$c = $c -replace '(?s)(<div\s+class="featured-visual"[^>]*>)\s*\?\s*(</div>)', "`$1`n          $(E 0x1F3AC)`n        `$2"

if ($c -ne $orig) {
    [System.IO.File]::WriteAllText($path, $c, [System.Text.Encoding]::UTF8)
    Write-Host "FIXED"
}
$remaining = ($c | Select-String -Pattern '\?\?' -AllMatches).Matches.Count
Write-Host "Remaining ?? count: $remaining"
