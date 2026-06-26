# Shopify Announcement Bar App (MERN Task)

**Live URL**: [https://future-blink-shopify-app.onrender.com](https://future-blink-shopify-app.onrender.com) (Deploying...)

This application was built as part of the Shopify App Developer Task. It allows merchants to set a floating announcement banner on their storefront from the Shopify Admin.

## Features
- **Admin Dashboard**: Built with React & Polaris, featuring a text input to manage the announcement.
- **Audit History**: Every update is saved to a **MongoDB** database with a timestamp.
- **Shopify Sync**: Backend (Node/Remix) syncs the data to **Shopify Shop Metafields** via GraphQL.
- **Storefront Display**: A **Theme App Extension (App Embed Block)** reads the metafield and displays a floating banner on every page.

## Tech Stack
- **Frontend**: React (Remix) + Shopify Polaris
- **Backend**: Node.js + Express (Remix runtime)
- **Database**: MongoDB (Mongoose)
- **Shopify API**: Admin GraphQL API
- **Extension**: Liquid (Theme App Extension)

---

## 🚀 Getting Started

### 1. Prerequisites
- A [Shopify Partner Account](https://partners.shopify.com)
- A Development Store
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli) installed
- MongoDB URI (Local or Atlas)

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone <your-repo-link>
cd FutureBlink_task
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory (the CLI may generate this for you, but ensure `MONGODB_URI` is set):
```env
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SCOPES=write_products,write_metafields
SHOPIFY_APP_URL=https://your-app-url.ngrok.io
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/future_blink
```

### 4. Running the App
Start the development server:
```bash
npm run dev
```
Follow the prompts to connect your app to your Partner Dashboard and development store.

---

## 🛠 Project Structure
- `app/routes/app._index.tsx`: The main dashboard UI and logic (Saving to DB & Shopify).
- `app/mongodb.server.ts`: MongoDB connection utility.
- `app/models/AuditLog.server.ts`: Mongoose schema for the audit history.
- `extensions/announcement-bar/`: The Theme App Extension code.
  - `blocks/announcement_banner.liquid`: The storefront banner logic.

## 📝 How it works (Explanation)
1. **Flow**: Admin Dashboard -> Backend Action -> (MongoDB + Shopify API) -> Shop Metafield -> Storefront Liquid.
2. **Persistence**: When "Save" is clicked, the backend saves the text to MongoDB (for history) and sets a `single_line_text_field` metafield on the `Shop` resource using the namespace `my_app` and key `announcement`.
3. **Display**: The Theme App Extension is an **App Embed Block**. It is globally available and uses Liquid to check `shop.metafields.my_app.announcement`. If present, it injects a fixed-position `<div>` at the top of the body.

---

## 🎥 Video Demo Requirements
When recording your Loom demo, ensure you show:
1. Updating the text in the App Dashboard.
2. The success toast and the banner appearing on the live storefront.
3. The record appearing in your MongoDB collection.

## 📧 Submission
- **Email**: careers@futureblinkmail.xyz
- **Subject**: Shopify App Developer Task

---

## 🌐 Deployment (Render)
This project is configured for one-click deployment on Render using the `render.yaml` Blueprint.

1.  **Push to GitHub**: Ensure all changes are pushed to your public repository.
2.  **Connect to Render**:
    *   Go to [dashboard.render.com](https://dashboard.render.com).
    *   Click **New +** and select **Blueprint**.
    *   Connect your GitHub repository.
3.  **Set Environment Variables**: Render will prompt you for the following secrets based on the `render.yaml`:
    *   `SHOPIFY_API_KEY`
    *   `SHOPIFY_API_SECRET`
    *   `SHOPIFY_APP_URL` (Use `https://future-blink-shopify-app.onrender.com`)
    *   `MONGODB_URI` (Your MongoDB connection string)
4.  **Wait for Build**: Render will use the `Dockerfile` to build and deploy the app.
