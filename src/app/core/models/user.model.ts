export interface IAddress {
    _id?: string;
    title: string;
    addressData: string;
    city: string;
    isDefault: boolean;
}

export interface IUser {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    isBlocked?: boolean;
    phone?: string;
    addresses?: IAddress[];
    createdAt?: string;
}

export interface IUserListRes {
    message: string;
    data: IUser[];
}

export interface IUserRes {
    message: string;
    data: IUser;
}