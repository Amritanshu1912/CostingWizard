# 🧹 CostingWizard

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.14-38B2AC)](https://tailwindcss.com/)
[![IndexedDB](https://img.shields.io/badge/IndexedDB-Dexie-orange)](https://dexie.org/)

**Smart Manufacturing Cost Management for Cleaning Products**

_Streamline your production costs with intelligent recipe management, supplier optimization, and real-time analytics—all powered by IndexedDB for offline-first performance._

[🚀 Live Demo](#) • [📖 Documentation](#) • [🐛 Report Bug](https://github.com/your-repo/issues) • [✨ Request Feature](https://github.com/your-repo/issues)

![CostingWizard Dashboard](https://via.placeholder.com/800x400/1a1a1a/ffffff?text=CostingWizard+Dashboard+Preview)

</div>

---

## 🌟 What is CostingWizard?

CostingWizard is a modern, web-based manufacturing management system specifically designed for cleaning products manufacturers. Unlike traditional ERP systems that require complex server setups, CostingWizard runs entirely in your browser using **IndexedDB** for data storage—providing offline-first capabilities, instant performance, and zero infrastructure costs.

### 🎯 Key Highlights

- **📱 Browser-Native**: No servers, no databases, no installation—just open in your browser
- **💾 IndexedDB Powered**: Advanced client-side database with full CRUD operations
- **📊 Real-Time Analytics**: Interactive dashboards with cost analysis and production insights
- **🔄 Offline-First**: Work seamlessly without internet connection
- **🎨 Modern UI**: Beautiful, responsive interface built with Radix UI and Tailwind CSS
- **⚡ Fast Performance**: Optimized for large datasets with efficient data structures

---

## ✨ Features

### 🏭 Core Manufacturing Management

| Feature                     | Description                                                     | Status      |
| --------------------------- | --------------------------------------------------------------- | ----------- |
| **📦 Materials Management** | Track raw materials, suppliers, pricing, and availability       | ✅ Complete |
| **🧪 Recipe Management**    | Create and optimize product formulations with cost calculations | ✅ Complete |
| **📦 Packaging & Labels**   | Manage packaging options and labeling requirements              | ✅ Complete |
| **🏢 Supplier Management**  | Multi-supplier support with performance tracking                | ✅ Complete |
| **📅 Production Planning**  | Schedule batches and track material requirements                | ✅ Complete |
| **🛒 Procurement**          | Generate purchase orders and manage supplier relationships      | ✅ Complete |

### 📊 Analytics & Insights

- **💰 Cost Analysis**: Real-time cost breakdowns and profit margins
- **📈 Performance Metrics**: Production efficiency and quality scores
- **📊 Interactive Charts**: Visual representations using Recharts
- **🎯 Price Optimization**: Supplier comparison and cost optimization
- **📋 Inventory Tracking**: Stock levels and reorder alerts

### 💾 Advanced Data Management

- **🔄 Data Persistence**: Automatic saving with IndexedDB
- **📤 Export/Import**: Backup and restore capabilities
- **🔍 Data Search**: Fast querying across all tables
- **🔐 Data Integrity**: Type-safe operations with TypeScript
- **⚙️ Auto-save**: Configurable automatic data saving

---

## 🛠️ Technology Stack

### Frontend Framework

- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development

### UI & Styling

- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible, unstyled UI components
- **Lucide React** - Beautiful icon library
- **Geist Font** - Modern typography

### Database & State

- **IndexedDB + Dexie** - Client-side database wrapper
- **Dexie React Hooks** - Reactive database queries
- **Custom Hooks** - Efficient state management

### Charts & Data Visualization

- **Recharts** - Composable charting library
- **Custom Analytics** - Business-specific metrics

### Development Tools

- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Vercel Analytics** - Usage tracking

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **npm** or **pnpm**
- Modern web browser with IndexedDB support (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/costingwizard.git
   cd costingwizard
   ```

2. **Install dependencies**

   ```bash
   # Using pnpm (recommended)
   pnpm install

   # Or using npm
   npm install
   ```

3. **Start the development server**

   ```bash
   # Using pnpm
   pnpm dev

   # Or using npm
   npm run dev
   ```

4. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📖 Usage Guide

### 🏠 Dashboard Overview

The main dashboard provides:

- **Quick Stats**: Key metrics at a glance
- **Recent Materials**: Latest inventory updates
- **Quick Actions**: Fast access to common tasks
- **Production Overview**: Capacity utilization and performance

### 📦 Managing Materials

1. Navigate to **Materials** section
2. Add new materials with supplier information
3. Set pricing, availability, and tax rates
4. View analytics and price comparisons

### 🧪 Creating Recipes

1. Go to **Recipes** section
2. Design formulations with ingredient ratios
3. Calculate costs automatically
4. Compare different recipe variants

### 📅 Production Planning

1. Access **Planning** section
2. Create production batches
3. Check material availability
4. Generate procurement requirements

---

## 💾 IndexedDB Architecture

CostingWizard leverages **IndexedDB** through the Dexie library for robust, client-side data management:

### Database Schema

```typescript
CostingWizardDB {
  categories: Table<Category>
  materials: Table<Material>
  suppliers: Table<Supplier>
  supplierMaterials: Table<SupplierMaterial>
  recipes: Table<Recipe>
  recipeVariants: Table<RecipeVariant>
  recipeIngredients: Table<RecipeIngredient>
  products: Table<Product>
  productionPlans: Table<ProductionPlanExtended>
  purchaseOrders: Table<PurchaseOrder>
  packaging: Table<Packaging>
  supplierPackaging: Table<SupplierPackaging>
  labels: Table<Label>
  supplierLabels: Table<SupplierLabel>
  inventoryItems: Table<InventoryItem>
  inventoryTransactions: Table<InventoryTransaction>
  transportationCosts: Table<TransportationCost>
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
```

---

## 📊 Sample Data

The application comes pre-loaded with sample data for:

- **🏭 7 Material Categories**: Acids, Bases, Colors, Thickeners, Salts, Oils, Other
- **👥 3 Sample Suppliers**: ChemCorp, ColorTech, BulkChem Traders
- **📦 150+ Raw Materials**: Complete chemical inventory
- **🧪 Product Recipes**: Floor cleaner, bathroom cleaner, glass cleaner
- **📅 Production Plans**: Sample manufacturing schedules

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm run lint`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style

- **TypeScript**: Strict type checking enabled
- **ESLint**: Airbnb config with React rules
- **Prettier**: Automated code formatting
- **Conventional Commits**: Structured commit messages

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Dexie** for the excellent IndexedDB wrapper
- **Radix UI** for accessible component primitives
- **Tailwind CSS** for the amazing utility-first approach
- **Vercel** for hosting and analytics
- **Lucide** for the beautiful icons

---

## 📞 Support

- **📧 Email**: support@costingwizard.com
- **🐛 Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **📖 Documentation**: [Wiki](https://github.com/your-repo/wiki)

---

<div align="center">

**Made with ❤️ for manufacturers who value efficiency and simplicity**

[⬆️ Back to Top](#-costingwizard)

</div>
