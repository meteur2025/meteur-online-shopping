# Meteur Online Shopping

Meteur Online Shopping is a modern Kenyan e-commerce marketplace designed to provide customers with a realistic and easy-to-use online shopping experience.

## 🛒 About Meteur

Meteur brings products, deals, customer accounts, order information, and shopping tools together in one online marketplace.

The website is designed with a clean, responsive interface that works across desktop, tablet, and mobile devices.

## ✨ Features

- Modern e-commerce homepage
- Original Meteur branding
- Product search
- Product categories
- Product listings
- Product detail pages
- Product images
- Product ratings
- Flash deals
- New arrivals
- Shopping cart
- Wishlist
- Customer registration
- Customer login
- Email verification
- Password recovery
- Customer dashboard
- Customer profile
- Order information
- Checkout interface
- Order confirmation
- Order tracking
- Shipping information
- Returns and refunds information
- Help Center
- FAQ page
- Contact page
- Seller registration information
- Responsive design

## 🛍️ Shopping Categories

Meteur supports a variety of shopping categories, including:

- Electronics
- Phones and Tablets
- Fashion
- Shoes
- Beauty
- Home and Appliances
- Computing
- Groceries
- Accessories
- Cameras
- Kitchen
- Smart Devices

## 🔎 Shopping Experience

The main customer shopping flow is:

Home → Shop → Product Details → Add to Cart → Cart → Checkout → Order Confirmation

Customers can browse products, search for items, view product information, add products to their cart, and proceed through the checkout interface.

## 👤 Customer Account

The account flow is:

Create Account → Email Verification → Login → Customer Dashboard

Customers can access account-related pages including:

- Profile
- Orders
- Wishlist
- Addresses
- Account dashboard
- Password recovery

## 🔐 Authentication

Meteur Online Shopping uses Supabase Authentication for customer account registration and login.

Authentication features include:

- Customer registration
- Email verification
- Secure login
- Password recovery
- Password reset
- Protected customer dashboard
- Logout functionality

## 💳 Payments

The website includes a checkout experience designed to support future payment integration.

M-Pesa payment processing can be connected through an appropriate payment provider and API after the shopping and account systems are fully tested.

No real payment information should be entered into the demonstration website unless a properly configured payment system is active.

## 🚚 Delivery

The website includes customer information pages for:

- Shipping
- Delivery estimates
- Order tracking
- Delivery guidance
- Failed deliveries
- Damaged packages
- Delivery restrictions

## ↩️ Returns and Refunds

Customers can access information about:

- Return eligibility
- Return conditions
- Refunds
- Damaged products
- Incorrect products
- Exchanges
- Return requests

## 🏪 Selling on Meteur

Meteur is designed as a marketplace where sellers can eventually list and manage products.

The Sell on Meteur page provides information about:

- Seller benefits
- Seller requirements
- Seller onboarding
- Product categories
- Seller support

Seller accounts and marketplace management features can be connected to a backend system in a future version.

## 🛠️ Technologies

This project uses:

- HTML5
- CSS3
- JavaScript
- Supabase Authentication
- Browser Local Storage
- GitHub
- Vercel

## 📁 Main Website Pages

### Shopping

- `index.html` — Homepage
- `shop.html` — Product shop
- `product.html` — Product details
- `categories.html` — Product categories
- `deals.html` — Deals
- `new-arrivals.html` — New arrivals
- `cart.html` — Shopping cart
- `checkout.html` — Checkout

### Customer Accounts

- `login.html` — Customer login
- `register.html` — Customer registration
- `verify-email.html` — Email verification
- `forgot-password.html` — Password recovery
- `reset-password.html` — Password reset
- `dashboard.html` — Customer dashboard
- `profile.html` — Customer profile
- `orders.html` — Customer orders
- `wishlist.html` — Wishlist
- `addresses.html` — Customer addresses

### Customer Support

- `help.html` — Help Center
- `faq.html` — Frequently Asked Questions
- `contact.html` — Contact page
- `track-order.html` — Order tracking
- `returns.html` — Returns and refunds
- `shipping.html` — Shipping and delivery

### Information

- `about.html` — About Meteur
- `sell.html` — Sell on Meteur
- `privacy.html` — Privacy Policy
- `terms.html` — Terms and Conditions
- `order-confirmation.html` — Order confirmation
- `404.html` — Page not found

## 🔧 Configuration

Supabase authentication is configured through:

`supabase-config.js`

The project uses the Supabase project URL and publishable key required by the browser client.

Sensitive server-side keys should never be placed in the frontend repository.

## 🛒 Cart System

The current shopping cart uses browser Local Storage.

The cart supports:

- Adding products
- Updating quantities
- Removing products
- Cart item counting
- Checkout navigation

Persistent customer carts connected to a database can be added in a future backend version.

## 🌐 Deployment

The website is deployed using Vercel.

The live website is:

https://meteur-online-shopping.vercel.app/

## 🚀 Future Development

Future versions of Meteur Online Shopping can include:

- Product database
- Seller accounts
- Seller dashboard
- Product management
- Customer database
- Persistent customer profiles
- Persistent addresses
- Persistent orders
- Persistent wishlists
- Persistent shopping carts
- M-Pesa integration
- Payment confirmation
- Order management
- Seller order management
- Admin dashboard
- Product inventory
- Product reviews
- Advanced search
- Notifications
- Email order notifications

## 🎯 Project Purpose

Meteur Online Shopping is a web development project demonstrating how a modern e-commerce marketplace can be designed and developed for customers in Kenya.

The project combines a responsive shopping interface with customer authentication and a foundation for future database, marketplace, and payment functionality.

## ⚠️ Project Notice

Meteur Online Shopping is an independent project using original Meteur branding.

It is not affiliated with Jumia or any other e-commerce company.

The current website should be treated as a development and demonstration project until all production backend, security, payment, database, and marketplace systems have been fully implemented and tested.

## 📄 License

This project is intended for development and demonstration purposes.

© 2026 Meteur Online Shopping. All rights reserved.
