
exports.handler = async function () {
  const fallback = {
    club: "Reckitts AFC",
    version: "V28 Proper Live",
    league: "Humber Premier League",
    stats: { last: "-", position: "-", points: "-" },
    fixtures: [],
    results: []
  };

  try {
    const res = await fetch(
      "https://fulltime.thefa.com/index.html?league=5360640",
      { headers: { "user-agent": "ReckittsLiveApp/1.0" } }
    );

    const html = await res.text();
    const updated = structuredClone(fallback);

    const scoreMatch = html.match(/Reckitts[^0-9]*(\d+)[^\d]+(\d+)/i);

    if (scoreMatch) {
      const home = scoreMatch[1];
      const away = scoreMatch[2];

      updated.stats.last = `${home}-${away}`;

      updated.results = [{
        left: "Reckitts",
        right: "Opponent",
        score: `${home}-${away}`,
        outcome: home > away ? "Won" : home < away ? "Lost" : "Draw",
        outcomeClass: home > away ? "win" : home < away ? "loss" : "draw",
        date: new Date().toLocaleDateString("en-GB")
      }];
    }

    updated.updatedAt = new Date().toISOString();

    return {
      statusCode: 200,
      body: JSON.stringify(updated)
    };

  } catch (e) {
    return {
      statusCode: 200,
      body: JSON.stringify(fallback)
    };
  }
};
