export interface ICategory {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    isActive?: boolean;
    isDeleted?: boolean;
}

export interface ISubcategory {
    _id: string;
    categoryId: string | { _id: string; name: string; slug: string };
    name: string;
    slug: string;
    description?: string;
    isActive?: boolean;
    isDeleted?: boolean;
}

export interface ICategoriesRes {
    message: string;
    data: ICategory[];
}

export interface ISubcategoriesRes {
    message: string;
    data: ISubcategory[];
}
