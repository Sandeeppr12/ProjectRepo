# Digital Vistara API

The Express API uses Firebase Admin and Cloud Firestore for persistent users, provider profiles, services, categories, bookings, payments, reviews, complaints, messages, notifications, and platform settings.

## Razorpay Test Mode

Test mode uses Razorpay Checkout with test credentials; it does not collect real money. No subscription is needed to test the checkout integration, but Razorpay requires an account to issue API keys and may require account verification. The app cannot bypass Razorpay's onboarding.

1. In the Razorpay dashboard, switch to **Test Mode** and generate API keys.
2. In `server/.env`, set `PAYMENT_MODE=razorpay`, then enter the dashboard's `rzp_test_...` key ID and test key secret.
3. Restart the API server. The checkout then opens Razorpay's hosted test interface.

Never put the key secret in the client, commit it, or use `rzp_live_...` keys while testing. Without test keys, the app stays in its local no-charge simulation mode.

## Configure Firestore

1. Create a Firebase project and a Cloud Firestore database in the Firebase console.
2. Create a service-account key from **Project settings → Service accounts**. Keep this key private; it must never go in the client app.
3. From the workspace root, create the server environment file:

   ```powershell
   Copy-Item server\.env.example server\.env
   ```

4. Set `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` in `server/.env`. Store the private key as a quoted value with newline escapes (`\n`). Set a long random `JWT_SECRET` and your own `ADMIN_EMAIL`.
5. Install server dependencies and seed the demo catalog:

   ```powershell
   cd server
   npm install
   npm run seed
   npm run dev
   ```

The seed is idempotent per collection: existing collections are left untouched. It refuses to create predictable demo accounts in production. Only customer and professional sample accounts are seeded; admin accounts are provisioned separately and are never created through public registration.

- `aarav.customer@example.com`
- `rahul.sharma@example.com`

Production admin passwords must be unique and at least 12 characters. On Windows, the helper below prompts for the local emulator password without displaying it and passes it to the provisioning process without saving it in `.env`:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\setup-admin-local.ps1
```

Run it from the `server` directory while Firestore is available. It accepts exactly 8 digits only for the local emulator at the owner's request; this short numeric password is weak and must never be used with a real Firebase project. For production, use a unique password of at least 12 characters, provide `ADMIN_PASSWORD` through a secure secret manager or one-off provisioning process, and never commit or leave it in `.env`. The server only grants admin access to the `ADMIN_EMAIL` account that was explicitly provisioned; changing the email requires provisioning that account. Existing unprovisioned demo admin records are denied access.

Run the Vite client in a second terminal with `cd client` followed by `npm run dev`. Its `/api` requests are proxied to the server on port 5000. Public registration supports customer and professional roles only; registration and sign-in stop with an explicit error if Firestore is unavailable rather than silently creating local-only accounts.

## Email and SMS Verification for Registration

Customer and professional registration sends the same 6-digit code to the provided email address and mobile number. The account and provider profile are created only after the code is verified. Codes expire after 10 minutes, are limited to 5 verification attempts, and can be resent once per minute.

Configure SMTP and Twilio on the server in `server/.env` before registering:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-sender@gmail.com
SMTP_PASS=your-mail-provider-app-password
SMTP_FROM=Digital Vistara <your-sender@gmail.com>

TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_FROM_NUMBER=+15017122661
# Or use a Messaging Service instead of TWILIO_FROM_NUMBER:
# TWILIO_MESSAGING_SERVICE_SID=MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Use an SMTP credential or app password from your mail provider, not your normal mailbox password. For Gmail, create an App Password after enabling 2-Step Verification. Get the Twilio Account SID, Auth Token, and sender number or Messaging Service SID from your Twilio console. Phone numbers should use international E.164 format (for example, `+919829000000`); 10-digit Indian mobile numbers are automatically prefixed with `+91`. Twilio trial accounts may only send to verified recipient numbers, and SMS availability and sender requirements vary by destination country.

Keep all mail and Twilio credentials in the server environment only, never in the client or source control, and restart the API after changing them. Both delivery channels must be configured and successfully send the code; otherwise registration returns an explicit error and no account is created.

## Production Deployment

The frontend is configured for Netlify in the workspace-root `netlify.toml`. The Express API must be deployed separately; `render.yaml` defines a Render web service, and `server/.node-version` selects the supported Node.js runtime.

1. Push this workspace to a Git repository and connect that repository to Render. Create the API service from the repository's `render.yaml`.
2. In Render, enter the real Firestore project ID, service-account email, and private key; your administrator email; SMTP credentials; Twilio credentials; and Razorpay **test** keys if you want to test checkout. Keep real credentials in the provider's secret settings, not in source control. Do not set `FIRESTORE_EMULATOR_HOST` in production. Render generates `JWT_SECRET` from the blueprint.
3. Initialize the production Firestore catalog and provision the administrator using the production Firebase credentials. Do not run `seed:local` or seed demo accounts into a public database. Create real categories, services, and provider profiles before opening the marketplace to customers.
4. After Render reports the API is healthy, copy its HTTPS service URL. In Netlify, connect the same Git repository and set the build environment variable `VITE_API_BASE_URL` to that URL, without a trailing slash. The Netlify build uses the `client` base directory and publishes `dist`.
5. Deploy the Netlify site, then sign in with the separately provisioned administrator account and complete production catalog/provider setup. Test registration OTP delivery, sign-in, booking, and Razorpay Test Mode before announcing the site.

The Render free service may sleep while idle, so the first request after inactivity can be delayed. Live payments require live Razorpay credentials and a separate production readiness review; never put live payment secrets in Netlify.

## Admin User and Transaction Records

After signing in with the provisioned administrator account, open **Registered Users** or **Transactions** in the admin dashboard to search and export registration/payment records as CSV. The API rechecks the signed-in account against the configured admin email and returns only the user fields needed for account management; password hashes and authentication credentials are never returned. The transaction view includes recorded payments and bookings awaiting payment confirmation. These screens are read-only; use the payment provider to process refunds.

## Local Emulator

The local Firestore Emulator requires Java and does not need a Firebase account or service-account credentials. From the workspace root, start the emulator and local API in separate terminals:

```powershell
npm --prefix server run emulator
```

```powershell
npm --prefix server run dev:local
```

```powershell
npm --prefix server run seed:local
```

Set `ADMIN_EMAIL` in `server/.env`, then run the secure password prompt while the emulator is running. At the hidden prompt, enter exactly 8 digits; the password is sent to the local emulator as a bcrypt hash and is not written to a file:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\setup-admin-local.ps1
```

Emulator data is exported to the ignored `server/.firestore-data` folder when it stops and imported on the next start. The customer and professional sample accounts use `password123`. Razorpay remains in the Test Mode configured in `server/.env`; test payments do not charge real money. From the frontend workspace, start Vite in another terminal with `npm --prefix client run dev`.

Production startup requires Firebase credentials and a `JWT_SECRET`. Razorpay test/simulated payment settings are separate from Firestore configuration.