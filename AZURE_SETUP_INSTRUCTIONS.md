# Azure AD Setup Instructions for Microsoft Graph API

## The Issue
Your application is getting a 401 authentication error when trying to send emails through Microsoft Graph API. This happens because the Azure AD application needs proper permissions and configuration.

## Solution Steps

### 1. Go to Azure Portal
1. Visit [https://portal.azure.com](https://portal.azure.com)
2. Sign in with your Microsoft account
3. Search for "Azure Active Directory" or "App registrations"

### 2. Find Your App Registration
1. Click on "App registrations" in the left sidebar
2. Look for an app named "The Written Hug" or find your app by the Client ID you provided
3. Click on your application

### 3. Add Required API Permissions
1. In your app's page, click on "API permissions" in the left sidebar
2. Click "Add a permission"
3. Select "Microsoft Graph"
4. Choose "Application permissions" (not Delegated)
5. Search for and add these permissions:
   - **Mail.Send** (essential for sending emails)
   - **User.Read.All** (if you need to read user info)
6. Click "Add permissions"

### 4. Grant Admin Consent
**This is the critical step that's likely missing:**
1. After adding permissions, you'll see a yellow warning banner
2. Click "Grant admin consent for [Your Organization]"
3. Confirm by clicking "Yes"
4. The status should change to green checkmarks

### 5. Verify Client Secret
1. Click on "Certificates & secrets"
2. Make sure you have a valid client secret that hasn't expired
3. If needed, create a new secret and update your environment variables

### 6. Check Authentication Settings
1. Go to "Authentication" in the left sidebar
2. Ensure "Allow public client flows" is set to "No" (for security)
3. Add redirect URIs if needed (though not required for your current setup)

### 7. Verify Application Settings
Make sure these settings match your environment variables:
- **Application (client) ID** → `OUTLOOK_CLIENT_ID`
- **Client secret value** → `OUTLOOK_CLIENT_SECRET`
- **Directory (tenant) ID** → `OUTLOOK_TENANT_ID`

## Current Workaround
I've implemented a fallback system that will automatically use Mailjet when Outlook fails, so your email system will continue working while you fix the Azure setup.

## Testing
After completing these steps:
1. Wait 5-10 minutes for changes to propagate
2. Try submitting a form through your website
3. Check the console logs to see if Outlook is working

## Common Issues
- **Missing admin consent**: Most 401 errors are due to this
- **Expired client secret**: Check the expiration date
- **Wrong tenant ID**: Verify you're using the correct directory
- **Insufficient permissions**: Make sure Mail.Send is granted with admin consent

The application will continue working with Mailjet as backup while you resolve the Azure setup.