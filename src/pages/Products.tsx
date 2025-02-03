import { useState, useEffect } from 'react';
import { getProducts, createProduct, deleteProduct, updateProduct, updateProductStock } from '../services/productService';
import type { Product, CreateProductData } from '../services/productService';
import Modal from '../components/Modal';
import { useSnackbar } from '../context/SnackbarContext';
import { useAuth } from '../context/AuthContext';
import type { ApiError } from '../types/api';
import PageTransition from '../components/PageTransition';

const Products = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<CreateProductData>({
        name: '',
        description: '',
        price: NaN,
        stock: NaN
    });
    const [formError, setFormError] = useState<string | null>(null);
    const [formTouched, setFormTouched] = useState({
        name: false,
        description: false,
        price: false,
        stock: false
    });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const { showSuccess, showError } = useSnackbar();
    const [isEditMode, setIsEditMode] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);
    const { user } = useAuth();
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [productToUpdateStock, setProductToUpdateStock] = useState<Product | null>(null);
    const [stockChange, setStockChange] = useState<string>('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProducts();
                setProducts(data);
                setError(null);
            } catch (err) {
                setError('Error al cargar los productos');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const isFormValid =
        formData.name.trim() !== '' &&
        formData.description.trim() !== '' &&
        formData.price > 0 &&
        formData.stock >= 0;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' || name === 'stock' ? Number(value) : value
        }));
        setFormTouched(prev => ({
            ...prev,
            [name]: true
        }));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === '-' || e.key === '+' || e.key === 'e') {
            e.preventDefault();
        }
    };

    const handleEditClick = (product: Product) => {
        setProductToEdit(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock
        });
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        try {
            if (isEditMode && productToEdit) {
                const updatedProduct = await updateProduct(productToEdit._id, formData);
                setProducts(products.map(p =>
                    p._id === productToEdit._id ? updatedProduct : p
                ));
                showSuccess('Producto actualizado exitosamente');
            } else {
                const newProduct = await createProduct(formData);
                setProducts(prev => [...prev, newProduct]);
                showSuccess('Producto creado exitosamente');
            }

            setIsModalOpen(false);
            resetForm();
        } catch (err) {
            if (err && typeof err === 'object' && 'response' in err) {
                const apiError = (err as any).response?.data as ApiError;
                showError(apiError?.message || `Error al ${isEditMode ? 'actualizar' : 'crear'} el producto`);
            } else {
                showError(`Error al ${isEditMode ? 'actualizar' : 'crear'} el producto`);
            }
            console.error('Error:', err);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: NaN,
            stock: NaN
        });
        setFormTouched({
            name: false,
            description: false,
            price: false,
            stock: false
        });
        setFormError(null);
        setIsEditMode(false);
        setProductToEdit(null);
    };

    const handleDeleteClick = (product: Product) => {
        setProductToDelete(product);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!productToDelete) return;

        try {
            await deleteProduct(productToDelete._id);
            setProducts(products.filter(p => p._id !== productToDelete._id));
            setIsDeleteModalOpen(false);
            showSuccess('Producto eliminado exitosamente');
        } catch (err) {
            if (err && typeof err === 'object' && 'response' in err) {
                const apiError = (err as any).response?.data as ApiError;
                showError(apiError?.message || 'Error al eliminar el producto');
            } else {
                showError('Error al eliminar el producto');
            }
            console.error('Error:', err);
        }
    };

    const handleStockClick = (product: Product) => {
        setProductToUpdateStock(product);
        setStockChange('');
        setIsStockModalOpen(true);
    };

    const handleStockUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productToUpdateStock || !stockChange) return;

        const numberChange = parseInt(stockChange);

        if (productToUpdateStock.stock + numberChange < 0) {
            showError('No puede reducir el stock por debajo de 0');
            return;
        }

        try {
            const updatedProduct = await updateProductStock(
                productToUpdateStock._id,
                numberChange,
                productToUpdateStock.stock
            );
            setProducts(products.map(p =>
                p._id === productToUpdateStock._id ? updatedProduct : p
            ));
            showSuccess(`Stock ${numberChange >= 0 ? 'aumentado' : 'reducido'} en ${Math.abs(numberChange)} unidades`);
            setIsStockModalOpen(false);
            setProductToUpdateStock(null);
            setStockChange('');
        } catch (err) {
            if (err && typeof err === 'object' && 'response' in err) {
                const apiError = (err as any).response?.data as ApiError;
                showError(apiError?.message || 'Error al actualizar el stock');
            } else {
                showError('Error al actualizar el stock');
            }
            console.error('Error:', err);
        }
    };

    if (loading) {
        return (
            <PageTransition>
                <div className="flex justify-center items-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            </PageTransition>
        );
    }

    if (error) {
        return (
            <PageTransition>
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            </PageTransition>
        );
    }

    return (
        <PageTransition>
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Productos</h1>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="hidden sm:inline">Nuevo Producto</span>
                        <span className="sm:hidden">Nuevo</span>
                    </button>
                </div>

                {/* Vista de escritorio */}
                <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-900">
                                <tr>
                                    <th scope="col" className="w-20 px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                        Acciones
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                        Nombre
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                        Descripción
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                        Precio
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                        Stock
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {products.map((product) => (
                                    <tr key={product._id} className="hover:bg-gray-50 transition-colors duration-200">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-3">
                                                {user?.role === 'admin' ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleEditClick(product)}
                                                            className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                                                            title="Editar producto"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(product)}
                                                            className="text-red-600 hover:text-red-900 transition-colors duration-200"
                                                            title="Eliminar producto"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => handleStockClick(product)}
                                                        className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                                                        title="Ajustar stock"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-500 line-clamp-2">{product.description}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900">
                                                ${new Intl.NumberFormat('es-MX', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                }).format(product.price)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${product.stock === 0
                                                ? 'bg-red-200 text-red-900'
                                                : product.stock >= 50
                                                    ? 'bg-green-100 text-green-800'
                                                    : product.stock > 10
                                                        ? 'bg-orange-100 text-orange-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                {product.stock === 0 ? 'Sin stock' : `${product.stock} unidades`}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Vista móvil/tablet */}
                <div className="md:hidden space-y-4">
                    {products.map((product) => (
                        <div key={product._id} className="bg-white rounded-lg shadow p-4 border border-gray-200">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                                </div>
                                <div className="flex space-x-2">
                                    {user?.role === 'admin' ? (
                                        <>
                                            <button
                                                onClick={() => handleEditClick(product)}
                                                className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                                                title="Editar producto"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(product)}
                                                className="text-red-600 hover:text-red-900 transition-colors duration-200"
                                                title="Eliminar producto"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => handleStockClick(product)}
                                            className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                                            title="Ajustar stock"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <span className="text-sm text-gray-500">Precio</span>
                                    <p className="text-sm font-semibold text-gray-900">
                                        ${new Intl.NumberFormat('es-MX', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        }).format(product.price)}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Stock</span>
                                    <span className={`mt-1 px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${product.stock === 0
                                        ? 'bg-red-200 text-red-900'
                                        : product.stock >= 50
                                            ? 'bg-green-100 text-green-800'
                                            : product.stock > 10
                                                ? 'bg-orange-100 text-orange-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                        {product.stock === 0 ? 'Sin stock' : `${product.stock} unidades`}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <Modal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        resetForm();
                    }}
                    title={isEditMode ? "Editar Producto" : "Nuevo Producto"}
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {formError && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                                {formError}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`block w-full px-4 py-3 rounded-lg border-2 ${formTouched.name && !formData.name.trim()
                                    ? 'border-red-300 focus:border-red-400'
                                    : 'border-gray-200 focus:border-indigo-400'
                                    } focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-colors duration-200 bg-gray-50`}
                                required
                            />
                            {formTouched.name && !formData.name.trim() && (
                                <p className="mt-1 text-sm text-red-500">El nombre es requerido</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Descripción <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={3}
                                className={`block w-full px-4 py-3 rounded-lg border-2 ${formTouched.description && !formData.description.trim()
                                    ? 'border-red-300 focus:border-red-400'
                                    : 'border-gray-200 focus:border-indigo-400'
                                    } focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-colors duration-200 bg-gray-50 resize-none`}
                                required
                            />
                            {formTouched.description && !formData.description.trim() && (
                                <p className="mt-1 text-sm text-red-500">La descripción es requerida</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Precio <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price || ''}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyDown}
                                    min="0"
                                    step="0.01"
                                    className={`block w-full pl-8 pr-4 py-3 rounded-lg border-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${formTouched.price && formData.price <= 0
                                        ? 'border-red-300 focus:border-red-400'
                                        : 'border-gray-200 focus:border-indigo-400'
                                        } focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-colors duration-200 bg-gray-50`}
                                    required
                                />
                            </div>
                            {formTouched.price && formData.price <= 0 && (
                                <p className="mt-1 text-sm text-red-500">El precio debe ser mayor a 0</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Stock <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock || ''}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                min="0"
                                className={`block w-full px-4 py-3 rounded-lg border-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${formTouched.stock && formData.stock < 0
                                    ? 'border-red-300 focus:border-red-400'
                                    : 'border-gray-200 focus:border-indigo-400'
                                    } focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-colors duration-200 bg-gray-50`}
                                required
                            />
                            {formTouched.stock && formData.stock < 0 && (
                                <p className="mt-1 text-sm text-red-500">El stock no puede ser negativo</p>
                            )}
                        </div>
                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    resetForm();
                                }}
                                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={!isFormValid}
                                className={`px-6 py-2.5 text-sm font-medium text-white border-2 border-transparent rounded-lg transition-all duration-200 shadow-sm hover:shadow ${isFormValid
                                    ? 'bg-indigo-600 hover:bg-indigo-700'
                                    : 'bg-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {isEditMode ? 'Guardar Cambios' : 'Crear Producto'}
                            </button>
                        </div>
                    </form>
                </Modal>

                <Modal
                    isOpen={isDeleteModalOpen}
                    onClose={() => {
                        setIsDeleteModalOpen(false);
                        setProductToDelete(null);
                    }}
                    title="Confirmar Eliminación"
                >
                    <div className="space-y-6">
                        <p className="text-gray-700">
                            ¿Está seguro que desea eliminar el producto <span className="font-semibold">{productToDelete?.name}</span>?
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setProductToDelete(null);
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteConfirm}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </Modal>

                <Modal
                    isOpen={isStockModalOpen}
                    onClose={() => {
                        setIsStockModalOpen(false);
                        setProductToUpdateStock(null);
                        setStockChange('');
                    }}
                    title="Ajustar Stock"
                >
                    <form onSubmit={handleStockUpdate} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Producto: <span className="font-semibold">{productToUpdateStock?.name}</span>
                            </label>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Stock actual: <span className="font-semibold">{productToUpdateStock?.stock}</span>
                            </label>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cambio de stock <span className="text-red-500">*</span>
                                    <span className="text-gray-500 ml-1">(use números negativos para reducir)</span>
                                </label>
                                <input
                                    type="number"
                                    value={stockChange}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        const numberValue = parseInt(value);

                                        if (value === '') {
                                            setStockChange('');
                                            return;
                                        }

                                        if (productToUpdateStock && numberValue < -productToUpdateStock.stock) {
                                            return;
                                        }

                                        setStockChange(value);
                                    }}
                                    className="block w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-indigo-400 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-colors duration-200 bg-gray-50"
                                    step="1"
                                    placeholder="Ingrese la cantidad"
                                    required
                                />
                                {productToUpdateStock && (
                                    <p className="mt-1 text-sm text-gray-500">
                                        Stock resultante: {productToUpdateStock.stock + (parseInt(stockChange) || 0)} unidades
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsStockModalOpen(false);
                                    setProductToUpdateStock(null);
                                    setStockChange('');
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={!stockChange || parseInt(stockChange) === 0}
                                className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-lg ${!stockChange || parseInt(stockChange) === 0
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                            >
                                Actualizar Stock
                            </button>
                        </div>
                    </form>
                </Modal>
            </div>
        </PageTransition>
    );
};

export default Products; 