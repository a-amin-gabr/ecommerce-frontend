# E-Commerce Clothing Store — Angular Frontend

A modern, responsive e-commerce web application designed for an Egyptian clothing brand with Cash on Delivery (COD) payment, guest shopping cart, and comprehensive administration console.

## Key Features
* **Modern Clothing Catalog**: Responsive grid with search, multi-category & subcategory filters, price filters, and stock toggles.
* **Smart Stock Indicators**: Real-time visual inventory status (`In Stock`, urgency indicator for `<= 3` items left, and `Out of Stock` with disabled purchase controls).
* **Guest Cart & Cross-Tab Persistence**: Seamless anonymous shopping cart persisting across browser tabs with automatic sync upon login.
* **Amazon-Style Price Change Alerts**: Clear notification banners when item prices change, requiring confirmation before order submission.
* **Cash on Delivery Checkout**: Simplified registration (phone & address collected only at checkout), address book management with default address toggle.
* **Admin Management Console**: Dedicated dashboard to manage apparel, categories, orders lifecycle, customer testimonials, and dynamic FAQs.

## Tech Stack
* **Framework**: Angular 18+ Standalone Components
* **Styling**: Bootstrap 5 + Custom Design Tokens (Plus Jakarta Sans & Tajawal typography)
* **State Management & Async**: RxJS BehaviorSubjects
* **Routing**: Angular Router with functional guards (`authGuard`, `adminGuard`, `deactivateGuard`)

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm start
   ```
3. Open your browser at `http://localhost:4200/`.
