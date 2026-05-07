// Patches game-merkaba-ghosts.html to add leaderboard loading + score submission
import { readFileSync, writeFileSync } from "fs";

const file = new URL(
  "../public/game-merkaba-ghosts.html",
  import.meta.url,
).pathname.slice(1);
let content = readFileSync(file, "utf8");

// 1. Replace endGame to add leaderboard score submission
const endGameMarker = "playTone(216, 1200, 0.2);\n      }";
const endGameNew = `playTone(216, 1200, 0.2);
        // Submit score to leaderboard
        const playerName = localStorage.getItem("aios_player_name") || "Anonymous";
        fetch("/api/game/score", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({game:"merkaba-ghosts",name:playerName,score})})
          .then(r=>r.json()).then(d=>{
            if(d.ok && d.rank<=10){
              const m=document.createElement("div");
              m.style.cssText="margin-top:0.6rem;font-size:0.8rem;color:#00f5d4;font-weight:700;";
              m.textContent="\u{1F3C6} You're #"+d.rank+" on the leaderboard!";
              gameoverEl.querySelector(".gameover-card")?.appendChild(m);
            }
          }).catch(()=>{});
        loadLeaderboard();
      }`;

if (content.includes(endGameMarker)) {
  content = content.replace(endGameMarker, endGameNew);
  console.log("✅ endGame patched");
} else {
  console.log("❌ endGame marker not found");
}

// 2. Add loadLeaderboard function near end of script (before closing </script>)
const scriptCloseMarker = "    </script>\n  </body>";
if (!content.includes("loadLeaderboard")) {
  const lbFunc = `
      // Load and display top scores in lobby
      function loadLeaderboard() {
        fetch("/api/game/merkaba-ghosts/leaderboard")
          .then(r=>r.json())
          .then(d=>{
            const el = document.getElementById("lobby-lb-rows");
            if (!el || !d.leaderboard) return;
            const colors = ["#ffd700","#c0c0c0","#cd7f32"];
            el.innerHTML = d.leaderboard.slice(0,10).map((e,i)=>
              \`<span style="color:\${colors[i]||'rgba(255,255,255,0.6)'}">\${i+1}. \${e.name}</span> <span style="float:right;color:#00f5d4;">\${e.score.toLocaleString()}</span><br>\`
            ).join("") || '<span style="color:rgba(255,255,255,0.3)">No scores yet — be the first!</span>';
          }).catch(()=>{});
      }
      loadLeaderboard();
`;
  if (content.includes(scriptCloseMarker)) {
    content = content.replace(
      scriptCloseMarker,
      lbFunc + "    </script>\n  </body>",
    );
    console.log("✅ loadLeaderboard function added");
  } else {
    // Try alternate closing
    const alt = "    </script>\r\n  </body>";
    if (content.includes(alt)) {
      content = content.replace(alt, lbFunc + "    </script>\r\n  </body>");
      console.log("✅ loadLeaderboard function added (CRLF)");
    } else {
      console.log("❌ script close marker not found");
    }
  }
} else {
  console.log("ℹ️  loadLeaderboard already exists");
}

writeFileSync(file, content, "utf8");
console.log("File written.");
