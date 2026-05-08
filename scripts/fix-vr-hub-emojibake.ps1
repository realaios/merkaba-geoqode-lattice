# Fix emojibake in vr-hub.html using code point escape sequences
$path = "c:\Users\bradl\source\storm-ai\merkaba-geoqode-lattice\public\vr-hub.html"
$c = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
$orig = $c

# Build emoji strings from code points to avoid encoding issues in this script file
$goggles = [System.Char]::ConvertFromUtf32(0x1F97D)       # 🥽
$cinema = [System.Char]::ConvertFromUtf32(0x1F3AC)       # 🎬
$enterprise = [System.Char]::ConvertFromUtf32(0x1F3E2)     # 🏢
$lab = [System.Char]::ConvertFromUtf32(0x1F52C)       # 🔬
$arcade = [System.Char]::ConvertFromUtf32(0x1F3AE)       # 🎮
$wellness = [System.Char]::ConvertFromUtf32(0x1F9D8)       # 🧘
$social = [System.Char]::ConvertFromUtf32(0x1F465)       # 👥
$tools = [System.Char]::ConvertFromUtf32(0x1F6E0) + [System.Char]::ConvertFromUtf32(0xFE0F)  # 🛠️
$education = [System.Char]::ConvertFromUtf32(0x1F4DA)      # 📚
$art = [System.Char]::ConvertFromUtf32(0x1F3A8)       # 🎨
$calendar = [System.Char]::ConvertFromUtf32(0x1F4C5)       # 📅
$search = [System.Char]::ConvertFromUtf32(0x1F50D)       # 🔍
$red = [System.Char]::ConvertFromUtf32(0x1F534)       # 🔴
$sofa = [System.Char]::ConvertFromUtf32(0x1F6CB) + [System.Char]::ConvertFromUtf32(0xFE0F)  # 🛋️
$wrench = [System.Char]::ConvertFromUtf32(0x1F527)       # 🔧
$timer = [System.Char]::ConvertFromUtf32(0x23F3)        # ⏳
$grad = [System.Char]::ConvertFromUtf32(0x1F393)       # 🎓
$rocket = [System.Char]::ConvertFromUtf32(0x1F680)       # 🚀
$chart = [System.Char]::ConvertFromUtf32(0x1F4CA)       # 📊
$scales = [System.Char]::ConvertFromUtf32(0x2696) + [System.Char]::ConvertFromUtf32(0xFE0F)  # ⚖️
$star = [char]0x2605                                   # ★
$arrow = [char]0x2192                                   # →

$c = $c.Replace('content: "??"', "content: `"$goggles`"")
$c = $c.Replace('?? Launch VR Theatre', "$goggles Launch VR Theatre")
$c = $c.Replace('?? Browse All Categories', "$search Browse All Categories")
$c = $c.Replace('?? Meta Quest Browser Detected', "$goggles Meta Quest Browser Detected")
$c = $c.Replace('?? Upcoming Events', "$calendar Upcoming Events")
$c = $c.Replace('?? LIVE NOW', "$red LIVE NOW")
$c = $c.Replace('?? Enter in VR', "$goggles Enter in VR")
$c = $c.Replace('?? Live' + " " + [char]0x00B7 + ' Free to enter', "$([char]0x25CF) Live $([char]0x00B7) Free to enter")
$c = $c.Replace('??? Creator', "$tools Creator")
$c = $c.Replace('??? The Lounge', "$sofa The Lounge")
$c = $c.Replace('??? Build on the AIOS VR Platform', "$tools Build on the AIOS VR Platform")
$c = $c.Replace('?? Cinema', "$cinema Cinema")
$c = $c.Replace('?? Enterprise', "$enterprise Enterprise")
$c = $c.Replace('?? Lab', "$lab Lab")
$c = $c.Replace('?? Arcade', "$arcade Arcade")
$c = $c.Replace('?? Wellness', "$wellness Wellness")
$c = $c.Replace('?? Social', "$social Social")
$c = $c.Replace('?? Education', "$education Education")
$c = $c.Replace('?? Art', "$art Art")
$c = $c.Replace('? Featured Experience', "$star Featured Experience")
$c = $c.Replace('All Programmes ?', "All Programmes $arrow")
$c = $c.Replace('Enterprise Plans ?', "Enterprise Plans $arrow")
$c = $c.Replace('AIOS Lab ?', "AIOS Lab $arrow")
$c = $c.Replace('Developer Portal ?', "Developer Portal $arrow")
$c = $c.Replace('>Open Lab ?<', ">Open Lab $arrow<")
$c = $c.Replace('>Submit App ?<', ">Submit App $arrow<")
$c = $c.Replace('AIOS SDK ?', "AIOS SDK $arrow")
$c = $c.Replace('Join Waitlist ?', "Join Waitlist $arrow")
$c = $c.Replace('? Coming Q3 2026', "$timer Coming Q3 2026")
$c = $c.Replace('? Coming Q4 2026', "$timer Coming Q4 2026")
$c = $c.Replace('? __VR_LIVE__ Live Now', "$red __VR_LIVE__ Live Now")
$c = $c.Replace('?? Developer Portal', "$wrench Developer Portal")
$c = $c.Replace('?????', "$grad")
# Enterprise icons by context (using line breaks)
$c = $c.Replace("<div class=`"ent-icon`">??</div>`r`n          <div class=`"ent-title`">Investor Deck VR</div>", "<div class=`"ent-icon`">$chart</div>`r`n          <div class=`"ent-title`">Investor Deck VR</div>")
$c = $c.Replace("<div class=`"ent-icon`">??</div>`r`n          <div class=`"ent-title`">Governance Council</div>", "<div class=`"ent-icon`">$scales</div>`r`n          <div class=`"ent-title`">Governance Council</div>")
$c = $c.Replace('<div class="ent-icon">???</div>', "<div class=`"ent-icon`">$rocket</div>")

if ($c -ne $orig) {
    [System.IO.File]::WriteAllText($path, $c, [System.Text.Encoding]::UTF8)
    Write-Host "FIXED vr-hub.html"
}
else {
    Write-Host "No changes"
}

$remaining = ($c | Select-String -Pattern '(?<![a-zA-Z0-9\-])\?\?(?![a-zA-Z0-9\-])' -AllMatches).Matches.Count
Write-Host "Remaining context-?? count: $remaining"
