export interface ITestimonial {
    _id?: string;
    userId?: string | { _id: string; name: string; email: string };
    userName: string;
    rating: number;
    comment: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt?: string;
}

export interface ITestimonialRes {
    message: string;
    data: ITestimonial;
}

export interface ITestimonialsListRes {
    message: string;
    data: ITestimonial[];
}
