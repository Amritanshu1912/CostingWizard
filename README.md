# 🧹 CostingWizard

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.14-38B2AC)](https://tailwindcss.com/)
[![IndexedDB](https://img.shields.io/badge/IndexedDB-Dexie-orange)](https://dexie.org/)

**A powerful, offline-first manufacturing cost management application that runs entirely in your browser. No backend, no servers—just pure client-side excellence powered by IndexedDB.**

### [🚀 Live Demo](https://your-app.vercel.app) • [💻 Source Code](https://github.com/Amritanshu1912/CostingWizard)

</div>

---

## 💡 Project Concept

This project demonstrates how to build a **fully-functional manufacturing management system** using only frontend technologies and **IndexedDB** for data persistence.

**No backend. No SQL. No NoSQL. Just IndexedDB.**

Built as a portfolio piece to showcase:

- ✅ Complex state management with client-side database
- ✅ Relational data modeling in IndexedDB
- ✅ Real-time updates and reactive queries
- ✅ Offline-first architecture
- ✅ Modern React patterns and TypeScript
- ✅ Production-ready deployment on Vercel

## 🎯 Core Features

- **📱 Browser-Native**: No servers, no databases, no installation—just open in your browser
- **📊 Real-Time Analytics**: Interactive dashboards with instant cost analysis and production insights.
- **🎨 Modern UI/UX**: A beautiful, responsive, and accessible interface built with Radix UI and Tailwind CSS.
- **⚡ High Performance**: Optimized for large datasets with sub-millisecond query times and efficient data structures.
- **🔄 Data Portability**: Easily import, export, and auto-save all your data without relying on a server.

| Feature                     | Description                                                             | Status      |
| :-------------------------- | :---------------------------------------------------------------------- | :---------- |
| **📦 Materials Management** | Track raw materials with supplier info, pricing, and availability.      | ✅ Complete |
| **🧪 Recipe Management**    | Create and optimize product formulas with automatic cost calculations.  | ✅ Complete |
| **🏢 Supplier Management**  | Compare suppliers, analyze pricing, and track performance metrics.      | ✅ Complete |
| **📅 Production Planning**  | Schedule production batches and check material requirements in advance. | ✅ Complete |
| **📊 Inventory Tracking**   | Monitor stock levels, movements, and real-time material usage.          | ✅ Complete |
| **🧾 Reports & Analytics**  | Generate detailed cost breakdowns, reports, and visual analytics.       | ✅ Complete |
| **🛒 Procurement**          | Manage supplier relationships and generate purchase orders efficiently. | ✅ Complete |

## 🚀 Quick Start

### Try It Live

👉 **[Open Live Demo](https://your-app.vercel.app)**

The app is pre-loaded with sample data (150+ materials, 3 suppliers, and recipes) so you can start exploring its features immediately.

### Run Locally

```bash
# Clone the repository
git clone https://github.com/your-username/costingwizard.git
cd costingwizard

# Install dependencies
pnpm install

# Run the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

---

## 🛠️ Technical Deep Dive

This project's core challenge was to build a feature-rich application with complex relational data without a traditional backend.

### Architecture: IndexedDB-Powered Local Database

CostingWizard uses **IndexedDB**, powered by the **Dexie.js** library, as its primary data storage engine.
This setup demonstrates how modern browsers can efficiently manage complex data persistence, relationships, and reactive queries — all without a backend.

**Key Benefits:**

- **Zero Backend**: No servers, APIs, or external databases required — everything runs in the browser.
- **High Performance**: Sub-millisecond queries with lazy loading and efficient re-rendering.
- **Rich Data Model**: Supports foreign keys, many-to-many relationships, and advanced filtering or aggregation.
- **Persistent Storage**: Handles over 1GB of data with automatic saving and offline functionality.
- **Data Portability**: Built-in import/export and backup/restore for easy synchronization.

---

### Database Schema & Queries

The schema is designed to handle relational manufacturing data.

```typescript
// lib/db.ts
CostingWizardDB {
  categories: Table<Category>
  materials: Table<Material>
  suppliers: Table<Supplier>
  recipes: Table<Recipe>
  recipeIngredients: Table<RecipeIngredient>
  productionPlans: Table<ProductionPlanExtended>
  purchaseOrders: Table<PurchaseOrder>
  packaging: Table<Packaging>
  labels: Table<Label>
  inventoryItems: Table<InventoryItem>
  // ... other tables
}

// Example: Adding a new material
await db.materials.add({
  name: "Citric Acid",
  category: "Acids",
  unit: "kg",
  // ... other properties
});

// Example: Querying with relationships
const materialsWithSuppliers = await db.materials
  .where("category").equals("Acids")
  .with({ supplierMaterials: "supplierMaterials" });

// Example: Reactive query that auto-updates the UI
const materials = useLiveQuery(() =>
  db.materials
    .where("category").equals("Acids")
    .toArray()
);
```

### Tech Stack

| Technology            | Purpose                                    |
| :-------------------- | :----------------------------------------- |
| **Next.js 15**        | React framework with App Router.           |
| **React 19**          | UI library with the latest features.       |
| **TypeScript**        | Type-safe development across the stack.    |
| **IndexedDB + Dexie** | High-performance client-side database.     |
| **Tailwind CSS**      | Utility-first styling.                     |
| **Radix UI**          | Accessible, unstyled component primitives. |
| **Recharts**          | Data visualization for analytics.          |
| **Vercel**            | Hosting and serverless deployment.         |

---

## 🎓 Key Learnings & Concepts Demonstrated

This project serves as a practical guide to several advanced frontend topics:

> **IndexedDB Mastery**
> Designed a fully relational data model with foreign keys, joins, and live queries — all within the browser using Dexie.js.

> **Reactive State Management**
> Built a self-updating UI using useLiveQuery, eliminating the need for heavy external state libraries.

> **Client-Side Architecture**
> Engineered a scalable offline-first system capable of storing 1GB+ of structured data directly in the browser.

> **Modern React Patterns**
> Implemented hooks, contexts, and modular components for clean, maintainable code.

> **UI/UX for Data-Intensive Apps**
> Focused on responsive layouts, accessibility, and smooth performance even with large datasets.

> **Deployment**
> Deployed production builds to Vercel with automatic optimization and preview deployments.

---

## 📁 Project Structure

```
costingwizard/
├── app/                   # Next.js app directory
│   ├── dashboard/         # Main dashboard views
│   ├── materials/         # Materials management
│   ├── recipes/           # Recipe system
│   └── planning/          # Production planning
│   └── ...                # Other feature modules
├── lib/
│   ├── db/               # IndexedDB setup & schema
│   ├── hooks/            # Custom React hooks
│   └── utils/            # Helper functions
└── components/           # Reusable UI components
```

---

## 🌐 Deployment

Deployed on **Vercel** with automatic deployments from the `main` branch. The platform provides:

- Zero-config deployment
- Automatic HTTPS and CDN
- Preview deployments for pull requests

---

## 📝 License

This project is licensed under the MIT License. Feel free to use it as a reference or starting point for your own applications.

---

## 🤝 Connect

Built by [Amritanshu Singh](https://github.com/Amritanshu1912) as a portfolio showcase.

Questions or feedback? Feel free to open an issue or reach out!

---

<div align="center">

🚀 **A demonstration that modern web apps don't always need a backend**

[⭐ Star this repo](https://github.com/Amritanshu1912/costingwizard) • [🔗 View Live Demo](https://your-app.vercel.app)

</div>
