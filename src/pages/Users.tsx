import { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, toggleUserStatus } from '../services/userService';
import type { User, CreateUserData } from '../services/userService';
import Modal from '../components/Modal';
import { useSnackbar } from '../context/SnackbarContext';
import type { ApiError } from '../types/api';

const Users = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const { showSuccess, showError } = useSnackbar();
    const [userToToggle, setUserToToggle] = useState<User | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const [formData, setFormData] = useState<CreateUserData>({
        name: '',
        email: '',
        password: '',
        role: 'user'
    });

    const [formTouched, setFormTouched] = useState({
        name: false,
        email: false,
        password: false,
        role: false
    });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await getUsers();
                setUsers(data);
                setError(null);
            } catch (err) {
                setError('Error al cargar los usuarios');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setFormTouched(prev => ({
            ...prev,
            [name]: true
        }));
    };

    const isFormValid = () => {
        if (isEditMode) {
            return formData.name.trim() !== '' &&
                formData.email.trim() !== '' &&
                formData.role.trim() !== '';
        }
        return formData.name.trim() !== '' &&
            formData.email.trim() !== '' &&
            formData.password.trim() !== '' &&
            formData.role.trim() !== '';
    };

    const handleEditClick = (user: User) => {
        setUserToEdit(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '', // No incluimos la contraseña en edición
            role: user.role
        });
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleToggleStatus = async (user: User) => {
        setUserToToggle(user);
        setIsConfirmModalOpen(true);
    };

    const confirmToggleStatus = async () => {
        if (!userToToggle) return;

        try {
            const updatedUser = await toggleUserStatus(userToToggle._id, !userToToggle.isActive);
            setUsers(users.map(u =>
                u._id === userToToggle._id ? updatedUser : u
            ));
            showSuccess(`Usuario ${updatedUser.isActive ? 'activado' : 'desactivado'} exitosamente`);
        } catch (err) {
            if (err && typeof err === 'object' && 'response' in err) {
                const apiError = (err as any).response?.data as ApiError;
                showError(apiError?.message || 'Error al cambiar el estado del usuario');
            } else {
                showError('Error al cambiar el estado del usuario');
            }
            console.error('Error:', err);
        } finally {
            setIsConfirmModalOpen(false);
            setUserToToggle(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (isEditMode && userToEdit) {
                const { password, ...updateData } = formData;
                const updatedUser = await updateUser(userToEdit._id, updateData);
                setUsers(users.map(u =>
                    u._id === userToEdit._id ? updatedUser : u
                ));
                showSuccess('Usuario actualizado exitosamente');
            } else {
                const newUser = await createUser(formData);
                setUsers(prev => [...prev, newUser]);
                showSuccess('Usuario creado exitosamente');
            }

            setIsModalOpen(false);
            resetForm();
        } catch (err) {
            if (err && typeof err === 'object' && 'response' in err) {
                const apiError = (err as any).response?.data as ApiError;
                showError(apiError?.message || `Error al ${isEditMode ? 'actualizar' : 'crear'} el usuario`);
            } else {
                showError(`Error al ${isEditMode ? 'actualizar' : 'crear'} el usuario`);
            }
            console.error('Error:', err);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'user'
        });
        setFormTouched({
            name: false,
            email: false,
            password: false,
            role: false
        });
        setIsEditMode(false);
        setUserToEdit(null);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Usuarios</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Nuevo Usuario
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
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
                                    Email
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                    Rol
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                    Estado
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50 transition-colors duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => handleEditClick(user)}
                                                className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                                                title="Editar usuario"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(user)}
                                                className={`${user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} transition-colors duration-200`}
                                                title={user.isActive ? 'Desactivar usuario' : 'Activar usuario'}
                                            >
                                                {user.isActive ? (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin'
                                            ? 'bg-purple-100 text-purple-800'
                                            : 'bg-green-100 text-green-800'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {user.isActive ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Crear/Editar Usuario */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    resetForm();
                }}
                title={isEditMode ? "Editar Usuario" : "Nuevo Usuario"}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
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
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`block w-full px-4 py-3 rounded-lg border-2 ${formTouched.email && !formData.email.trim()
                                ? 'border-red-300 focus:border-red-400'
                                : 'border-gray-200 focus:border-indigo-400'
                                } focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-colors duration-200 bg-gray-50`}
                            required
                        />
                        {formTouched.email && !formData.email.trim() && (
                            <p className="mt-1 text-sm text-red-500">El email es requerido</p>
                        )}
                    </div>

                    {!isEditMode && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Contraseña <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className={`block w-full px-4 py-3 rounded-lg border-2 ${formTouched.password && !formData.password.trim()
                                    ? 'border-red-300 focus:border-red-400'
                                    : 'border-gray-200 focus:border-indigo-400'
                                    } focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-colors duration-200 bg-gray-50`}
                                required={!isEditMode}
                            />
                            {formTouched.password && !formData.password.trim() && !isEditMode && (
                                <p className="mt-1 text-sm text-red-500">La contraseña es requerida</p>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rol <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            className="block w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-indigo-400 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-colors duration-200 bg-gray-50"
                            required
                        >
                            <option value="user">Usuario</option>
                            <option value="admin">Administrador</option>
                        </select>
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
                            disabled={!isFormValid()}
                            className={`px-6 py-2.5 text-sm font-medium text-white border-2 border-transparent rounded-lg transition-all duration-200 shadow-sm hover:shadow ${isFormValid()
                                ? 'bg-indigo-600 hover:bg-indigo-700'
                                : 'bg-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {isEditMode ? 'Guardar Cambios' : 'Crear Usuario'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal de Confirmación */}
            <Modal
                isOpen={isConfirmModalOpen}
                onClose={() => {
                    setIsConfirmModalOpen(false);
                    setUserToToggle(null);
                }}
                title={`${userToToggle?.isActive ? 'Desactivar' : 'Activar'} Usuario`}
            >
                <div className="space-y-6">
                    <p className="text-gray-700">
                        ¿Estás seguro que deseas {userToToggle?.isActive ? 'desactivar' : 'activar'} al usuario{' '}
                        <span className="font-semibold">{userToToggle?.name}</span>?
                    </p>
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => {
                                setIsConfirmModalOpen(false);
                                setUserToToggle(null);
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={confirmToggleStatus}
                            className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${userToToggle?.isActive
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-green-600 hover:bg-green-700'
                                }`}
                        >
                            {userToToggle?.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Users; 