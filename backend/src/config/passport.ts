import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { pool } from "./db";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:4000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const googleId = profile.id;
        const avatarUrl = profile.photos?.[0]?.value || null;
        const displayName =
          profile.displayName || email?.split("@")[0] || `user${googleId}`;

        if (!email) {
          return done(new Error("Aucun email fourni par Google"));
        }

        const existingByGoogleId = await pool.query(
          "SELECT * FROM users WHERE google_id = $1",
          [googleId]
        );
        if (existingByGoogleId.rows.length > 0) {
          return done(null, existingByGoogleId.rows[0]);
        }

        const existingByEmail = await pool.query(
          "SELECT * FROM users WHERE email = $1",
          [email]
        );
        if (existingByEmail.rows.length > 0) {
          const updated = await pool.query(
            "UPDATE users SET google_id = $1 WHERE id = $2 RETURNING *",
            [googleId, existingByEmail.rows[0].id]
          );
          return done(null, updated.rows[0]);
        }

        let username = displayName.replace(/\s+/g, "").toLowerCase();
        const usernameTaken = await pool.query(
          "SELECT id FROM users WHERE username = $1",
          [username]
        );
        if (usernameTaken.rows.length > 0) {
          username = `${username}${Date.now().toString().slice(-4)}`;
        }

        const created = await pool.query(
          `INSERT INTO users (username, email, google_id, avatar_url)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [username, email, googleId, avatarUrl]
        );
        return done(null, created.rows[0]);
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

export default passport;
