import sqlite3 from 'sqlite3';
sqlite3.verbose();

const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  db.run(\`
    CREATE TABLE IF NOT EXISTS stats (
      username TEXT,
      week INTEGER,
      messages INTEGER,
      last_seen INTEGER
    )
  \`);
});

export function updateUserActivity(username) {
  const week = getCurrentWeek();
  const now = Date.now();

  db.get(
    \`SELECT * FROM stats WHERE username = ? AND week = ?\`,
    [username, week],
    (err, row) => {
      if (row) {
        db.run(
          \`UPDATE stats SET messages = messages + 1, last_seen = ? WHERE username = ? AND week = ?\`,
          [now, username, week]
        );
      } else {
        db.run(
          \`INSERT INTO stats (username, week, messages, last_seen) VALUES (?, ?, ?, ?)\`,
          [username, week, 1, now]
        );
      }
    }
  );
}

export function getLeaderboard(callback) {
  const week = getCurrentWeek();
  db.all(
    \`SELECT username, messages, ROUND((last_seen - MIN(last_seen)) / 60000.0) as watchtime
     FROM stats
     WHERE week = ?
     GROUP BY username
     ORDER BY messages DESC
     LIMIT 20\`,
    [week],
    callback
  );
}

function getCurrentWeek() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const week = Math.floor(((now - start) / 86400000 + start.getDay() + 1) / 7);
  return week;
}