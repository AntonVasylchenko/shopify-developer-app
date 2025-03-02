# Shopify B2B Forms App

## Description

This Shopify app is built with [Remix](https://remix.run/) and utilizes core concepts of working with Shopify Admin API, Prisma, MongoDB, Proxy, Flow, and Webhook.

The app enables the creation of custom forms for the B2B segment. When a customer fills out a form, the request appears in the app's admin panel, where a manager can approve or reject it. Based on the manager's decision, one of the following actions is performed:

1. **The customer exists in the database and is approved** → a `B2B` tag is added, and a confirmation email is sent.
2. **The customer exists but is not approved** → a rejection email is sent.
3. **The customer does not exist in the database but is approved** → a registration email is sent. After registration, the `B2B` tag is automatically assigned.

## Technologies

- **[Remix](https://remix.run/)** – the main framework for building the app.
- **[Shopify Admin API](https://shopify.dev/docs/api/admin-rest)** – used for handling customer data.
- **[Prisma](https://www.prisma.io/)** – ORM for database management.
- **[MongoDB](https://www.mongodb.com/)** – used as the primary database.
- **Proxy** – ensures secure communication between Shopify and the app's server.
- **Flow** – automates processes in Shopify.
- **Webhook** – enables real-time event handling.

## Installation & Setup

1. **Clone the repository:**
   ```sh
   git clone https://github.com/your-repo/shopify-b2b-app.git
   cd shopify-b2b-app
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Set up environment variables (`.env`):**
   ```env
   DATABASE_URL="your-mongodb-connection-string"
   SHOPIFY_API_KEY="your-shopify-api-key"
   SHOPIFY_API_SECRET="your-shopify-api-secret"
   ```

4. **Run the app:**
   ```sh
   npm run dev
   ```

## Usage

- Managers can review applications in the admin panel.
- Approving or rejecting applications triggers the corresponding automated actions.
- Integration with the Shopify Admin API ensures seamless customer status updates.

## License

MIT License. Free to use and modify.

## Author

Developed by [Anton](https://github.com/your-profile).
