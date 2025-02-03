import api from './api';

export interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
}

export interface CreateProductData {
    name: string;
    description: string;
    price: number;
    stock: number;
}

export interface UpdateProductData extends CreateProductData {
    _id: string;
}

export const getProducts = async () => {
    const response = await api.get<Product[]>('/products');
    return response.data;
};

export const createProduct = async (productData: CreateProductData) => {
    const response = await api.post<Product>('/products', productData);
    return response.data;
};

export const deleteProduct = async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
};

export const updateProduct = async (id: string, productData: CreateProductData) => {
    const response = await api.patch<Product>(
        `/products/${id}`,
        productData
    );
    return response.data;
};

export const updateProductStock = async (id: string, stockChange: number, currentStock: number) => {
    const response = await api.patch<Product>(
        `/products/${id}`,
        { stock: currentStock + stockChange }
    );
    return response.data;
}; 