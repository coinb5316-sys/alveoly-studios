import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

export const configurePassport = (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // 1. Check if a user with this Google ID exists
          let user = await User.findOne({ googleId: profile.id });
          
          if (user) return done(null, user);

          // 2. Check if a user with this email exists (maybe they registered normally first)
          const email = profile.emails[0].value.toLowerCase();
          user = await User.findOne({ email });
          
          if (user) {
            // Link their Google ID to the existing account
            user.googleId = profile.id;
            await user.save();
            return done(null, user);
          }

          // 3. Create a brand new user
          user = await User.create({
            email,
            googleId: profile.id,
            credits: 5, // Default free credits
          });

          done(null, user);
        } catch (err) {
          done(err, null);
        }
      }
    )
  );
};