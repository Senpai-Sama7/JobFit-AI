import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import session from 'express-session';
import { type Express, type Request, type Response, type NextFunction } from 'express';
import { db } from './db';
import { users, type User } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';
import ConnectPgSimple from 'connect-pg-simple';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      hashedPassword: string;
      subscriptionStatus: string;
      subscriptionExpiry: Date | null;
      resumeGenerationsUsed: number;
      resumeGenerationsLimit: number;
      stripeCustomerId: string | null;
      stripeSubscriptionId: string | null;
      createdAt: Date;
      updatedAt: Date;
    }
  }
}

// ========================
// PASSWORD UTILITIES
// ========================

/**
 * Hash a password using scrypt with a random salt
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify a password against a stored hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) return false;

  const hashBuffer = Buffer.from(hash, 'hex');
  const verifyBuffer = scryptSync(password, salt, 64);

  return timingSafeEqual(hashBuffer, verifyBuffer);
}

// ========================
// PASSPORT CONFIGURATION
// ========================

/**
 * Configure Passport with local strategy
 */
function configurePassport(): void {
  // Serialize user to session
  passport.serializeUser((user: Express.User, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      if (!user) {
        return done(null, false);
      }
      done(null, user as Express.User);
    } catch (error) {
      done(error);
    }
  });

  // Local strategy for email/password authentication
  passport.use(new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));

        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        if (!verifyPassword(password, user.hashedPassword)) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        return done(null, user as Express.User);
      } catch (error) {
        return done(error);
      }
    }
  ));
}

// ========================
// SESSION CONFIGURATION
// ========================

/**
 * Get session secret from environment or generate a secure default
 */
function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret) return secret;

  // In production, require a secret
  if (process.env.NODE_ENV === 'production') {
    console.warn('WARNING: SESSION_SECRET not set. Using random secret (sessions will not persist across restarts)');
  }

  return randomBytes(32).toString('hex');
}

/**
 * Setup authentication middleware on the Express app
 */
export function setupAuth(app: Express): void {
  // Configure session store
  const PgSession = ConnectPgSimple(session);

  // Session configuration
  const sessionConfig: session.SessionOptions = {
    secret: getSessionSecret(),
    resave: false,
    saveUninitialized: false,
    name: 'jobfit.sid',
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  };

  // Use PostgreSQL session store if DATABASE_URL is available
  if (process.env.DATABASE_URL) {
    sessionConfig.store = new PgSession({
      conString: process.env.DATABASE_URL,
      tableName: 'user_sessions',
      createTableIfMissing: true,
    });
  }

  // Apply middleware
  app.use(session(sessionConfig));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport strategies
  configurePassport();
}

// ========================
// AUTHENTICATION MIDDLEWARE
// ========================

/**
 * Middleware to require authentication
 * Returns 401 if user is not authenticated
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
}

/**
 * Middleware to optionally get authenticated user
 * Continues even if user is not authenticated
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  // Just continue - user may or may not be authenticated
  next();
}

/**
 * Get the current authenticated user or null
 */
export function getCurrentUser(req: Request): Express.User | null {
  return req.user || null;
}

// ========================
// AUTH ROUTE HANDLERS
// ========================

/**
 * Register a new user
 */
export async function registerUser(
  email: string,
  password: string
): Promise<{ success: true; user: Express.User } | { success: false; error: string }> {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: 'Invalid email format' };
  }

  // Validate password strength
  if (password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters' };
  }

  // Check if user already exists
  const [existingUser] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
  if (existingUser) {
    return { success: false, error: 'Email already registered' };
  }

  // Create user
  const hashedPassword = hashPassword(password);
  const [newUser] = await db.insert(users).values({
    email: email.toLowerCase(),
    hashedPassword,
  }).returning();

  return { success: true, user: newUser as Express.User };
}

/**
 * Login handler using Passport
 */
export function createLoginHandler() {
  return passport.authenticate('local');
}
