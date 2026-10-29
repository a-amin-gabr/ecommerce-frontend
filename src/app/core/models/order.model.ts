export type OrderStatus =
    | 'pending'
    | 'preparing'
    | 'shipped'
    | 'delivered'
    | 'received'
    | 'cancelled by admin'
    | 'cancelled by client'
    | 'rejected'
    | 'refunded';

export interface IAddressSnapshot {
    title: string;
    addressData: string;
    city: string;
}

export interface IOrderItem {
    _id?: string;
    productId: string;
    name: string;
    imgURL?: string;
    quantity: number;
    price: number;
}

export interface IOrder {
    _id: string;
    status: OrderStatus;
    userId: string | { _id: string; name: string; email: string; phone?: string };
    addressId?: string;
    addressSnapshot: IAddressSnapshot;
    mobileSnapshot: string;
    timestamp: string;
    date: string;
    orderItems: IOrderItem[];
    totalAmount: number;
    paymentMethod: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface IOrderRes {
    message: string;
    data: IOrder;
}

export interface IOrdersListRes {
    message: string;
    data: IOrder[];
}
