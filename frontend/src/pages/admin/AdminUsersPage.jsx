import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import ConfirmationModal from '../../components/ConfirmationModal';

// Debounce hook for search
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

const AdminUsersPage = () => {
    const { token } = useAuth();

    // Data State
    const [users, setUsers] = useState([]);
    const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filter State
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const debouncedSearch = useDebounce(searchTerm, 500);

    // UX State
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    // Edit/Create State
    const [editingUser, setEditingUser] = useState(null);
    const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, success, error
    const API_URL = import.meta.env.VITE_API_URL;

    // Fetch Users
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page,
                limit: 10,
                search: debouncedSearch,
                role: roleFilter,
                status: statusFilter
            });

            const res = await fetch(`${API_URL}/users?${query}`, {
                headers: { 'x-auth-token': token }
            });

            const payload = await res.json();

            if (res.ok) {
                // Defensive: Support both new {data, meta} and old [array] formats
                if (Array.isArray(payload)) {
                    setUsers(payload); // Fallback for transition
                    setMeta({ page: 1, totalPages: 1, total: payload.length });
                } else {
                    setUsers(payload.users || payload.data);
                    setMeta({
                        page: payload.currentPage || payload.meta?.page,
                        totalPages: payload.totalPages || payload.meta?.totalPages,
                        total: payload.meta?.total || 100 // Fallback
                    });
                }
            } else {
                setError(payload.message || 'Error cargando usuarios');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    }, [token, page, debouncedSearch, roleFilter, statusFilter, API_URL]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Handlers
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setPage(1); // Reset to page 1 on search
    };

    const confirmDelete = (user) => {
        setUserToDelete(user);
        setDeleteModalOpen(true);
    };

    const executeDelete = async () => {
        if (!userToDelete) return;
        try {
            const res = await fetch(`${API_URL}/users/${userToDelete.id}`, {
                method: 'DELETE', // Soft delete by default now
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                fetchUsers();
                setDeleteModalOpen(false);
                setUserToDelete(null);
            } else {
                alert('Error al eliminar');
            }
        } catch (err) {
            alert('Error de conexión');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaveStatus('saving');

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        // Remove 'active' boolean logic, rely on 'status'

        const method = editingUser ? 'PUT' : 'POST';
        const url = editingUser ? `${API_URL}/users/${editingUser.id}` : `${API_URL}/users`;

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                setSaveStatus('success');
                setTimeout(() => {
                    setSaveStatus('idle');
                    setModalOpen(false);
                    fetchUsers();
                }, 1500); // Wait for success animation
            } else {
                setSaveStatus('error');
                setTimeout(() => setSaveStatus('idle'), 3000);
            }
        } catch (err) {
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
    };

    // State for password visibility
    const [showPassword, setShowPassword] = useState(false);

    // ... (existing code)

    const openEditModal = (user = null) => {
        setEditingUser(user);
        setSaveStatus('idle');
        setShowPassword(false); // Reset password visibility
        setModalOpen(true);
    };

    // ... (existing code)

    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña {editingUser && '(Dejar vacío para no cambiar)'}</label>
        <div className="relative">
            <input
                name="password"
                type={showPassword ? "text" : "password"}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-[#008a60] focus:border-[#008a60] transition-shadow pr-10"
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-[calc(50%-4px)] text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
                {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                )}
            </button>
        </div>
    </div>

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-700';
            case 'inactive': return 'bg-red-100 text-red-700';
            case 'deleted': return 'bg-gray-100 text-gray-500 line-through';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'active': return 'Activo';
            case 'inactive': return 'Inactivo';
            case 'deleted': return 'Eliminado';
            default: return status || 'Desconocido';
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Usuarios</h2>
                    <p className="text-gray-500 text-sm">Administra roles, accesos y crea nuevas cuentas.</p>
                </div>
                <button
                    onClick={() => openEditModal()}
                    className="bg-[#008a60] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#007a55] transition-colors flex items-center gap-2 shadow-sm"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    Crear Usuario
                </button>
            </div>

            {/* Toolbar: Search & Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#008a60] focus:border-transparent outline-none text-sm"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <select
                        value={roleFilter}
                        onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:ring-2 focus:ring-[#008a60] focus:border-transparent outline-none cursor-pointer"
                    >
                        <option value="all">Rol: Todos</option>
                        <option value="admin">Administrador</option>
                        <option value="user">Usuario</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:ring-2 focus:ring-[#008a60] focus:border-transparent outline-none cursor-pointer"
                    >
                        <option value="all">Estado: Todos</option>
                        <option value="active">Activos</option>
                        <option value="inactive">Inactivos</option>
                        <option value="deleted">Eliminados</option>
                    </select>
                </div>
            </div>

            {/* Table Content */}
            {loading && users.length === 0 ? (
                <div className="flex justify-center p-12">
                    <div className="w-8 h-8 border-3 border-[#008a60] border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Usuario</th>
                                    <th className="px-6 py-4">Rol</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.length > 0 ? users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">
                                                        {user.email?.charAt(0).toUpperCase() || '?'}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-semibold text-gray-900">{user.name || 'Sin Nombre'}</p>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(user.status || (user.active ? 'active' : 'inactive'))}`}>
                                                <span className={`w-2 h-2 rounded-full ${user.status === 'active' || user.active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                {getStatusLabel(user.status || (user.active ? 'active' : 'inactive'))}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openEditModal(user)} className="text-gray-400 hover:text-[#008a60] transition-colors p-1" title="Editar">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                                </button>
                                                <button onClick={() => confirmDelete(user)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Eliminar">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                                            No se encontraron usuarios
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex justify-between items-center mt-4 px-2">
                        <span className="text-sm text-gray-600">
                            Mostrando página <span className="font-semibold">{meta.page}</span> de <span className="font-semibold">{meta.totalPages}</span>
                            <span className="text-gray-400 mx-2">|</span>
                            Total: {meta.total} usuarios
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Anterior
                            </button>
                            {/* Simple Page Numbers (First, Current, Last) */}
                            {page > 1 && (
                                <button onClick={() => setPage(1)} className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">1</button>
                            )}
                            {page > 2 && <span className="text-gray-400">...</span>}

                            <button className="px-3 py-1 bg-[#008a60] text-white rounded-md text-sm font-medium">{page}</button>

                            {page < meta.totalPages - 1 && <span className="text-gray-400">...</span>}
                            {page < meta.totalPages && (
                                <button onClick={() => setPage(meta.totalPages)} className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">{meta.totalPages}</button>
                            )}

                            <button
                                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                                disabled={page === meta.totalPages}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Create/Edit Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 transform scale-100 animate-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                <input name="email" type="email" defaultValue={editingUser?.email} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-[#008a60] focus:border-[#008a60] transition-shadow" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
                                <input name="name" type="text" defaultValue={editingUser?.name} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-[#008a60] focus:border-[#008a60] transition-shadow" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña {editingUser && '(Dejar vacío para no cambiar)'}</label>
                                <div className="relative">
                                    <input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-[#008a60] focus:border-[#008a60] transition-shadow pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-[calc(50%-4px)] text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rol</label>
                                    <select name="role" defaultValue={editingUser?.role || 'user'} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-[#008a60] focus:border-[#008a60]">
                                        <option value="user">Usuario</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
                                    <select name="status" defaultValue={editingUser?.status || (editingUser?.active ? 'active' : 'inactive')} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-[#008a60] focus:border-[#008a60]">
                                        <option value="active">Activo</option>
                                        <option value="inactive">Inactivo</option>
                                        <option value="deleted">Eliminado</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
                                    disabled={saveStatus === 'success' || saveStatus === 'saving'}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saveStatus === 'success' || saveStatus === 'saving'}
                                    className={`
                                        px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2
                                        ${saveStatus === 'success' ? 'bg-green-600 text-white' : ''}
                                        ${saveStatus === 'error' ? 'bg-red-600 text-white' : ''}
                                        ${saveStatus === 'saving' ? 'bg-gray-400 text-white cursor-wait' : ''}
                                        ${saveStatus === 'idle' ? 'bg-[#008a60] text-white hover:bg-[#007a55]' : ''}
                                    `}
                                >
                                    {saveStatus === 'idle' && 'Guardar'}
                                    {saveStatus === 'saving' && (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Guardando
                                        </>
                                    )}
                                    {saveStatus === 'success' && (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                            ¡Éxito!
                                        </>
                                    )}
                                    {saveStatus === 'error' && 'Error'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={executeDelete}
                title="Eliminar Usuario"
                message={`¿Estás seguro de que deseas eliminar al usuario ${userToDelete?.name || userToDelete?.email}? Esta acción no se puede deshacer.`}
                confirmText="Sí, eliminar"
            />
        </div>
    );
};

export default AdminUsersPage;
