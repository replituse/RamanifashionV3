# Ramani Fashion India E-Commerce

## Overview

Ramani Fashion India is a full-stack e-commerce web application specializing in traditional Indian sarees and ethnic wear. It offers a sophisticated shopping experience with features like product browsing, filtering, cart management, wishlist, user authentication, and order processing. The platform aims to deliver a premium online shopping experience for traditional Indian fashion through a modern tech stack and elegant UI design.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:** React 18 with TypeScript, Vite, Wouter for routing, TanStack Query for server state management, and Tailwind CSS for styling.

**UI/UX Decisions:**
- **Design System:** Shadcn UI (New York style variant) built on Radix UI primitives, with a custom pink/rose color palette for an elegant aesthetic.
- **Component Structure:** Modular and reusable components for consistent UI patterns.
- **Responsiveness:** Mobile-first approach.
- **Specific Features:**
    - Horizontal scrollable categories section with circular SVG frames and gold/amber ornate borders.
    - Enhanced user profile dropdown with improved styling and animations.
    - Floating "Scroll to Top" button with a gold gradient theme.
    - Real-time category search autocomplete with live filtering and instant feedback.
    - Admin authentication system with a dedicated `/admin` route featuring a tabbed interface for multi-step login (email, password, OTP verification) and signup.

### Backend Architecture

**Technology Stack:** Node.js with Express.js, TypeScript, MongoDB with Mongoose ODM, and JWT-based authentication with bcryptjs.

**API Structure:** RESTful API with resource-based endpoints, authentication middleware for protected routes, and comprehensive product filtering, sorting, and pagination.

**Key Design Decisions:**
- **Database:** MongoDB for flexible schema to accommodate product variations.
- **Authentication:** JWT tokens for stateless authentication, supporting scalability. Separate JWT secret (`ADMIN_JWT_SECRET`) for admin tokens.
- **Security:** bcrypt password hashing (10 rounds), role-based access control, protected admin routes, and OTP expiration (5 minutes).

### Data Models

**Core Schemas:**
- **Product:** Comprehensive details including name, description, price, images (up to 5), category, fabric, color, occasion, specifications, and stock. Includes fields for `originalPrice` and `sellingPrice` to automatically detect sale items.
- **User:** Basic user information, hashed password.
- **Cart:** References user and cart items (product references and quantities).
- **Wishlist:** References user and product IDs.
- **Order:** Full order details, shipping address, payment method, status.
- **Address:** User shipping addresses.

**Indexing:** Text index on product name and description; unique constraint on user email.

### Authentication & Authorization

**Implementation:** JWT tokens generated on login/registration, stored in `localStorage`, sent via Authorization header. Middleware validates tokens for protected API requests. Client-side route protection redirects unauthorized users.

## External Dependencies

### Database
- **MongoDB:** Primary data store.

### UI Component Libraries
- **Radix UI:** Headless UI primitives.
- **Shadcn UI:** Pre-built components based on Radix UI.
- **Lucide React:** Icon library.

### Development Tools
- **Replit Plugins:** Development banner, cartographer, runtime error overlay (for Replit environment).

### Image Storage
- **Local file paths:** Currently using `/attached_assets/generated_images`.