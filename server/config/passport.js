// config/passport.js
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

const base = () => ({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
});

/**
 * Login strategy: user MUST already exist.
 * If they don't, fail so the frontend can show "register first".
 */
export const configurePassport = (passport) => {
  passport.use(
    'google-login',
    new GoogleStrategy(
      {
        ...base(),
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const rawEmail = profile.emails?.[0]?.value;
          if (!rawEmail) return done(null, false, { message: 'no_email' });
          const email = rawEmail.toLowerCase();

          // Prefer lookup by googleId, fall back to email (account linking)
          let user = await User.findOne({ googleId: profile.id });
          if (!user) user = await User.findOne({ email });

          if (!user) {
            return done(null, false, { message: 'not_registered' });
          }

          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );

  /**
   * Register strategy: creates the user if they don't exist,
   * otherwise logs them in. Used by /auth/google/register.
   */
  passport.use(
    'google-register',
    new GoogleStrategy(
      {
        ...base(),
        callbackURL: process.env.GOOGLE_REGISTER_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const rawEmail = profile.emails?.[0]?.value;
          if (!rawEmail) return done(null, false, { message: 'no_email' });
          const email = rawEmail.toLowerCase();

          let user = await User.findOne({ googleId: profile.id });
          if (user) return done(null, user);

          user = await User.findOne({ email });
          if (user) {
            if (!user.googleId) {
              user.googleId = profile.id;
              await user.save();
            }
            return done(null, user);
          }

          user = await User.create({
            email,
            googleId: profile.id,
            credits: 5,
          });

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
};