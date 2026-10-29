export interface ILoginData {
    email: string;
    password: string;
}

export interface ISignupData {
    name: string;
    email: string;
    password: string;
}

export interface ILoginRes {
    message: string;
    data: string;
    user?: {
        _id: string;
        name: string;
        email: string;
        role: string;
    };
}

export interface IToken {
    _id: string;
    name: string;
    email?: string;
    role: string;
    exp: number;
}