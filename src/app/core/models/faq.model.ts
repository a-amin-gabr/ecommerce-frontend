export interface IFAQ {
    _id?: string;
    question: string;
    answer: string;
    category: string;
    order?: number;
    createdAt?: string;
}

export interface IFAQRes {
    message: string;
    data: IFAQ;
}

export interface IFAQLIstRes {
    message: string;
    data: IFAQ[];
}
