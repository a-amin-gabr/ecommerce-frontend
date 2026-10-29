export interface IProduct {
    _id: string;
    name: string;
    title?: string;
    price: number;
    desc?: string;
    description?: string;
    stock: number;
    slug: string;
    imgURL: string;
    categoryId?: {
        _id: string;
        name: string;
        slug: string;
    } | string;
    subcategoryId?: {
        _id: string;
        name: string;
        slug: string;
    } | string;
    isActive?: boolean;
    isDeleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface IProductsListRes {
    message: string;
    data: IProduct[];
}

export interface IProductRes {
    message: string;
    data: IProduct;
}