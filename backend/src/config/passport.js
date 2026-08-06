const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

const googleEnabled = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

if (googleEnabled) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email', 'https://www.googleapis.com/auth/spreadsheets.readonly'],
      },
      (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails && profile.emails[0] && profile.emails[0].value;
          const avatar = profile.photos && profile.photos[0] && profile.photos[0].value;
          if (!email) return done(new Error('No email returned from Google'));

          let user = db.prepare('SELECT * FROM users WHERE google_id = ? OR email = ?').get(profile.id, email);

          if (!user) {
            const totalUsers = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
            const role = totalUsers === 0 ? 'admin' : 'user';
            const id = uuidv4();
            db.prepare(
              `INSERT INTO users (id, name, email, google_id, google_access_token, google_refresh_token, avatar_url, role)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
            ).run(id, profile.displayName || email.split('@')[0], email, profile.id, accessToken, refreshToken || null, avatar, role);
            user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
          } else {
            db.prepare(
              `UPDATE users SET google_id = ?, google_access_token = ?, google_refresh_token = COALESCE(?, google_refresh_token), avatar_url = ? WHERE id = ?`
            ).run(profile.id, accessToken, refreshToken, avatar, user.id);
            user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
}

module.exports = { passport, googleEnabled };
