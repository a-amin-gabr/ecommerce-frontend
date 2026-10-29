import { IProduct } from './product.model';
import { IOrder } from './order.model';
import { ITestimonial } from './testimonial.model';

export interface IDashboardStats {
    metrics: {
        outOfStockCount: number;
        lowStockCount: number;
        pendingTestimonialsCount: number;
        pendingOrdersCount: number;
        todayOrdersCount: number;
        totalOrdersCount: number;
        totalUsersCount: number;
        totalProductsCount: number;
        totalCategoriesCount: number;
        totalRevenue: number;
    };
    alerts: {
        outOfStockProducts: IProduct[];
        lowStockProducts: IProduct[];
        pendingTestimonials: ITestimonial[];
    };
    recentOrders: IOrder[];
    pendingOrders: IOrder[];
}

export interface IDashboardRes {
    message: string;
    data: IDashboardStats;
}
