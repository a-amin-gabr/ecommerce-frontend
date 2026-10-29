import { IProduct } from './product.model';

export interface ICartItem {
    _id?: string;
    productId: string;
    productDetails?: Partial<IProduct>;
    quantity: number;
    cartPrice: number;
    currentPrice: number;
    isPriceChanged: boolean;
    isUnavailable?: boolean;
    itemSubtotal: number;
}

export interface ICart {
    _id?: string;
    userId?: string;
    products: ICartItem[];
    hasPriceChange: boolean;
    totalQuantity: number;
    subtotal: number;
}

export interface ICartRes {
    message: string;
    data: ICart;
}
