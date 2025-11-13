# 🧹 CostingWizard

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.14-38B2AC)](https://tailwindcss.com/)
[![IndexedDB](https://img.shields.io/badge/IndexedDB-Dexie-orange)](https://dexie.org/)

**Manufacturing Cost Management — Zero Backend Required**

_A showcase of modern frontend development using only IndexedDB for data persistence. No traditional databases, no backend servers, just pure client-side excellence._

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

---

## 🎯 Key Highlights

- **📱 Browser-Native**: No servers, no databases, no installation—just open in your browser
- **💾 IndexedDB Powered**: Advanced client-side database with full CRUD operations
- **📊 Real-Time Analytics**: Interactive dashboards with cost analysis and production insights
- **🔄 Offline-First**: Work seamlessly without internet connection
- **🎨 Modern UI**: Beautiful, responsive interface built with Radix UI and Tailwind CSS
- **⚡ Fast Performance**: Optimized for large datasets with efficient data structures

### ✨ Features

**🏭 Complete Manufacturing Suite**

| Feature                     | Description                                                     | Status      |
| --------------------------- | --------------------------------------------------------------- | ----------- |
| **📦 Materials Management** | Track raw materials, suppliers, pricing, and availability       | ✅ Complete |
| **🧪 Recipe Management**    | Create and optimize product formulations with cost calculations | ✅ Complete |
| **📦 Packaging & Labels**   | Manage packaging options and labeling requirements              | ✅ Complete |
| **🏢 Supplier Management**  | Multi-supplier support with performance tracking                | ✅ Complete |
| **📅 Production Planning**  | Schedule batches and track material requirements                | ✅ Complete |
| **🛒 Procurement**          | Generate purchase orders and manage supplier relationships      | ✅ Complete |

**💾 IndexedDB-Powered**

- Stores 1GB+ of data in browser
- Full CRUD operations without backend
- Complex relational queries
- Automatic data persistence
- Import/Export and Auto-save capabilities

---

## 🗄️ Database Architecture

CostingWizard leverages **IndexedDB** through the Dexie library for robust, client-side data management:

### Database Schema

```typescript
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
```

### Key Benefits

- **🚀 Performance**: Sub-millisecond query times
- **💾 Storage**: Up to 1GB+ of data in browser
- **🔄 Synchronization**: Easy backup/restore
- **🔍 Advanced Queries**: Complex filtering and sorting
- **📱 Offline Support**: Full functionality without network

### Data Operations

```typescript
// Example: Adding a new material
await db.materials.add({
  name: "Citric Acid",
  category: "Acids",
  unit: "kg",
  // ... other properties
});

// Example: Querying with relationships
const materialsWithSuppliers = await db.materials
  .where("category")
  .equals("Acids")
  .with({ supplierMaterials: "supplierMaterials" });

// Reactive Data Query that auto-updates UI
const materials = useLiveQuery(() =>
  db.materials
    .where("category")
    .equals("Acids")
    .with({ supplierMaterials: "supplierMaterials" })
    .toArray()
);
```

---

## 🚀 Quick Start

### Try It Live

👉 **[Open Live Demo](https://your-app.vercel.app)**

The app includes sample data (150+ materials, 3 suppliers, production recipes) so you can explore immediately.

### Run Locally

```bash
# Clone and install
git clone https://github.com/your-username/costingwizard.git
cd costingwizard
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎯 Technical Highlights

### Why This Project Stands Out

**1. No Backend Dependency**

- Traditional apps need servers, databases, APIs
- This runs 100% in the browser
- Data persists across sessions using IndexedDB

**2. Complex Data Relationships**

- Foreign keys and joins without SQL
- Many-to-many relationships
- Aggregations and calculations
- All handled client-side

**3. Real-World Application**

- Not a simple todo app
- Manages real manufacturing workflows
- Handles complex business logic
- Production-ready features

**4. Performance Optimized**

- Sub-millisecond queries
- Lazy loading and pagination
- Efficient re-rendering
- Handles large datasets

**5. Modern Development Practices**

- TypeScript for type safety
- Component-driven architecture
- Responsive design
- Accessible UI components

---

## 📊 What You Can Do

- **Manage Materials**: Track 150+ raw materials with pricing, suppliers, and availability
- **Create Recipes**: Build product formulas with automatic cost calculations
- **Plan Production**: Schedule batches and check material requirements
- **Compare Suppliers**: Analyze pricing across multiple vendors
- **Track Inventory**: Monitor stock levels and movements
- **Generate Reports**: View analytics and cost breakdowns

All data is stored locally in your browser and persists across sessions.

---

## 🛠️ Built With

| Technology        | Purpose                         |
| ----------------- | ------------------------------- |
| Next.js 15        | React framework with App Router |
| React 19          | UI library with latest features |
| TypeScript        | Type-safe development           |
| IndexedDB + Dexie | Client-side database            |
| Tailwind CSS      | Utility-first styling           |
| Radix UI          | Accessible components           |
| Recharts          | Data visualization              |
| Vercel            | Hosting & deployment            |

---

## 📁 Project Structure

```
costingwizard/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Main dashboard views
│   ├── materials/         # Materials management
│   ├── recipes/           # Recipe system
│   └── planning/          # Production planning
├── lib/
│   ├── db/               # IndexedDB setup & schema
│   ├── hooks/            # Custom React hooks
│   └── utils/            # Helper functions
└── components/           # Reusable UI components
```

---

## 🎓 Learning Points

This project demonstrates:

- **IndexedDB Mastery**: Complex queries, transactions, and relationships
- **State Management**: Reactive data with Dexie hooks
- **TypeScript**: Full type safety across the application
- **Modern React**: Hooks, context, and component patterns
- **UI/UX**: Responsive design with Tailwind and Radix
- **Performance**: Optimization for large datasets
- **Deployment**: Production build on Vercel

---

## 🌐 Deployment

Deployed on **Vercel** with automatic deployments from GitHub:

- ✅ Zero-config deployment
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Preview deployments for PRs

---

## 📝 License

MIT License - feel free to use this project as a reference or starting point for your own applications.

---

## 🤝 Connect

Built by [Amritanshu Singh](https://github.com/Amritanshu1912) as a portfolio showcase.

Questions or feedback? Feel free to open an issue or reach out!

---

<div align="center">

**A demonstration that modern web apps don't always need a backend** 🚀

[⭐ Star this repo](https://github.com/Amritanshu1912/costingwizard) • [🔗 View Live Demo](https://your-app.vercel.app)

</div>
