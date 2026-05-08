# fix-all-emojibake.ps1 - v2
$public = "c:\Users\bradl\source\storm-ai\merkaba-geoqode-lattice\public"

$bakeMiddot = [string][char]0x00EF + [string][char]0x00BF + [string][char]0x00BD
$bakeEmdash = [string][char]0x00E2 + [string][char]0x20AC + [string][char]0x201D

$middot = [string][char]0x00B7
$emdash = [string][char]0x2014
$arrow = [string][char]0x2192
$checkmark = [string][char]0x2713
$play_btn = [string][char]0x25B6

$ghost = [System.Char]::ConvertFromUtf32(0x1F47B)
$goggles = [System.Char]::ConvertFromUtf32(0x1F97D)
$crystal = [System.Char]::ConvertFromUtf32(0x1F52E)
$share_out = [System.Char]::ConvertFromUtf32(0x1F4E4)
$ok = [System.Char]::ConvertFromUtf32(0x2705)
$calendar = [System.Char]::ConvertFromUtf32(0x1F4C5)
$red_dot = [System.Char]::ConvertFromUtf32(0x1F534)
$cart = [System.Char]::ConvertFromUtf32(0x1F6D2)
$game_ctrl = [System.Char]::ConvertFromUtf32(0x1F3AE)
$theatre = [System.Char]::ConvertFromUtf32(0x1F3AD)
$cinema = [System.Char]::ConvertFromUtf32(0x1F3AC)
$vhs = [System.Char]::ConvertFromUtf32(0x1F39E) + [System.Char]::ConvertFromUtf32(0xFE0F)
$book_blue = [System.Char]::ConvertFromUtf32(0x1F4D8)
$robot = [System.Char]::ConvertFromUtf32(0x1F916)
$codex_bk = [System.Char]::ConvertFromUtf32(0x1F4D6)
$chart_bar = [System.Char]::ConvertFromUtf32(0x1F4CA)
$plug = [System.Char]::ConvertFromUtf32(0x1F50C)
$wrench = [System.Char]::ConvertFromUtf32(0x1F527)
$art_emoji = [System.Char]::ConvertFromUtf32(0x1F3A8)
$pencil = [System.Char]::ConvertFromUtf32(0x270D) + [System.Char]::ConvertFromUtf32(0xFE0F)
$laptop = [System.Char]::ConvertFromUtf32(0x1F4BB)
$money_bag = [System.Char]::ConvertFromUtf32(0x1F4B0)
$lightning = [System.Char]::ConvertFromUtf32(0x26A1)
$brain = [System.Char]::ConvertFromUtf32(0x1F9E0)
$unlock = [System.Char]::ConvertFromUtf32(0x1F513)
$sprout = [System.Char]::ConvertFromUtf32(0x1F331)
$ice = [System.Char]::ConvertFromUtf32(0x1F9CA)
$trash = [System.Char]::ConvertFromUtf32(0x1F5D1) + [System.Char]::ConvertFromUtf32(0xFE0F)
$no_entry = [System.Char]::ConvertFromUtf32(0x1F6AB)
$lab_flask = [System.Char]::ConvertFromUtf32(0x1F52C)
$music_note = [System.Char]::ConvertFromUtf32(0x1F3BC)
$race_car = [System.Char]::ConvertFromUtf32(0x1F3CE) + [System.Char]::ConvertFromUtf32(0xFE0F)
$antenna = [System.Char]::ConvertFromUtf32(0x1F4E1)
$chess = [System.Char]::ConvertFromUtf32(0x265F) + [System.Char]::ConvertFromUtf32(0xFE0F)
$diamond = [System.Char]::ConvertFromUtf32(0x1F537)
$dash = [System.Char]::ConvertFromUtf32(0x1F4A8)
$cyclone = [System.Char]::ConvertFromUtf32(0x1F300)
$rocket = [System.Char]::ConvertFromUtf32(0x1F680)
$star = [System.Char]::ConvertFromUtf32(0x2B50)
$galaxy = [System.Char]::ConvertFromUtf32(0x1F30C)
$infinity = [System.Char]::ConvertFromUtf32(0x267E) + [System.Char]::ConvertFromUtf32(0xFE0F)

function Rf($content, $search, $replacement) {
    $idx = $content.IndexOf($search, [System.StringComparison]::Ordinal)
    if ($idx -ge 0) { return $content.Substring(0, $idx) + $replacement + $content.Substring($idx + $search.Length) }
    return $content
}
function Save($path, $orig, $c) {
    if ($c -ne $orig) {
        [System.IO.File]::WriteAllText($path, $c, [System.Text.Encoding]::UTF8)
        Write-Host "FIXED: $(Split-Path $path -Leaf)"
    }
    else { Write-Host "NO CHANGE: $(Split-Path $path -Leaf)" }
}

# 1. game-merkaba-ghosts.html
$p = "$public\game-merkaba-ghosts.html"
$o = [System.IO.File]::ReadAllText($p, [System.Text.Encoding]::UTF8); $c = $o
$c = $c.Replace("Merkaba Ghosts $bakeMiddot Agent VR | AIOS", "Merkaba Ghosts $middot Agent VR | AIOS")
$c = $c.Replace("Merkaba Ghosts $bakeMiddot Agent VR $bakeMiddot AIOS Arcade", "Merkaba Ghosts $middot Agent VR $middot AIOS Arcade")
$c = $c.Replace("AGENT VR $bakeMiddot AIOS ARCADE $bakeMiddot 8 AGENTS", "AGENT VR $middot AIOS ARCADE $middot 8 AGENTS")
$c = $c.Replace("No NPCs $bakeMiddot every ghost", "No NPCs $middot every ghost")
$c = $c.Replace("attune $bakeMiddot Mouse + WASD on desktop $bakeMiddot VR", "attune $middot Mouse + WASD on desktop $middot VR")
$c = $c.Replace("ghost-label-name"">$bakeMiddot</div>", 'ghost-label-name"></div>')
$c = $c.Replace("ghost-label-freq"">$bakeMiddot</div>", 'ghost-label-freq"></div>')
$c = $c.Replace("Round 1 $bakeMiddot 0 Attunements", "Round 1 $middot 0 Attunements")
$c = $c.Replace("minimal eyes $bakeMiddot subtle", "minimal eyes $middot subtle")
$c = $c.Replace("ATTUNED $bakeMiddot +", "ATTUNED $middot +")
$c = $c.Replace("Hz $bakeMiddot", "Hz $middot")
$c = $c.Replace("`${round} $bakeMiddot 8 GHOSTS AWAIT", "`${round} $middot 8 GHOSTS AWAIT")
$c = $c.Replace("`${round} $bakeMiddot `${totalAttunements}", "`${round} $middot `${totalAttunements}")
$c = $c.Replace(".sector} $bakeMiddot `${gh.agent.freq}", ".sector} $middot `${gh.agent.freq}")
$c = $c.Replace("8 GHOST AGENTS $bakeMiddot GAZE TO BEGIN", "8 GHOST AGENTS $middot GAZE TO BEGIN")
$c = $c.Replace("LATTICE RE-OPENED $bakeMiddot ATTUNE", "LATTICE RE-OPENED $middot ATTUNE")
$c = $c.Replace("No scores yet $bakeEmdash be the first!", "No scores yet $emdash be the first!")
$c = $c.Replace(">? Re-enter Lattice", ">$crystal Re-enter Lattice")
$c = $c.Replace(">? Share My Score", ">$share_out Share My Score")
$c = $c.Replace('"? Copied!"', "`"$ok Copied!`"")
$c = $c.Replace('"? Share My Score"', "`"$share_out Share My Score`"")
$c = Rf $c '`? ${agent.name} ATTUNED' "`$ghost `${agent.name} ATTUNED"
Save $p $o $c

# 2. games.html
$p = "$public\games.html"
$o = [System.IO.File]::ReadAllText($p, [System.Text.Encoding]::UTF8); $c = $o
$c = $c.Replace('>?? Quest Compatible<', ">$goggles Quest Compatible<")
$c = Rf $c '<div class="game-card-icon">??</div>' "<div class=`"game-card-icon`">$lightning</div>"
$c = $c.Replace('<div class="game-card-icon">?</div>', "<div class=`"game-card-icon`">$dash</div>")
$c = Rf $c '<div class="game-card-icon">??</div>' "<div class=`"game-card-icon`">$diamond</div>"
$c = Rf $c '<div class="game-card-icon">??</div>' "<div class=`"game-card-icon`">$ghost</div>"
$c = $c.Replace('<div class="game-card-icon">???</div>', "<div class=`"game-card-icon`">$race_car</div>")
$c = Rf $c '<div class="game-card-icon">??</div>' "<div class=`"game-card-icon`">$antenna</div>"
$c = Rf $c '<div class="game-card-icon">??</div>' "<div class=`"game-card-icon`">$chess</div>"
$c = $c.Replace('<div style="font-size: 1.5rem; margin-bottom: 0.5rem">??</div>', "<div style=`"font-size: 1.5rem; margin-bottom: 0.5rem`">$game_ctrl</div>")
$c = Rf $c '>? Play Now</a' ">$play_btn Play Now</a"
$c = Rf $c '>? Play Now</a' ">$play_btn Play Now</a"
$c = Rf $c '>? Play Now</a' ">$ghost Play Now</a"
$c = $c.Replace('>Browse Games in PLAIStore ?</a', ">Browse Games in PLAIStore $arrow</a")
Save $p $o $c

# 3. index.html
$p = "$public\index.html"
$o = [System.IO.File]::ReadAllText($p, [System.Text.Encoding]::UTF8); $c = $o
$c = $c.Replace('?? __GAME_COUNT__ games', "$game_ctrl __GAME_COUNT__ games")
$c = $c.Replace('?? __VR_LIVE__ VR worlds', "$goggles __VR_LIVE__ VR worlds")
$c = $c.Replace('?? live AI cinema', "$cinema live AI cinema")
$c = $c.Replace('?? Play Free Games ?', "$game_ctrl Play Free Games $arrow")
$c = $c.Replace('?? Enter VR Now', "$goggles Enter VR Now")
$c = $c.Replace('?? Watch Live', "$red_dot Watch Live")
$c = $c.Replace('??? PLAIStore', "$cart PLAIStore")
$c = $c.Replace('<span style="font-size: 2rem; flex-shrink: 0">??</span>', "<span style=`"font-size: 2rem; flex-shrink: 0`">$ghost</span>")
$c = Rf $c '<div style="font-size: 1.5rem; margin-bottom: 0.5rem">??</div>' "<div style=`"font-size: 1.5rem; margin-bottom: 0.5rem`">$game_ctrl</div>"
$c = Rf $c '<div style="font-size: 1.5rem; margin-bottom: 0.5rem">??</div>' "<div style=`"font-size: 1.5rem; margin-bottom: 0.5rem`">$goggles</div>"
$c = Rf $c '<div style="font-size: 1.5rem; margin-bottom: 0.5rem">??</div>' "<div style=`"font-size: 1.5rem; margin-bottom: 0.5rem`">$cinema</div>"
$c = $c.Replace('?? AIOSdream Theatre', "$theatre AIOSdream Theatre")
$c = $c.Replace('emoji: "??", url: "/theatre?f=matrix"', "emoji: `"$cinema`", url: `"/theatre?f=matrix`"")
$c = $c.Replace('emoji: "??", url: "/theatre?f=inception"', "emoji: `"$cyclone`", url: `"/theatre?f=inception`"")
$c = $c.Replace('emoji: "??", url: "/theatre?f=apollo"', "emoji: `"$rocket`", url: `"/theatre?f=apollo`"")
$c = $c.Replace('emoji: "?", url: "/theatre?f=hyperspace"', "emoji: `"$star`", url: `"/theatre?f=hyperspace`"")
$c = $c.Replace('emoji: "??", url: "/theatre?f=nebula"', "emoji: `"$galaxy`", url: `"/theatre?f=nebula`"")
$c = $c.Replace('emoji: "??", url: "/theatre?f=neural"', "emoji: `"$lightning`", url: `"/theatre?f=neural`"")
$c = $c.Replace('p.emoji || "??"', "p.emoji || `"$cinema`"")
$c = $c.Replace('Theatre: { icon: "??",', "Theatre: { icon: `"$theatre`",")
$c = $c.Replace('Cinema: { icon: "??",', "Cinema: { icon: `"$cinema`",")
$c = $c.Replace('Playbooks: { icon: "??",', "Playbooks: { icon: `"$book_blue`",")
$c = $c.Replace('Agents: { icon: "??",', "Agents: { icon: `"$robot`",")
$c = $c.Replace('Codex: { icon: "??",', "Codex: { icon: `"$codex_bk`",")
$c = $c.Replace('Analytics: { icon: "??",', "Analytics: { icon: `"$chart_bar`",")
$c = $c.Replace('Integrations: { icon: "??",', "Integrations: { icon: `"$plug`",")
$c = $c.Replace('Utilities: { icon: "??",', "Utilities: { icon: `"$wrench`",")
$c = $c.Replace('Games: { icon: "??",', "Games: { icon: `"$game_ctrl`",")
$c = $c.Replace('VR: { icon: "??",', "VR: { icon: `"$goggles`",")
$c = $c.Replace('Design: { icon: "??",', "Design: { icon: `"$art_emoji`",")
$c = $c.Replace('Writing: { icon: "??",', "Writing: { icon: `"$pencil`",")
$c = $c.Replace('Developer: { icon: "???",', "Developer: { icon: `"$laptop`",")
$c = $c.Replace('Finance: { icon: "??",', "Finance: { icon: `"$money_bag`",")
$c = $c.Replace('>?? Cinema</a', ">$cinema Cinema</a")
$c = $c.Replace('>?? Enterprise</a', '>🏢 Enterprise</a')
$c = $c.Replace('>?? Lab</a', ">$lab_flask Lab</a")
$c = $c.Replace('>?? Arcade</a', ">$game_ctrl Arcade</a")
$c = $c.Replace('>?? Wellness</a', '>🧘 Wellness</a')
$c = $c.Replace('>?? Social</a', '>👥 Social</a')
$c = $c.Replace('>?? Creator</a', '>🛠️ Creator</a')
$c = $c.Replace('>?? Education</a', '>📚 Education</a')
$c = $c.Replace('>?? Art &amp; Music</a', ">$art_emoji Art &amp; Music</a")
$c = Rf $c '<div style="font-size: 2rem; margin-bottom: 0.8rem">??</div>' "<div style=`"font-size: 2rem; margin-bottom: 0.8rem`">$theatre</div>"
$c = Rf $c '<div style="font-size: 2rem; margin-bottom: 0.8rem">??</div>' "<div style=`"font-size: 2rem; margin-bottom: 0.8rem`">$lab_flask</div>"
$c = $c.Replace('<div style="font-size: 2rem; margin-bottom: 0.8rem">???</div>', "<div style=`"font-size: 2rem; margin-bottom: 0.8rem`">$calendar</div>")
$c = $c.Replace('>Enter Theatre ?</a', ">Enter Theatre $arrow</a")
$c = $c.Replace('>Open Lab ?</a', ">Open Lab $arrow</a")
$c = $c.Replace('>??? Browse PLAIStore ?</a', ">$cart Browse PLAIStore $arrow</a")
$c = $c.Replace('?? Explore VR Hub', "$goggles Explore VR Hub")
Save $p $o $c

# 4. geo-codec.html
$p = "$public\geo-codec.html"
$o = [System.IO.File]::ReadAllText($p, [System.Text.Encoding]::UTF8); $c = $o
$c = Rf $c '<span class="prob-icon">??</span>' "<span class=`"prob-icon`">$ice</span>"
$c = Rf $c '<span class="prob-icon">??</span>' "<span class=`"prob-icon`">$trash</span>"
$c = Rf $c '<span class="prob-icon">??</span>' "<span class=`"prob-icon`">$no_entry</span>"
$c = Rf $c '<span class="pillar-icon">??</span>' "<span class=`"pillar-icon`">$infinity</span>"
$c = Rf $c '<span class="pillar-icon">??</span>' "<span class=`"pillar-icon`">$brain</span>"
$c = Rf $c '<span class="pillar-icon">??</span>' "<span class=`"pillar-icon`">$lightning</span>"
$c = Rf $c '<span class="pillar-icon">??</span>' "<span class=`"pillar-icon`">$unlock</span>"
$c = Rf $c '<span class="pillar-icon">??</span>' "<span class=`"pillar-icon`">$sprout</span>"
$c = Rf $c '<div style="font-size: 2rem; margin-bottom: 0.8rem">??</div>' "<div style=`"font-size: 2rem; margin-bottom: 0.8rem`">$music_note</div>"
$c = Rf $c '<div style="font-size: 2rem; margin-bottom: 0.8rem">??</div>' "<div style=`"font-size: 2rem; margin-bottom: 0.8rem`">$vhs</div>"
$c = $c.Replace(">? 14 KB", ">$checkmark 14 KB")
$c = $c.Replace(">? 8 resolution", ">$checkmark 8 resolution")
$c = $c.Replace(">? AI-adaptive", ">$checkmark AI-adaptive")
$c = $c.Replace(">? Patent-free", ">$checkmark Patent-free")
Save $p $o $c

# 5. live.html
$p = "$public\live.html"
$o = [System.IO.File]::ReadAllText($p, [System.Text.Encoding]::UTF8); $c = $o
$c = $c.Replace(">?? Today's Schedule<", ">$calendar Today's Schedule<")
Save $p $o $c

Write-Host ""
Write-Host "=== VERIFICATION ==="
foreach ($f in @("game-merkaba-ghosts.html", "games.html", "index.html", "geo-codec.html", "live.html")) {
    $c2 = [System.IO.File]::ReadAllText("$public\$f", [System.Text.Encoding]::UTF8)
    $bm = [regex]::Matches($c2, [regex]::Escape($bakeMiddot)).Count
    $be = [regex]::Matches($c2, [regex]::Escape($bakeEmdash)).Count
    Write-Host "$f : bake=$bm, emdash=$be"
}
