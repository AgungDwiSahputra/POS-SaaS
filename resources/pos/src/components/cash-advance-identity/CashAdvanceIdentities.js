import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "react-bootstrap-v5";
import { connect } from "react-redux";
import moment from "moment";
import MasterLayout from "../MasterLayout";
import { useNavigate } from "react-router-dom";
import ReactDataTable from "../../shared/table/ReactDataTable";
import { fetchCashAdvanceIdentities, editCashAdvanceIdentity } from "../../store/action/cashAdvanceIdentityAction";
import DeleteCashAdvanceIdentity from "./DeleteCashAdvanceIdentity";
import EditCashAdvanceIdentityModal from "./EditCashAdvanceIdentityModal";
import TabTitle from "../../shared/tab-title/TabTitle";
import {
    currencySymbolHandling,
    getFormattedDate,
    getFormattedMessage,
    getPermission,
    getFormattedOptions,
    placeholderText,
} from "../../shared/sharedMethod";
import ActionButton from "../../shared/action-buttons/ActionButton";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import { Permissions } from "../../constants";
import ReactSelect from "../../shared/select/reactSelect";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";

const CashAdvanceIdentities = (props) => {
    const {
        fetchCashAdvanceIdentities,
        cashAdvanceIdentities,
        totalRecord,
        isLoading,
        frontSetting,
        allConfigData,
        isCallFetchDataApi,
    } = props;
    const [deleteModel, setDeleteModel] = useState(false);
    const [isDelete, setIsDelete] = useState(null);
    const [editModal, setEditModal] = useState(false);
    const [selectedIdentity, setSelectedIdentity] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const filtersRef = useRef({});
    const intl = useIntl();

    const typeOptions = useMemo(() => {
        return [
            { value: 'employee', label: intl.formatMessage({ id: "cash-advance-identity.type.employee" }) },
            { value: 'contractor', label: intl.formatMessage({ id: "cash-advance-identity.type.contractor" }) },
            { value: 'other', label: intl.formatMessage({ id: "cash-advance-identity.type.other" }) },
        ];
    }, [intl]);

    const [typeFilter, setTypeFilter] = useState(() => typeOptions[0] || {
        value: "all",
        label: intl.formatMessage({ id: "unit.filter.all.label" }),
    });

    const [statusFilter, setStatusFilter] = useState(() => ({
        value: "all",
        label: intl.formatMessage({ id: "unit.filter.all.label" }),
    }));

    const statusOptions = useMemo(() => {
        return [
            { value: "all", label: intl.formatMessage({ id: "unit.filter.all.label" }) },
            { value: true, label: intl.formatMessage({ id: "cash-advance-identity.status.active" }) },
            { value: false, label: intl.formatMessage({ id: "cash-advance-identity.status.inactive" }) },
        ];
    }, [intl]);

    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete(isDelete);
    };

    const onClickEditModel = (identity = null) => {
        console.log("Edit button clicked for identity:", identity);
        setEditModal(!editModal);
        setSelectedIdentity(identity);
        setError(null);
    };

    const handleSaveIdentity = async (formData) => {
        setIsSaving(true);
        setError(null);

        try {
            console.log("Saving identity data:", formData);
            await editCashAdvanceIdentity(selectedIdentity.id, formData, navigate);
            setEditModal(false);
            setSelectedIdentity(null);
            // Refresh the list
            fetchCashAdvanceIdentities();
        } catch (err) {
            console.error("Error saving identity:", err);
            const errorMessage = err.response?.data?.message || 'Terjadi kesalahan saat menyimpan';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const onChange = (filter) => {
        const mergedFilters = {
            ...filter,
            ...filtersRef.current,
        };
        filtersRef.current = mergedFilters;
        fetchCashAdvanceIdentities(mergedFilters);
    };

    const onTypeChange = (obj) => {
        setTypeFilter(obj);
        const filter = { ...filtersRef.current };
        if (obj.value === "all") {
            delete filter.type;
        } else {
            filter.type = obj.value;
        }
        onChange(filter);
    };

    const onStatusChange = (obj) => {
        setStatusFilter(obj);
        const filter = { ...filtersRef.current };
        if (obj.value === "all") {
            delete filter.is_active;
        } else {
            filter.is_active = obj.value;
        }
        onChange(filter);
    };

    useEffect(() => {
        fetchCashAdvanceIdentities();
    }, []);

    const columns = [
        {
            name: getFormattedMessage("cash-advance-identity.input.name.label"),
            selector: (row) => row.attributes?.name,
            sortable: true,
            cell: (row) => (
                <div>
                    <div className="fw-bold">{row.attributes?.name}</div>
                    {row.attributes?.employee_id && (
                        <small className="text-muted">ID: {row.attributes?.employee_id}</small>
                    )}
                </div>
            ),
        },
        {
            name: getFormattedMessage("cash-advance-identity.input.type.label"),
            selector: (row) => row.attributes?.type,
            sortable: true,
            cell: (row) => (
                <span className={`badge bg-${row.attributes?.type === 'employee' ? 'primary' : row.attributes?.type === 'contractor' ? 'warning' : 'secondary'}`}>
                    {intl.formatMessage({ id: `cash-advance-identity.type.${row.attributes?.type}` })}
                </span>
            ),
        },
        {
            name: getFormattedMessage("cash-advance-identity.input.department.label"),
            selector: (row) => row.attributes?.department,
            sortable: true,
            cell: (row) => row.attributes?.department || '-',
        },
        {
            name: getFormattedMessage("cash-advance-identity.input.contact.label"),
            selector: (row) => row.attributes?.phone,
            sortable: true,
            cell: (row) => (
                <div>
                    {row.attributes?.phone && <div>{row.attributes?.phone}</div>}
                    {row.attributes?.email && <small className="text-muted">{row.attributes?.email}</small>}
                </div>
            ),
        },
        {
            name: getFormattedMessage("cash-advance-identity.summary.total_advances.label"),
            selector: (row) => row.attributes?.total_advances,
            sortable: true,
            cell: (row) => (
                <span className="badge bg-info">
                    {row.attributes?.total_advances || 0}
                </span>
            ),
        },
        {
            name: getFormattedMessage("cash-advance-identity.summary.outstanding.label"),
            selector: (row) => row.attributes?.total_outstanding,
            sortable: true,
            cell: (row) => (
                <span className={`fw-bold ${(row.attributes?.total_outstanding || 0) > 0 ? 'text-danger' : 'text-success'}`}>
                    {currencySymbolHandling(frontSetting?.value?.currency_symbol, row.attributes?.total_outstanding || 0)}
                </span>
            ),
        },
        {
            name: getFormattedMessage("cash-advance-identity.input.status.label"),
            selector: (row) => row.attributes?.is_active,
            sortable: true,
            cell: (row) => (
                <span className={`badge bg-${row.attributes?.is_active ? 'success' : 'danger'}`}>
                    {intl.formatMessage({ id: `cash-advance-identity.status.${row.attributes?.is_active ? 'active' : 'inactive'}` })}
                </span>
            ),
        },
        {
            name: getFormattedMessage("react-data-table.action.column.label"),
            cell: (row) => {
                const permissions = getPermission();
                console.log("Permissions for row:", row.id, permissions);

                return (
                    <div className="d-flex align-items-center">
                        {/* Tombol Lihat Cash Advances */}
                        {permissions.isRead && (
                            <button
                                className="btn btn-sm btn-outline-primary me-2"
                                onClick={() => navigate(`/user/cash-advance-identities/${row.id}`)}
                                title={getFormattedMessage("globally.view.tooltip.label")}
                                aria-label="Lihat Cash Advances"
                            >
                                <i className="bi bi-eye me-1"></i>
                                Lihat
                            </button>
                        )}

                        {/* Tombol Ubah - ditempatkan di sebelah kiri tombol Lihat */}
                        {permissions.isUpdate && (
                            <button
                                className="btn btn-sm btn-outline-warning me-2"
                                onClick={() => onClickEditModel(row)}
                                title="Ubah Identitas Cash Advance"
                                aria-label="Ubah Identitas"
                            >
                                <i className="bi bi-pencil me-1"></i>
                                Ubah
                            </button>
                        )}

                        {/* Tombol Hapus */}
                        {permissions.isDelete && (
                            <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => onClickDeleteModel(row)}
                                title={getFormattedMessage("globally.delete.tooltip.label")}
                                aria-label="Hapus Identitas"
                            >
                                <i className="bi bi-trash me-1"></i>
                                Hapus
                            </button>
                        )}

                        {/* Jika tidak ada permission, tampilkan tanda - */}
                        {!permissions.isRead && !permissions.isUpdate && !permissions.isDelete && (
                            <span className="text-muted small">-</span>
                        )}
                    </div>
                );
            },
        },
    ];

    const filterOptions = [
        {
            name: "type",
            title: getFormattedMessage("cash-advance-identity.input.type.label"),
            options: typeOptions,
            value: typeFilter,
            onChange: onTypeChange,
        },
        {
            name: "is_active",
            title: getFormattedMessage("cash-advance-identity.input.status.label"),
            options: statusOptions,
            value: statusFilter,
            onChange: onStatusChange,
        },
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("cash-advance-identity.title")} />
            <div className="card">
                <div className="card-body">
                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center">
                            <h4 className="mb-0 me-3">
                                {getFormattedMessage("cash-advance-identity.title")}
                            </h4>
                            <span className="badge bg-primary fs-6">
                                {totalRecord}
                            </span>
                        </div>
                        {getPermission().isCreate && getPermission().isCreate && (
                            <Button
                                className="btn btn-primary d-flex align-items-center"
                                onClick={() => navigate("/user/cash-advance-identities/create")}
                            >
                                <i className="bi bi-plus-circle me-2"></i>
                                {getFormattedMessage("cash-advance-identity.create.title")}
                            </Button>
                        )}
                    </div>
                    <ReactDataTable
                        columns={columns}
                        items={cashAdvanceIdentities}
                        onChange={onChange}
                        isLoading={isLoading}
                        filterOptions={filterOptions}
                        isCallFetchDataApi={isCallFetchDataApi}
                        totalRecord={totalRecord}
                    />
                </div>
            </div>
            <DeleteCashAdvanceIdentity
                show={deleteModel}
                onDeleteModel={onClickDeleteModel}
                onDelete={isDelete}
            />
            <EditCashAdvanceIdentityModal
                show={editModal}
                onHide={() => {
                    setEditModal(false);
                    setSelectedIdentity(null);
                    setError(null);
                }}
                identity={selectedIdentity}
                onSave={handleSaveIdentity}
                isSaving={isSaving}
                error={error}
            />
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const { cashAdvanceIdentities, frontSetting, allConfigData, isCallFetchDataApi } = state;
    return {
        cashAdvanceIdentities: cashAdvanceIdentities.cashAdvanceIdentities,
        totalRecord: cashAdvanceIdentities.totalRecord,
        isLoading: cashAdvanceIdentities.isLoading,
        frontSetting: frontSetting,
        allConfigData: allConfigData,
        isCallFetchDataApi: isCallFetchDataApi,
    };
};

export default connect(mapStateToProps, { fetchCashAdvanceIdentities })(CashAdvanceIdentities);
