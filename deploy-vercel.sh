#!/bin/bash

echo "🚀 Making your app Vercel-ready..."

# Build the frontend
echo "📦 Building frontend..."
cd client && npm run build && cd ..

echo "✅ Your app is ready for Vercel deployment!"
echo ""
echo "📋 Next steps:"
echo "1. Push this code to GitHub/GitLab"
echo "2. Connect your repository to Vercel"
echo "3. Add environment variables in Vercel dashboard:"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - SUPABASE_SERVICE_ROLE_KEY" 
echo "   - MAILJET_API_KEY"
echo "   - MAILJET_API_SECRET"
echo "   - ADMIN_EMAIL"
echo "   - ADMIN_FROM_EMAIL"
echo "   - MAILJET_TEMPLATE_ID_SUBMISSION"
echo "   - MAILJET_TEMPLATE_ID_REPLY"
echo ""
echo "🔗 Your app will be live at: https://your-project-name.vercel.app"