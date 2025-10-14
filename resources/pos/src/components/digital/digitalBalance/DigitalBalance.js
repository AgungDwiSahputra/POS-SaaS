import React, { useEffect, useState, useCallback } from "react";
import { connect } from "react-redux";
import MasterLayout from "../../MasterLayout";
import TabTitle from "../../../shared/tab-title/TabTitle";
import { getFormattedMessage, placeholderText, currencySymbolHandling, getFormattedMessageWithObject } from "../../../shared/sharedMethod";
import ReactSelect from "../../../shared/select/reactSelect";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import { Card, Row, Col, Badge, Button, Modal, Form, Table, InputGroup, Spinner, Alert, Pagination } from "react-bootstrap";
import { fetchStore } from "../../../store/action/storeAction";
import { fetchActiveDigitalProviders } from "../../../store/action/digitalProviderAction";
import { fetchStoreDigitalProviders } from "../../../store/action/storeDigitalProviderAction";
import {
    createDigitalTopupRequest,
    fetchDigitalTopupRequests,
    editDigitalTopupRequest,
    approveDigitalTopupRequest,
    rejectDigitalTopupRequest,
    completeDigitalTopupRequest,
    deleteDigitalTopupRequest
} from "../../../store/action/digitalTopupRequestAction";

const resolveLogoUrl = (logo) => {
    if (!logo) return "";
    const trimmed = logo.trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (trimmed.startsWith('/')) return trimmed;
    if (/^storage\//i.test(trimmed)) return `/${trimmed}`;
    if (/^app\//i.test(trimmed)) return `/storage/${trimmed}`;
    return `/storage/${trimmed}`;
};

const DigitalBalance = (props) => {
    const {
        stores,
        storeDigitalProviders,
        digitalProviders,
        digitalTopupRequests,
        frontSetting,
        allConfigData,
        fetchStore,
        fetchActiveDigitalProviders,
        fetchStoreDigitalProviders,
        createDigitalTopupRequest,
        fetchDigitalTopupRequests,
        editDigitalTopupRequest,
        approveDigitalTopupRequest,
        rejectDigitalTopupRequest,
        completeDigitalTopupRequest,
        deleteDigitalTopupRequest,
    } = props;

    const [selectedStore, setSelectedStore] = useState(null);
    const [storeBalance, setStoreBalance] = useState([]);
    const [showTopupModal, setShowTopupModal] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [topupFormData, setTopupFormData] = useState({
        amount: '',
        reason: ''
    });

    const [formErrors, setFormErrors] = useState({
        amount: '',
        reason: ''
    });

    const [submitError, setSubmitError] = useState('');

    const [editFormData, setEditFormData] = useState({
        amount: '',
        reason: ''
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');

    // Loading states
    const [isCreating, setIsCreating] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // UI states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [requestToDelete, setRequestToDelete] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [requestToEdit, setRequestToEdit] = useState(null);

    const currencySymbol =
        frontSetting?.value?.currency_symbol || "Rp";

    useEffect(() => {
        fetchStore(false);
        fetchActiveDigitalProviders();
        fetchStoreDigitalProviders({}, false);
        fetchDigitalTopupRequests({}, false);
    }, [fetchStore, fetchActiveDigitalProviders, fetchStoreDigitalProviders, fetchDigitalTopupRequests]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (selectedStore) {
                fetchDigitalTopupRequests({ page: currentPage }, false);
                fetchStoreDigitalProviders({ store_id: selectedStore.value }, false);
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [selectedStore, currentPage, fetchDigitalTopupRequests, fetchStoreDigitalProviders]);

    useEffect(() => {
        if (stores && stores.length > 0 && !selectedStore) {
            const defaultStore = stores.find(
                (store) => store.id === Number(frontSetting?.value?.default_warehouse)
            ) || stores[0];

            setSelectedStore({
                label: defaultStore.attributes.name,
                value: defaultStore.id,
            });
        }
    }, [stores, frontSetting, selectedStore]);

useEffect(() => {
    if (!selectedStore) {
        return;
    }

    const providersArray = Array.isArray(storeDigitalProviders)
        ? storeDigitalProviders
        : Array.isArray(storeDigitalProviders?.data)
            ? storeDigitalProviders.data
            : [];

    const balances = providersArray.filter(
        (provider) => provider?.attributes?.store_id === selectedStore.value
    );

    setStoreBalance(balances);
    console.log('Store balance updated for store', selectedStore.value, ':', balances);
    console.log('Total storeDigitalProviders:', providersArray.length);
}, [selectedStore, storeDigitalProviders]);

    const onStoreChange = useCallback((selectedOption) => {
        console.log('Store change triggered:', selectedOption);
        setSelectedStore(selectedOption);
        setCurrentPage(1); // Reset to first page when store changes
        setSearchTerm(''); // Reset search when store changes

        // Fetch providers for the new store
        if (selectedOption) {
            console.log('Fetching store digital providers for store_id:', selectedOption.value);
            fetchStoreDigitalProviders({ store_id: selectedOption.value }, false);
        }
    }, [fetchStoreDigitalProviders]);

    const handleTopupClick = useCallback((provider) => {
        setSelectedProvider(provider);
        setTopupFormData({
            amount: '',
            reason: ''
        });
        // Modal should already be open, just update the selected provider
    }, []);

    const handleRefresh = useCallback(() => {
        setIsRefreshing(true);
        Promise.all([
            fetchStoreDigitalProviders(selectedStore ? { store_id: selectedStore.value } : {}, false),
            fetchDigitalTopupRequests({ page: currentPage }, false)
        ]).finally(() => {
            setIsRefreshing(false);
        });
    }, [selectedStore, currentPage, fetchStoreDigitalProviders, fetchDigitalTopupRequests]);

    const handleSearch = useCallback((value) => {
        setSearchTerm(value);
        setCurrentPage(1);
    }, []);

    const handleStatusFilter = useCallback((status) => {
        setSelectedStatus(status);
        setCurrentPage(1);
    }, []);

    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
    }, []);

    const handleDeleteClick = useCallback((request) => {
        setRequestToDelete(request);
        setShowDeleteModal(true);
    }, []);

    const handleEditClick = useCallback((request) => {
        setRequestToEdit(request);
        setEditFormData({
            amount: request.attributes?.amount?.toString() || '',
            reason: request.attributes?.reason || ''
        });
        setShowEditModal(true);
    }, []);

    const handleEditInputChange = (field, value) => {
        setEditFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setRequestToEdit(null);
        setEditFormData({
            amount: '',
            reason: ''
        });
    };

    const handleEditSubmit = useCallback(async () => {
        if (!requestToEdit || !editFormData.amount) {
            return;
        }

        setIsCreating(true);
        const updateData = {
            amount: parseFloat(editFormData.amount),
            reason: editFormData.reason || requestToEdit.attributes?.reason || 'Topup saldo digital'
        };

        try {
            await editDigitalTopupRequest(requestToEdit.id, updateData);
            handleCloseEditModal();
            handleRefresh();
        } catch (error) {
            console.error('Failed to update request:', error);
        } finally {
            setIsCreating(false);
        }
    }, [requestToEdit, editFormData.amount, editFormData.reason, editDigitalTopupRequest, handleCloseEditModal, handleRefresh]);

    const handleDeleteConfirm = useCallback(async () => {
        if (requestToDelete) {
            setIsCreating(true);
            try {
                await deleteDigitalTopupRequest(requestToDelete.id);
                setShowDeleteModal(false);
                setRequestToDelete(null);
                // Refresh data after successful deletion
                handleRefresh();
            } catch (error) {
                console.error('Failed to delete request:', error);
            } finally {
                setIsCreating(false);
            }
        }
    }, [requestToDelete, deleteDigitalTopupRequest, handleRefresh]);

    const handleApproveRequest = useCallback(async (request) => {
        setIsCreating(true);
        try {
            await approveDigitalTopupRequest(request.id, 'Disetujui melalui dashboard');
            // Refresh data after successful approval
            handleRefresh();
        } catch (error) {
            console.error('Failed to approve request:', error);
        } finally {
            setIsCreating(false);
        }
    }, [approveDigitalTopupRequest, handleRefresh]);

    const handleRejectRequest = useCallback(async (request) => {
        setIsCreating(true);
        try {
            await rejectDigitalTopupRequest(request.id, 'Ditolak melalui dashboard');
            // Refresh data after successful rejection
            handleRefresh();
        } catch (error) {
            console.error('Failed to reject request:', error);
        } finally {
            setIsCreating(false);
        }
    }, [rejectDigitalTopupRequest, handleRefresh]);

    const handleCompleteRequest = useCallback(async (request) => {
        setIsCreating(true);
        try {
            await completeDigitalTopupRequest(request.id);
            // Refresh data after successful completion
            handleRefresh();
        } catch (error) {
            console.error('Failed to complete request:', error);
        } finally {
            setIsCreating(false);
        }
    }, [completeDigitalTopupRequest, handleRefresh]);

    const validateForm = () => {
        const errors = {};

        // Validate amount
        if (!topupFormData.amount) {
            errors.amount = 'Jumlah topup harus diisi';
        } else {
            const amount = parseFloat(topupFormData.amount);
            if (isNaN(amount)) {
                errors.amount = 'Jumlah topup harus berupa angka yang valid';
            } else if (amount <= 0) {
                errors.amount = 'Jumlah topup harus lebih dari 0';
            } else if (amount > 100000000) { // Max 100 juta
                errors.amount = 'Jumlah topup maksimal Rp 100.000.000';
            }
        }

        // Validate reason
        if (!topupFormData.reason.trim()) {
            errors.reason = 'Alasan topup harus diisi';
        } else if (topupFormData.reason.trim().length < 10) {
            errors.reason = 'Alasan topup minimal 10 karakter';
        } else if (topupFormData.reason.trim().length > 500) {
            errors.reason = 'Alasan topup maksimal 500 karakter';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCloseModal = () => {
        setShowTopupModal(false);
        setSelectedProvider(null);
        setTopupFormData({
            amount: '',
            reason: ''
        });
        setFormErrors({
            amount: '',
            reason: ''
        });
        setSubmitError('');
    };

    const handleInputChange = (field, value) => {
        setTopupFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error for this field when user starts typing
        if (formErrors[field]) {
            setFormErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleSubmitTopup = useCallback(async () => {
        if (!selectedProvider || !selectedStore) {
            return;
        }

        // Validate form before submission
        if (!validateForm()) {
            return;
        }

        setIsCreating(true);
        setSubmitError('');

        try {
            // Check if we need to create a store_digital_provider record first
            if (selectedProvider.id.toString().startsWith('new-')) {
                console.log('Creating store digital provider for new provider...');

                // Create store_digital_provider record
                const storeProviderData = {
                    store_id: selectedStore.value,
                    digital_provider_id: selectedProvider.attributes.digital_provider_id,
                    balance: 0,
                    is_active: true
                };

                // We need to import and use the createStoreDigitalProvider action
                // For now, let's proceed with the topup request and let the backend handle it
            }

            const topupData = {
                store_id: selectedStore.value,
                digital_provider_id: selectedProvider.attributes.digital_provider_id,
                amount: parseFloat(topupFormData.amount),
                reason: topupFormData.reason.trim()
            };

            console.log('Submitting topup request:', topupData);

            await createDigitalTopupRequest(topupData);

            handleCloseModal();
            // Refresh data after successful creation
            handleRefresh();

        } catch (error) {
            console.error('Failed to create topup request:', error);
            console.error('Error response:', error.response?.data);

            // Check if it's the "provider not configured" error
            if (error.response?.status === 422 &&
                error.response?.data?.message?.includes('Provider not configured for this store')) {

                // Try to create the store_digital_provider record first
                try {
                    console.log('Attempting to create store digital provider record...');

                    // Import createStoreDigitalProvider action if available
                    const { createStoreDigitalProvider } = await import("../../../store/action/storeDigitalProviderAction");

                    const storeProviderData = {
                        store_id: selectedStore.value,
                        digital_provider_id: selectedProvider.attributes.digital_provider_id,
                        balance: 0,
                        is_active: true
                    };

                    await createStoreDigitalProvider(storeProviderData);

                    // Now try the topup request again
                    const topupData = {
                        store_id: selectedStore.value,
                        digital_provider_id: selectedProvider.attributes.digital_provider_id,
                        amount: parseFloat(topupFormData.amount),
                        reason: topupFormData.reason.trim()
                    };

                    console.log('Retrying topup request after creating store provider:', topupData);
                    await createDigitalTopupRequest(topupData);

                    handleCloseModal();
                    handleRefresh();

                } catch (secondError) {
                    console.error('Failed to create store provider or topup request:', secondError);
                    setSubmitError(
                        'Gagal mengonfigurasi provider untuk store ini. Silakan hubungi administrator.'
                    );
                }
            } else {
                // Other error
                setSubmitError(
                    error.response?.data?.message ||
                    'Gagal membuat request topup. Silakan coba lagi.'
                );
            }
        } finally {
            setIsCreating(false);
        }
    }, [selectedProvider, selectedStore, topupFormData.amount, topupFormData.reason, createDigitalTopupRequest, handleCloseModal, handleRefresh, validateForm]);

    // Filter topup requests based on search and status
    const getFilteredTopupRequests = useCallback(() => {
        if (!digitalTopupRequests) return [];

        let filtered = digitalTopupRequests;

        // Filter by store
        if (selectedStore) {
            filtered = filtered.filter(request =>
                request.attributes?.store_id === selectedStore.value
            );
        }

        // Filter by status
        if (selectedStatus !== 'all') {
            filtered = filtered.filter(request =>
                request.attributes?.status === selectedStatus
            );
        }

        // Filter by search term
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(request => {
                const providerName = request.attributes?.digital_provider?.name?.toLowerCase() || '';
                const reason = request.attributes?.reason?.toLowerCase() || '';
                const requestCode = request.attributes?.request_code?.toLowerCase() || '';
                const customerName = request.attributes?.customer_name?.toLowerCase() || '';

                return providerName.includes(searchLower) ||
                       reason.includes(searchLower) ||
                       requestCode.includes(searchLower) ||
                       customerName.includes(searchLower);
            });
        }

        return filtered;
    }, [digitalTopupRequests, selectedStore, selectedStatus, searchTerm]);

    // Get paginated results
    const getPaginatedRequests = useCallback(() => {
        const filtered = getFilteredTopupRequests();
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filtered.slice(startIndex, endIndex);
    }, [getFilteredTopupRequests, currentPage, itemsPerPage]);

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'approved': return 'success';
            case 'rejected': return 'danger';
            case 'completed': return 'primary';
            case 'pending': return 'warning';
            default: return 'secondary';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'approved': return 'Disetujui';
            case 'rejected': return 'Ditolak';
            case 'completed': return 'Selesai';
            case 'pending': return 'Menunggu';
            default: return status;
        }
    };

    const getTotalBalance = () => {
        return storeBalance.reduce((total, provider) => {
            return total + parseFloat(provider.attributes.balance || 0);
        }, 0);
    };

    // Get all available providers for topup (both existing store providers and available digital providers)
    const getAvailableProvidersForTopup = () => {
        const providers = [];

        // Add existing store providers
        if (storeBalance.length > 0) {
            providers.push(...storeBalance);
        }

        // Add available digital providers that aren't already connected to this store
        if (digitalProviders && selectedStore) {
            const existingProviderIds = storeBalance.map(sp => sp.attributes.digital_provider_id);
            const availableProviders = digitalProviders.filter(dp =>
                dp.attributes.is_active && !existingProviderIds.includes(dp.id)
            );

            // Convert digital providers to store provider format for display
            availableProviders.forEach(dp => {
                providers.push({
                    id: `new-${dp.id}`,
                    attributes: {
                        store_id: selectedStore.value,
                        digital_provider_id: dp.id,
                        digital_provider: dp.attributes,
                        balance: 0,
                        is_active: true,
                        last_topup_at: null,
                        last_topup_amount: 0
                    }
                });
            });
        }

        console.log('Available providers for topup:', providers);
        return providers;
    };

    const storeOptions = stores ? stores.map((store) => ({
        label: store.attributes.name,
        value: store.id,
    })) : [];

    const formatCurrency = (amount) => {
        return currencySymbolHandling(
            allConfigData,
            currencySymbol,
            amount
        );
    };

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={getFormattedMessage("digital.balance.title")} />

            {/* Store Selection and Actions */}
            <div className="row mb-4">
                <div className="col-12 col-md-6">
                    <ReactSelect
                        data={storeOptions}
                        onChange={onStoreChange}
                        value={selectedStore}
                        title={getFormattedMessage("store.title")}
                        placeholder={placeholderText("store.select.placeholder")}
                        defaultValue={selectedStore}
                        isRequired
                    />
                </div>
                <div className="col-12 col-md-6">
                    <div className="d-flex gap-2">
                        <Button
                            variant="outline-primary"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="d-flex align-items-center"
                        >
                            {isRefreshing ? (
                                <Spinner as="span" animation="border" size="sm" className="me-2" />
                            ) : (
                                <i className="bi bi-arrow-clockwise me-2"></i>
                            )}
                            Refresh
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => {
                                setSelectedProvider(null);
                                setTopupFormData({
                                    amount: '',
                                    reason: ''
                                });
                                setShowTopupModal(true);
                            }}
                            disabled={!selectedStore}
                            className="d-flex align-items-center"
                        >
                            <i className="bi bi-plus-circle me-2"></i>
                            Request Topup
                        </Button>
                    </div>
                </div>
            </div>

            {/* Balance Summary Cards */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="text-center border-primary">
                        <Card.Body>
                            <Card.Title className="text-primary">
                                <i className="bi bi-wallet2 fs-1"></i>
                            </Card.Title>
                            <h3 className="mb-0">
                                {formatCurrency(getTotalBalance())}
                            </h3>
                            <small className="text-muted">
                                Total Saldo
                            </small>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={3}>
                    <Card className="text-center border-info">
                        <Card.Body>
                            <Card.Title className="text-info">
                                <i className="bi bi-building fs-1"></i>
                            </Card.Title>
                            <h3 className="mb-0">
                                {storeBalance.filter(p => p.attributes.is_active).length}
                            </h3>
                            <small className="text-muted">
                                Provider Aktif
                            </small>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={3}>
                    <Card className="text-center border-success">
                        <Card.Body>
                            <Card.Title className="text-success">
                                <i className="bi bi-graph-up fs-1"></i>
                            </Card.Title>
                            <h3 className="mb-0">
                                {formatCurrency(
                                    storeBalance
                                        .filter(p => p.attributes.is_active)
                                        .reduce((total, provider) => total + parseFloat(provider.attributes.balance || 0), 0)
                                )}
                            </h3>
                            <small className="text-muted">
                                Saldo Tersedia
                            </small>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={3}>
                    <Card className="text-center border-warning">
                        <Card.Body>
                            <Card.Title className="text-warning">
                                <i className="bi bi-clock-history fs-1"></i>
                            </Card.Title>
                            <h3 className="mb-0">
                                {storeBalance.filter(p => p.attributes.last_topup_at).length}
                            </h3>
                            <small className="text-muted">
                                Provider dengan Topup
                            </small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Provider Balance */}
            <Row className="mb-4">
                <Col md={12}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">
                                Provider Saldo
                            </h5>
                            <Badge bg="primary">
                                {selectedStore ? selectedStore.label : "Pilih Store"}
                            </Badge>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {storeBalance.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Provider</th>
                                                <th>Saldo</th>
                                                <th>Status</th>
                                                <th>Last Topup</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {storeBalance.map((provider) => (
                                                <tr key={provider.id}>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            {provider.attributes.digital_provider.logo && (
                                                                <img
                                                                    src={resolveLogoUrl(provider.attributes.digital_provider.logo)}
                                                                    height="30"
                                                                    width="30"
                                                                    alt={provider.attributes.digital_provider.name}
                                                                    className="me-2 rounded"
                                                                />
                                                            )}
                                                            <div>
                                                                <div className="fw-bold">
                                                                    {provider.attributes.digital_provider.name}
                                                                </div>
                                                                <small className="text-muted">
                                                                    {provider.attributes.digital_provider.code}
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`fw-bold ${provider.attributes.balance > 0 ? 'text-success' : 'text-danger'}`}>
                                                            {formatCurrency(provider.attributes.balance)}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <Badge bg={provider.attributes.is_active ? "success" : "danger"}>
                                                            {provider.attributes.is_active ? "Aktif" : "Tidak Aktif"}
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        {provider.attributes.last_topup_at ? (
                                                            <small>
                                                                <div className="fw-bold">
                                                                    {formatCurrency(provider.attributes.last_topup_amount)}
                                                                </div>
                                                                {new Date(provider.attributes.last_topup_at).toLocaleDateString()}
                                                            </small>
                                                        ) : (
                                                            <span className="text-muted">Belum ada</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-outline-primary me-2"
                                                            onClick={() => handleTopupClick(provider)}
                                                            title="Top Up"
                                                        >
                                                            <i className="bi bi-plus-circle"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-5">
                                    <i className="bi bi-wallet2 fs-1 text-muted mb-3"></i>
                                    <h5 className="text-muted">
                                        Tidak ada provider aktif
                                    </h5>
                                    <p className="text-muted">
                                        Pilih provider aktif untuk melihat saldo
                                    </p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Topup Requests History */}
            <div className="row">
                <div className="col-12">
                    <Card>
                        <Card.Header>
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Riwayat Request Topup</h5>
                                <div className="d-flex gap-2 align-items-center">
                                    <InputGroup style={{ width: '300px' }}>
                                        <InputGroup.Text>
                                            <i className="bi bi-search"></i>
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            placeholder="Cari request..."
                                            value={searchTerm}
                                            onChange={(e) => handleSearch(e.target.value)}
                                        />
                                    </InputGroup>
                                    <Form.Select
                                        value={selectedStatus}
                                        onChange={(e) => handleStatusFilter(e.target.value)}
                                        style={{ width: '150px' }}
                                    >
                                        <option value="all">Semua Status</option>
                                        <option value="pending">Menunggu</option>
                                        <option value="approved">Disetujui</option>
                                        <option value="rejected">Ditolak</option>
                                        <option value="completed">Selesai</option>
                                    </Form.Select>
                                </div>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            {getPaginatedRequests().length > 0 ? (
                                <>
                                    <div className="table-responsive">
                                        <Table hover>
                                            <thead>
                                                <tr>
                                                    <th>Kode Request</th>
                                                    <th>Provider</th>
                                                    <th>Jumlah</th>
                                                    <th>Status</th>
                                                    <th>Pemohon</th>
                                                    <th>Tanggal</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {getPaginatedRequests().map((request) => (
                                                    <tr key={request.id}>
                                                        <td>
                                                            <small className="fw-bold text-primary">
                                                                {request.attributes?.request_code || '-'}
                                                            </small>
                                                        </td>
                                                        <td>
                                                            <div>
                                                                <div className="fw-bold">
                                                                    {request.attributes?.digital_provider?.name || '-'}
                                                                </div>
                                                                <small className="text-muted">
                                                                    {request.attributes?.digital_provider?.code || '-'}
                                                                </small>
                                                            </div>
                                                        </td>
                                                        <td className="fw-bold">
                                                            {formatCurrency(request.attributes?.amount || 0)}
                                                        </td>
                                                        <td>
                                                            <Badge bg={getStatusBadgeVariant(request.attributes?.status)}>
                                                                {getStatusText(request.attributes?.status)}
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            <div>
                                                                <div className="fw-bold">
                                                                    {request.attributes?.customer_name || '-'}
                                                                </div>
                                                                {request.attributes?.customer_phone && (
                                                                    <small className="text-muted">
                                                                        {request.attributes.customer_phone}
                                                                    </small>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <small>
                                                                {new Date(request.attributes?.created_at || '').toLocaleDateString()}
                                                            </small>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex gap-1">
                                                                {request.attributes?.status === 'pending' && (
                                                                    <>
                                                                        <Button
                                                                            variant="outline-warning btn-sm"
                                                                            title="Edit"
                                                                            size="sm"
                                                                            onClick={() => handleEditClick(request)}
                                                                            disabled={isCreating}
                                                                        >
                                                                            <i className="bi bi-pencil"></i>
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline-success btn-sm"
                                                                            title="Approve"
                                                                            size="sm"
                                                                            onClick={() => handleApproveRequest(request)}
                                                                            disabled={isCreating}
                                                                        >
                                                                            <i className="bi bi-check-circle"></i>
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline-danger btn-sm"
                                                                            title="Reject"
                                                                            size="sm"
                                                                            onClick={() => handleRejectRequest(request)}
                                                                            disabled={isCreating}
                                                                        >
                                                                            <i className="bi bi-x-circle"></i>
                                                                        </Button>
                                                                    </>
                                                                )}
                                                                {request.attributes?.status === 'approved' && (
                                                                    <Button
                                                                        variant="outline-info btn-sm"
                                                                        title="Complete"
                                                                        size="sm"
                                                                        onClick={() => handleCompleteRequest(request)}
                                                                        disabled={isCreating}
                                                                    >
                                                                        <i className="bi bi-check2-all"></i>
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    variant="outline-secondary btn-sm"
                                                                    title="Delete"
                                                                    size="sm"
                                                                    onClick={() => handleDeleteClick(request)}
                                                                    disabled={isCreating}
                                                                >
                                                                    <i className="bi bi-trash"></i>
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>

                                    {/* Pagination */}
                                    <div className="d-flex justify-content-between align-items-center mt-3">
                                        <small className="text-muted">
                                            Menampilkan {Math.min(itemsPerPage, getPaginatedRequests().length)} dari {getFilteredTopupRequests().length} request
                                        </small>
                                        <Pagination>
                                            <Pagination.Prev
                                                disabled={currentPage === 1}
                                                onClick={() => handlePageChange(currentPage - 1)}
                                            />
                                            {[...Array(Math.ceil(getFilteredTopupRequests().length / itemsPerPage)).keys()].map((pageNumber) => (
                                                <Pagination.Item
                                                    key={pageNumber + 1}
                                                    active={currentPage === pageNumber + 1}
                                                    onClick={() => handlePageChange(pageNumber + 1)}
                                                >
                                                    {pageNumber + 1}
                                                </Pagination.Item>
                                            ))}
                                            <Pagination.Next
                                                disabled={currentPage === Math.ceil(getFilteredTopupRequests().length / itemsPerPage)}
                                                onClick={() => handlePageChange(currentPage + 1)}
                                            />
                                        </Pagination>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-5">
                                    <i className="bi bi-clock-history fs-1 text-muted mb-3"></i>
                                    <h5 className="text-muted">
                                        {getFilteredTopupRequests().length === 0 && selectedStore ?
                                            "Belum ada request topup" :
                                            "Pilih store untuk melihat riwayat request"
                                        }
                                    </h5>
                                    <p className="text-muted">
                                        Request topup akan muncul di sini
                                    </p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </div>
            </div>

            {/* Topup Request Modal */}
            <Modal show={showTopupModal} onHide={handleCloseModal} size={selectedProvider ? "md" : "lg"}>
                <Modal.Header closeButton>
                    <Modal.Title>Request Topup Saldo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {!selectedProvider ? (
                        // Provider selection view
                        <div>
                            <div className="mb-3">
                                <h5>Pilih Provider untuk Topup</h5>
                                <p className="text-muted">Pilih provider yang ingin Anda topup saldonya</p>
                            </div>

                            {/* Debug info */}
                            {process.env.NODE_ENV === 'development' && (
                                <Alert variant="info" className="mb-3">
                                    <small>
                                        <strong>Debug Info:</strong><br/>
                                        Selected Store: {selectedStore?.value}<br/>
                                        Store Balance Length: {storeBalance.length}<br/>
                                        Digital Providers Length: {digitalProviders?.length}<br/>
                                        Available Providers: {getAvailableProvidersForTopup().length}<br/>
                                        {/* Store Balance Data: {JSON.stringify(storeBalance, null, 2)}<br/> */}
                                        {/* Available Providers Data: {JSON.stringify(getAvailableProvidersForTopup(), null, 2)} */}
                                    </small>
                                </Alert>
                            )}

                            {getAvailableProvidersForTopup().length > 0 ? (
                                <div className="row">
                                    {getAvailableProvidersForTopup().map((provider) => (
                                        <div key={provider.id} className="col-md-6 mb-3">
                                            <Card
                                                className={`h-100 provider-card ${provider.attributes.is_active ? '' : 'opacity-50'} ${provider.id.toString().startsWith('new-') ? 'border-warning' : ''}`}
                                                onClick={() => provider.attributes.is_active && handleTopupClick(provider)}
                                                style={{
                                                    cursor: provider.attributes.is_active ? 'pointer' : 'not-allowed',
                                                    transition: 'all 0.2s ease-in-out'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (provider.attributes.is_active) {
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (provider.attributes.is_active) {
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = 'none';
                                                    }
                                                }}
                                            >
                                                <Card.Body className="d-flex align-items-center">
                                                    {provider.attributes.digital_provider.logo && (
                                                        <img
                                                            src={resolveLogoUrl(provider.attributes.digital_provider.logo)}
                                                            height="40"
                                                            width="40"
                                                            alt={provider.attributes.digital_provider.name}
                                                            className="me-3 rounded"
                                                        />
                                                    )}
                                                    <div className="flex-grow-1">
                                                        <div className="fw-bold">
                                                            {provider.attributes.digital_provider.name}
                                                        </div>
                                                        <small className="text-muted">
                                                            {provider.attributes.digital_provider.code}
                                                        </small>
                                                        <div className="mt-1">
                                                            <span className={`fw-bold ${provider.attributes.balance > 0 ? 'text-success' : 'text-danger'}`}>
                                                                {formatCurrency(provider.attributes.balance)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-end">
                                                        {provider.id.toString().startsWith('new-') && (
                                                            <Badge bg="warning" className="mb-1">
                                                                <small>Baru</small>
                                                            </Badge>
                                                        )}
                                                        <div>
                                                            <Badge bg={provider.attributes.is_active ? "success" : "danger"}>
                                                                {provider.attributes.is_active ? "Aktif" : "Tidak Aktif"}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="bi bi-wallet2 fs-1 text-muted mb-3"></i>
                                    <h5 className="text-muted">Tidak ada provider tersedia</h5>
                                    <p className="text-muted">
                                        Pastikan store yang dipilih memiliki provider digital yang aktif
                                    </p>
                                    {process.env.NODE_ENV === 'development' && (
                                        <Alert variant="warning" className="mt-3">
                                            <small>
                                                <strong>Debug:</strong><br/>
                                                Store Digital Providers: {storeDigitalProviders?.length || 0}<br/>
                                                Digital Providers: {digitalProviders?.length || 0}<br/>
                                                Selected Store: {selectedStore?.value || 'None'}
                                            </small>
                                        </Alert>
                                    )}
                                    <Button variant="primary" onClick={handleCloseModal}>
                                        Tutup
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        // Topup form view
                        <div>
                            <div className="mb-3">
                                <strong>Provider:</strong> {selectedProvider.attributes.digital_provider.name}
                                <Button
                                    variant="outline-secondary btn-sm ms-2"
                                    onClick={() => setSelectedProvider(null)}
                                    title="Pilih provider lain"
                                >
                                    <i className="bi bi-arrow-left"></i> Ganti
                                </Button>
                            </div>
                            <div className="mb-3">
                                <strong>Saldo Saat Ini:</strong> {formatCurrency(selectedProvider.attributes.balance)}
                            </div>

                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label className="required">Jumlah Topup</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Masukkan jumlah topup"
                                        className={formErrors.amount ? 'is-invalid' : ''}
                                        value={topupFormData.amount}
                                        onChange={(e) => handleInputChange('amount', e.target.value)}
                                        required
                                    />
                                    {formErrors.amount && (
                                        <Form.Control.Feedback type="invalid">
                                            {formErrors.amount}
                                        </Form.Control.Feedback>
                                )}
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="required">Alasan Topup</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="Berikan alasan topup yang jelas"
                                        className={formErrors.reason ? 'is-invalid' : ''}
                                        value={topupFormData.reason}
                                        onChange={(e) => handleInputChange('reason', e.target.value)}
                                        required
                                    />
                                    {formErrors.reason && (
                                        <Form.Control.Feedback type="invalid">
                                            {formErrors.reason}
                                        </Form.Control.Feedback>
                                    )}
                                </Form.Group>
                            </Form>

                            {submitError && (
                                <Alert variant="danger">
                                    {submitError}
                                </Alert>
                            )}

                            <div className="alert alert-info">
                                <small>
                                    <strong>Saldo setelah topup:</strong> {formatCurrency(
                                        parseFloat(selectedProvider.attributes.balance || 0) +
                                        parseFloat(topupFormData.amount || 0)
                                    )}
                                </small>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Batal
                    </Button>
                    {selectedProvider && (
                        <Button
                            variant="primary"
                            onClick={handleSubmitTopup}
                            disabled={!topupFormData.amount || !selectedProvider}
                        >
                            Ajukan Request
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Konfirmasi Hapus</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {requestToDelete && (
                        <div>
                            <p>Apakah Anda yakin ingin menghapus request topup ini?</p>
                            <div className="alert alert-warning">
                                <div><strong>Kode Request:</strong> {requestToDelete.attributes?.request_code || '-'}</div>
                                <div><strong>Provider:</strong> {requestToDelete.attributes?.digital_provider?.name || '-'}</div>
                                <div><strong>Jumlah:</strong> {formatCurrency(requestToDelete.attributes?.amount || 0)}</div>
                                <div><strong>Status:</strong>
                                    <Badge bg={getStatusBadgeVariant(requestToDelete.attributes?.status)} className="ms-2">
                                        {getStatusText(requestToDelete.attributes?.status)}
                                    </Badge>
                                </div>
                            </div>
                            <small className="text-muted">
                                <strong>Perhatian:</strong> Tindakan ini tidak dapat dibatalkan.
                            </small>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Batal
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleDeleteConfirm}
                        disabled={isCreating}
                    >
                        {isCreating ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" className="me-2" />
                                Menghapus...
                            </>
                        ) : (
                            'Hapus'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Edit Topup Request Modal */}
            <Modal show={showEditModal} onHide={handleCloseEditModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Request Topup</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {requestToEdit && (
                        <div>
                            <div className="mb-3">
                                <strong>Kode Request:</strong> {requestToEdit.attributes?.request_code || '-'}
                            </div>
                            <div className="mb-3">
                                <strong>Provider:</strong> {requestToEdit.attributes?.digital_provider?.name || '-'}
                            </div>
                            <div className="mb-3">
                                <strong>Status:</strong>
                                <Badge bg={getStatusBadgeVariant(requestToEdit.attributes?.status)} className="ms-2">
                                    {getStatusText(requestToEdit.attributes?.status)}
                                </Badge>
                            </div>

                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label className="required">Jumlah Topup</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Masukkan jumlah topup"
                                         className={formErrors.amount ? 'is-invalid' : ''}
                                        value={editFormData.amount}
                                        onChange={(e) => handleEditInputChange('amount', e.target.value)}
                                        required
                                        disabled={requestToEdit.attributes?.status !== 'pending'}
                                    />
                                    {requestToEdit.attributes?.status !== 'pending' && (
                                        <small className="text-muted">
                                            Hanya request dengan status "Menunggu" yang dapat diedit
                                        </small>
                                    )}
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Alasan Topup</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="Berikan alasan topup"
                                        value={editFormData.reason}
                                        onChange={(e) => handleEditInputChange('reason', e.target.value)}
                                        disabled={requestToEdit.attributes?.status !== 'pending'}
                                    />
                                </Form.Group>
                            </Form>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseEditModal}>
                        Batal
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleEditSubmit}
                        disabled={!editFormData.amount || !requestToEdit || requestToEdit.attributes?.status !== 'pending' || isCreating}
                    >
                        {isCreating ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" className="me-2" />
                                Menyimpan...
                            </>
                        ) : (
                            'Simpan Perubahan'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const {
        stores,
        digitalProviders: digitalProvidersState = {},
        storeDigitalProviders: storeDigitalProvidersState = {},
        digitalTopupRequests: digitalTopupRequestsState = {},
        frontSetting,
        allConfigData,
    } = state;

    const normalizeCollection = (collection) => {
        if (Array.isArray(collection)) {
            return collection;
        }

        if (Array.isArray(collection?.data)) {
            return collection.data;
        }

        return [];
    };

    return {
        stores,
        digitalProviders: digitalProvidersState.activeProviders || digitalProvidersState.digitalProviders || [],
        storeDigitalProviders: normalizeCollection(storeDigitalProvidersState.storeDigitalProviders),
        digitalTopupRequests: normalizeCollection(digitalTopupRequestsState.digitalTopupRequests),
        frontSetting,
        allConfigData,
        isLoading: storeDigitalProvidersState.isLoading || digitalTopupRequestsState.isLoading || false,
    };
};

export default connect(mapStateToProps, {
    fetchStore,
    fetchActiveDigitalProviders,
    fetchStoreDigitalProviders,
    fetchDigitalTopupRequests,
    createDigitalTopupRequest,
    editDigitalTopupRequest,
    approveDigitalTopupRequest,
    rejectDigitalTopupRequest,
    completeDigitalTopupRequest,
    deleteDigitalTopupRequest,
})(DigitalBalance);
