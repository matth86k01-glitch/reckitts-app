function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function badgeKey(name) {
  const n = String(name || "").toLowerCase();
  if (n.includes("hull united")) return "HULL";
  if (n.includes("reckitts")) return "RECKITTS";
  if (n.includes("hornsea")) return "HORNSEA";
  if (n.includes("driffield")) return "DRIFFIELD";
  if (n.includes("scarborough")) return "SCARBOROUGH";
  if (n.includes("beverley")) return "BEVERLEY";
  if (n.includes("goole")) return "GOOLE";
  return "RECKITTS";
}

function normaliseLines(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .split("\n")
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function isDateLine(line) {
  return /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+\d{2}\s+[A-Za-z]{3}\s+\d{2}$/i.test(line);
}

function parseResultSummary(line) {
  const m = line.match(/^(.*?)\s+(\d+)\s+(.*?)\s+(\d+)$/);
  if (!m) return null;
  return {
    team1: m[1].trim(),
    score1: Number(m[2]),
    team2: m[3].trim(),
    score2: Number(m[4]),
  };
}

function parseNextSummary(line) {
  const cleaned = line.replace(/\s+VS$/, "").trim();
  const marker = "Reckitts AFC";
  const idx = cleaned.indexOf(marker);
  if (idx === -1) return null;
  const before = cleaned.slice(0, idx).trim();
  const after = cleaned.slice(idx + marker.length).trim();

  if (before && !after) {
    return { homeTeam: before, awayTeam: marker, homeAway: "A" };
  }
  if (!before && after) {
    return { homeTeam: marker, awayTeam: after, homeAway: "H" };
  }
  return null;
}

function outcomeForReckitts(team1, score1, team2, score2) {
  const reckittsHome = /reckitts/i.test(team1);
  const reckittsScore = reckittsHome ? score1 : score2;
  const oppScore = reckittsHome ? score2 : score1;
  if (reckittsScore > oppScore) return { text: "Won", cls: "win" };
  if (reckittsScore < oppScore) return { text: "Lost", cls: "loss" };
  return { text: "Draw", cls: "draw" };
}

exports.handler = async function () {
  const fallback = {
    club: "Reckitts AFC",
    version: "V29 Stronger Parser",
    subtitle:
      "Your First Team hub for fixtures, results, match details and league position in the Humber Premier League.",
    league: "Humber Premier League",
    nextMatch: {
      homeTeam: "Hull United",
      awayTeam: "Reckitts AFC",
      kickoffDate: "Wed 15 Apr 26",
      kickoffTime: "6:30pm",
      venue: "Haworth Park",
      homeAway: "A",
      homeBadge: "HULL",
      awayBadge: "RECKITTS"
    },
    afterThat: {
      text: "Hornsea Town vs Reckitts AFC · Saturday 18 April 2026 · 2:00pm",
      venue: "📍 HOLLIS RECREATIONAL GROUND",
      address: "Westwood Avenue, Hornsea HU18 1EE"
    },
    stats: {
      position: "7th",
      points: "34",
      last: "1–1",
      form: "DWD"
    },
    fixtures: [
      {
        home: "Hull United",
        away: "Reckitts AFC",
        homeBadge: "HULL",
        awayBadge: "RECKITTS",
        date: "Wed 15 Apr 26 · 6:30pm",
        venue: "📍 Haworth Park",
        tag: "A"
      },
      {
        home: "Hornsea Town",
        away: "Reckitts AFC",
        homeBadge: "HORNSEA",
        awayBadge: "RECKITTS",
        date: "Sat 18 Apr 26 · 2:00pm",
        venue: "📍 HOLLIS RECREATIONAL GROUND",
        address: "Westwood Avenue, Hornsea HU18 1EE",
        tag: "A"
      },
      {
        home: "Great Driffield",
        away: "Reckitts AFC",
        homeBadge: "DRIFFIELD",
        awayBadge: "RECKITTS",
        date: "Sat 9 May 26",
        venue: "📍 Venue not exposed in current source",
        tag: "A"
      }
    ],
    results: [
      {
        left: "Reckitts",
        right: "Goole",
        leftBadge: "RECKITTS",
        rightBadge: "GOOLE",
        score: "1–1",
        date: "Sat 11 Apr 26",
        tag: "H",
        outcome: "Draw",
        outcomeClass: "draw"
      },
      {
        left: "Beverley",
        right: "Reckitts",
        leftBadge: "BEVERLEY",
        rightBadge: "RECKITTS",
        score: "1–1",
        date: "Tue 7 Apr 26",
        tag: "A",
        outcome: "Draw",
        outcomeClass: "draw"
      },
      {
        left: "Scarborough",
        right: "Reckitts",
        leftBadge: "SCARBOROUGH",
        rightBadge: "RECKITTS",
        score: "0–2",
        date: "Sat 4 Apr 26",
        tag: "A",
        outcome: "Won",
        outcomeClass: "win"
      }
    ],
    table: [
      { position: "5", club: "Goole United", badge: "GOOLE", played: "24", gd: "+9", points: "39", form: ["D","W","D"] },
      { position: "6", club: "Hull United", badge: "HULL", played: "24", gd: "+8", points: "36", form: ["W","D","L"] },
      { position: "7", club: "Reckitts AFC", badge: "RECKITTS", played: "24", gd: "+2", points: "34", form: ["D","W","D"] },
      { position: "8", club: "Hornsea Town", badge: "HORNSEA", played: "24", gd: "0", points: "33", form: ["L","W","D"] },
      { position: "9", club: "Great Driffield", badge: "DRIFFIELD", played: "24", gd: "-4", points: "31", form: ["D","L","W"] }
    ]
  };

  try {
    const url = "https://fulltime.thefa.com/index.html?league=5360640";
    const res = await fetch(url, {
      headers: { "user-agent": "ReckittsAFCAutoUpdate/1.0" }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();
    const lines = normaliseLines(html);
    const updated = clone(fallback);

    const reckittsIdx = lines.findIndex((line, i) => line === "Reckitts AFC" && lines[i + 1] === "Recent Form");
    if (reckittsIdx !== -1) {
      const block = lines.slice(reckittsIdx, reckittsIdx + 140);

      // Parse the recent results inside the team block.
      const parsedResults = [];
      for (let i = 0; i < block.length - 5; i++) {
        if (isDateLine(block[i]) && /^Venue:/i.test(block[i + 1])) {
          const date = block[i];
          const team1 = block[i + 2];
          const scoreLine = block[i + 3];
          const team2 = block[i + 4];
          const scoreMatch = scoreLine.match(/^(\d+)\s*-\s*(\d+)$/);
          if (!scoreMatch) continue;

          const score1 = Number(scoreMatch[1]);
          const score2 = Number(scoreMatch[2]);

          if (!/reckitts/i.test(team1) && !/reckitts/i.test(team2)) continue;

          const leftName = /reckitts/i.test(team1) ? "Reckitts" : team1.replace(/\s+AFC$/i, "").trim();
          const rightName = /reckitts/i.test(team2) ? "Reckitts" : team2.replace(/\s+AFC$/i, "").trim();
          const outcome = outcomeForReckitts(team1, score1, team2, score2);

          parsedResults.push({
            left: leftName,
            right: rightName,
            leftBadge: badgeKey(leftName),
            rightBadge: badgeKey(rightName),
            score: `${score1}–${score2}`,
            date,
            tag: /reckitts/i.test(team1) ? "H" : "A",
            outcome: outcome.text,
            outcomeClass: outcome.cls
          });
        }
      }

      if (parsedResults.length) {
        // Most recent first already in source block
        updated.results = parsedResults.slice(-3).reverse();
        updated.stats.last = updated.results[0].score;
      }

      // Parse latest summary line and next summary line.
      const lastIdx = block.findIndex((line) => /^LAST:\s*-/.test(line));
      if (lastIdx !== -1 && block[lastIdx + 1]) {
        const summary = parseResultSummary(block[lastIdx + 1]);
        if (summary) {
          const outcome = outcomeForReckitts(summary.team1, summary.score1, summary.team2, summary.score2);
          const leftName = /reckitts/i.test(summary.team1) ? "Reckitts" : summary.team1.replace(/\s+AFC$/i, "").trim();
          const rightName = /reckitts/i.test(summary.team2) ? "Reckitts" : summary.team2.replace(/\s+AFC$/i, "").trim();
          updated.results[0] = {
            left: leftName,
            right: rightName,
            leftBadge: badgeKey(leftName),
            rightBadge: badgeKey(rightName),
            score: `${summary.score1}–${summary.score2}`,
            date: updated.results[0] ? updated.results[0].date : "",
            tag: /reckitts/i.test(summary.team1) ? "H" : "A",
            outcome: outcome.text,
            outcomeClass: outcome.cls
          };
          updated.stats.last = updated.results[0].score;
        }
      }

      const nextIdx = block.findIndex((line) => /^NEXT:\s*-/.test(line));
      if (nextIdx !== -1 && block[nextIdx + 1]) {
        const nextInfo = parseNextSummary(block[nextIdx + 1]);
        if (nextInfo) {
          const dtMatch = block[nextIdx].match(/NEXT:\s*-\s*(\d{2}\/\d{2}\/\d{2})\s*(\d{2}:\d{2})/);
          const kickoffDate = dtMatch ? dtMatch[1] : updated.nextMatch.kickoffDate;
          const kickoffTime = dtMatch ? dtMatch[2] : updated.nextMatch.kickoffTime;

          updated.nextMatch = {
            homeTeam: nextInfo.homeTeam,
            awayTeam: nextInfo.awayTeam,
            kickoffDate,
            kickoffTime,
            venue: updated.nextMatch.venue,
            homeAway: nextInfo.homeAway,
            homeBadge: badgeKey(nextInfo.homeTeam),
            awayBadge: badgeKey(nextInfo.awayTeam)
          };

          updated.fixtures[0] = {
            home: nextInfo.homeTeam,
            away: nextInfo.awayTeam,
            homeBadge: badgeKey(nextInfo.homeTeam),
            awayBadge: badgeKey(nextInfo.awayTeam),
            date: `${kickoffDate} · ${kickoffTime}`,
            venue: "📍 " + updated.nextMatch.venue,
            tag: nextInfo.homeAway
          };
        }
      }
    }

    updated.version = "V29 Stronger Parser";
    updated.updatedAt = new Date().toISOString();

    return {
      statusCode: 200,
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify(updated)
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        ...fallback,
        version: "V29 Stronger Parser (fallback)",
        updatedAt: new Date().toISOString()
      })
    };
  }
};
