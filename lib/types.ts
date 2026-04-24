// User types
export type UserRole = 'admin' | 'superadmin'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

// Product types
export interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  description?: string
  image?: string
}

// Category types
export interface Category {
  id: string
  name: string
  icon: string
  slug: string
  productCount: number
}

// Order types
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface Order {
  id: string
  customerId: string
  customerName: string
  vendorId: string
  vendorName: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  createdAt: string
}

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
}

// Customer types
export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  ordersCount: number
  createdAt: string
}

// Vendor types
export interface Vendor {
  id: string
  name: string
  email: string
  city: string
  status: 'active' | 'inactive'
  createdAt: string
}

// Dashboard metrics
export interface DashboardMetrics {
  totalOrders: number
  totalRevenue: number
  activeCustomers: number
  totalVendors: number
  ordersGrowth: string
  revenueGrowth: string
  customersGrowth: string
  vendorsGrowth: string
}

// Report types
export interface Report {
  id: string
  type: string
  date: string
  status: 'complete' | 'processing' | 'failed'
}

// Backup types
export interface Backup {
  id: string
  date: string
  size: string
  status: 'complete' | 'processing' | 'failed'
}
