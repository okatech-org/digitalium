# DIGITALIUM - Deployment Setup Guide

## Cloud Infrastructure Status

### Deployed Services
- **Cloud SQL PostgreSQL 15**: `digitalium-db` (europe-west1)
- **Cloud Functions**: 22 functions deployed in europe-west1
- **Cloud Storage**: Buckets for documents, avatars, and invoices
- **Firestore**: Rules deployed
- **Secret Manager**: All payment provider secrets created

### Webhook URLs (for payment provider dashboards)
```
PayDunya:     https://europe-west1-digitalium-ga.cloudfunctions.net/paydunyaWebhook
Flutterwave:  https://europe-west1-digitalium-ga.cloudfunctions.net/flutterwaveWebhook
CinetPay:     https://europe-west1-digitalium-ga.cloudfunctions.net/cinetpayWebhook
```

---

## Required Configuration Steps

### 1. Enable Firebase Authentication (Required)

The auth trigger functions (onUserCreated, onUserDeleted) require Firebase Auth to be enabled.

1. Go to [Firebase Console](https://console.firebase.google.com/project/digitalium-ga/authentication)
2. Click "Get Started" or "Sign-in method"
3. Enable "Email/Password" provider
4. (Optional) Enable other providers like Google, Phone, etc.

After enabling, redeploy auth functions:
```bash
firebase deploy --only functions:onUserCreated,functions:onUserDeleted
```

### 2. Configure Payment Provider API Keys

All secrets have been created with placeholder values. Update them with your real API keys:

#### PayDunya (https://paydunya.com/developers)
```bash
# Get your keys from PayDunya dashboard
echo -n "YOUR_REAL_MASTER_KEY" | gcloud secrets versions add paydunya-master-key --data-file=- --project=digitalium-ga
echo -n "YOUR_REAL_PRIVATE_KEY" | gcloud secrets versions add paydunya-private-key --data-file=- --project=digitalium-ga
echo -n "YOUR_REAL_PUBLIC_KEY" | gcloud secrets versions add paydunya-public-key --data-file=- --project=digitalium-ga
echo -n "YOUR_REAL_TOKEN" | gcloud secrets versions add paydunya-token --data-file=- --project=digitalium-ga
```

#### Flutterwave (https://developer.flutterwave.com)
```bash
echo -n "YOUR_PUBLIC_KEY" | gcloud secrets versions add flutterwave-public-key --data-file=- --project=digitalium-ga
echo -n "YOUR_SECRET_KEY" | gcloud secrets versions add flutterwave-secret-key --data-file=- --project=digitalium-ga
echo -n "YOUR_ENCRYPTION_KEY" | gcloud secrets versions add flutterwave-encryption-key --data-file=- --project=digitalium-ga
```

#### CinetPay (https://docs.cinetpay.com)
```bash
echo -n "YOUR_API_KEY" | gcloud secrets versions add cinetpay-api-key --data-file=- --project=digitalium-ga
echo -n "YOUR_SITE_ID" | gcloud secrets versions add cinetpay-site-id --data-file=- --project=digitalium-ga
echo -n "YOUR_SECRET_KEY" | gcloud secrets versions add cinetpay-secret-key --data-file=- --project=digitalium-ga
```

### 3. Configure Webhook URLs in Payment Provider Dashboards

Add these webhook URLs to your payment provider dashboards:

| Provider    | Webhook URL |
|-------------|-------------|
| PayDunya    | `https://europe-west1-digitalium-ga.cloudfunctions.net/paydunyaWebhook` |
| Flutterwave | `https://europe-west1-digitalium-ga.cloudfunctions.net/flutterwaveWebhook` |
| CinetPay    | `https://europe-west1-digitalium-ga.cloudfunctions.net/cinetpayWebhook` |

### 4. Update Frontend Configuration

Update `src/lib/firebase.ts` with your Firebase config if not already done:
```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "digitalium-ga.firebaseapp.com",
  projectId: "digitalium-ga",
  storageBucket: "digitalium-ga.firebasestorage.app",
  messagingSenderId: "1042267015833",
  appId: "YOUR_APP_ID"
};
```

### 5. Deploy Frontend

After configuration, deploy the frontend:
```bash
npm run build
firebase deploy --only hosting
```

---

## Environment Variables

The Cloud Functions use these environment variables (configured in `functions/.env`):

```env
DB_USER=digitalium_user
DB_NAME=digitalium
CLOUD_SQL_CONNECTION_NAME=digitalium-ga:europe-west1:digitalium-db
API_URL=https://europe-west1-digitalium-ga.cloudfunctions.net
PAYDUNYA_MODE=test  # Change to 'live' for production
```

---

## Testing the System

### Test Subscription Flow

1. Create a test user account
2. Go to /pricing page
3. Select a plan
4. Choose a payment method (Mobile Money or Card)
5. Complete the test payment
6. Verify subscription is created in the database

### Verify Functions

```bash
# Check function logs
firebase functions:log --only initPayDunyaPayment

# List deployed functions
gcloud functions list --project=digitalium-ga --region=europe-west1
```

### Database Connection Test

```bash
# Connect to Cloud SQL (requires Cloud SQL Proxy)
gcloud sql connect digitalium-db --user=digitalium_user --project=digitalium-ga
```

---

## Troubleshooting

### Auth Triggers Not Working
- Ensure Firebase Auth is enabled in the console
- Redeploy auth functions after enabling

### Payment Webhooks Failing
- Verify webhook URLs are correctly configured in provider dashboards
- Check function logs: `firebase functions:log --only paydunyaWebhook`
- Verify secret values are correct

### Database Connection Issues
- Ensure Cloud SQL instance is running
- Verify IAM permissions for Cloud Functions service account
- Check connection string format

---

## Support

For issues specific to payment providers:
- PayDunya: support@paydunya.com
- Flutterwave: support@flutterwave.com
- CinetPay: support@cinetpay.com
