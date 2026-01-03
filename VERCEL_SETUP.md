# Vercel Deployment Setup Guide

## Environment Variables Required

To deploy this application on Vercel, you need to set the following environment variables in your Vercel project settings:

### Required Variables

1. **MONGODB_URI**
   - Your MongoDB connection string
   - Example for MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/expense-management?retryWrites=true&w=majority`
   - Example for local MongoDB: `mongodb://localhost:27017/expense-management`

2. **NEXTAUTH_URL**
   - Your application URL
   - For production: `https://your-domain.vercel.app`
   - For preview deployments: Vercel automatically sets this, but you can override if needed

3. **NEXTAUTH_SECRET**
   - A random secret string for JWT encryption
   - Generate one using: `openssl rand -base64 32`
   - Or use an online generator: https://generate-secret.vercel.app/32

### Optional Variables

4. **MONGODB_DB** (optional)
   - Database name (defaults to 'expense-management' if not set)

## How to Set Environment Variables on Vercel

1. Go to your Vercel project dashboard
2. Click on **Settings**
3. Click on **Environment Variables**
4. Add each variable:
   - **Key**: The variable name (e.g., `MONGODB_URI`)
   - **Value**: The variable value
   - **Environment**: Select where it applies (Production, Preview, Development)
5. Click **Save**
6. Redeploy your application for changes to take effect

## Common Issues

### 500 Internal Server Error on Registration/Login

**Cause**: Missing or incorrect MongoDB connection string

**Solution**:
1. Verify `MONGODB_URI` is set in Vercel environment variables
2. Ensure the MongoDB connection string is correct
3. If using MongoDB Atlas:
   - Check that your IP is whitelisted (or use 0.0.0.0/0 for all IPs)
   - Verify your database user credentials are correct
   - Ensure the cluster is running

### Build Errors

**Cause**: Missing dependencies

**Solution**: All dependencies should be in `package.json`. If you get module not found errors:
1. Ensure all packages are listed in `package.json`
2. Run `npm install` locally to update `package-lock.json`
3. Commit and push `package.json` and `package-lock.json`

### Authentication Errors

**Cause**: Missing `NEXTAUTH_SECRET`

**Solution**:
1. Generate a secret: `openssl rand -base64 32`
2. Add it to Vercel environment variables as `NEXTAUTH_SECRET`
3. Redeploy the application

## MongoDB Atlas Setup (Recommended for Production)

1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (Free tier available)
3. Create a database user
4. Whitelist IP addresses (use 0.0.0.0/0 for Vercel deployments)
5. Get your connection string from "Connect" → "Connect your application"
6. Replace `<password>` with your database user password
7. Add the connection string to Vercel as `MONGODB_URI`

## Testing Your Deployment

After setting up environment variables:

1. Go to your Vercel deployment URL
2. Try registering a new user
3. Check Vercel function logs if you encounter errors:
   - Go to your Vercel project
   - Click on **Deployments**
   - Click on a deployment
   - Click on **Functions** tab to see logs

## Troubleshooting

If you're still experiencing issues:

1. Check Vercel function logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test your MongoDB connection string locally
4. Ensure your MongoDB cluster/database is accessible from the internet (for Atlas)
5. Check that your database user has proper permissions

