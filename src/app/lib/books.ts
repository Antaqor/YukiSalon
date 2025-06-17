// app/types/book.ts (эсвэл src/types/book.ts)

export interface Book {
    _id: string;
    title: string;
    author: string;
    description?: string;
    price?: number;
    saleActive?: boolean;
    salePrice?: number;
    pdfUrl: string;
    coverImageUrl?: string;
    createdAt?: string;
    updatedAt?: string;
}
