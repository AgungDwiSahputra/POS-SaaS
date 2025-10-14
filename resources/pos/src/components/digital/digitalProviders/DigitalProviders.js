import React, { useState, useMemo, useEffect } from "react";
import { connect } from "react-redux";
import MasterLayout from "../../MasterLayout";
import ReactDataTable from "../../../shared/table/ReactDataTable";
import DeleteDigitalProvider from "./DeleteDigitalProvider";
import TabTitle from "../../../shared/tab-title/TabTitle";
import ErrorBoundary from "../../../shared/components/ErrorBoundary";
import {
    getFormattedMessage,
    getPermission,
    placeholderText,
} from "../../../shared/sharedMethod";
import ActionButton from "../../../shared/action-buttons/ActionButton";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import { Permissions } from "../../../constants";
import { fetchDigitalProviders, deleteDigitalProvider } from "../../../store/action/digitalProviderAction";
import { validateDataType } from "../../../shared/utils/errorHandler";

const resolveLogoUrl = (logo) => {
    if (!logo) {
        return "";
    }

    const trimmed = logo.trim();

    if (/^https?:\/\//i.test(trimmed)) {
        return trimmed;
    }

    if (trimmed.startsWith('/')) {
        return trimmed;
    }

    if (/^storage\//i.test(trimmed)) {
        return `/${trimmed}`;
    }

    if (/^app\//i.test(trimmed)) {
        return `/storage/${trimmed}`;
    }

    return `/storage/${trimmed}`;
};

const DigitalProviders = ({
    digitalProviders,
    totalRecord,
    isLoading,
    allConfigData,
    isCallFetchDataApi,
    fetchDigitalProviders,
    deleteDigitalProvider,
}) => {

    const [deleteModel, setDeleteModel] = useState(false);
    const [isDelete, setIsDelete] = useState(null);

    useEffect(() => {
        fetchDigitalProviders();
    }, [fetchDigitalProviders]);

    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete(isDelete);
    };

    const itemsValue = useMemo(() => {
        try {
            // Validate data type
            validateDataType(digitalProviders, 'array', 'DigitalProviders: digitalProviders');

            if (!digitalProviders || digitalProviders.length === 0) {
                return [];
            }

            return digitalProviders.map((provider, index) => {
                try {
                    // Validate each provider object
                    validateDataType(provider, 'object', `DigitalProviders: provider at index ${index}`);

                    const attributes = provider.attributes || provider;
                    return {
                        id: provider.id || attributes.id || '',
                        name: attributes.name || '',
                        code: attributes.code || '',
                        description: attributes.description || '',
                        logo: resolveLogoUrl(attributes.logo),
                        is_active: attributes.is_active ?? false,
                    };
                } catch (providerError) {
                    console.warn(`Error processing provider at index ${index}:`, providerError);
                    // Return safe default for corrupted provider data
                    return {
                        name: 'Data Error',
                        code: 'ERROR',
                        description: 'Data provider tidak valid',
                        logo: '',
                        is_active: false,
                        id: `error_${index}`,
                    };
                }
            });
        } catch (error) {
            console.error('Error processing digitalProviders data:', error);
            return [];
        }
    }, [digitalProviders]);

    const onChange = (filter) => {
        fetchDigitalProviders(filter);
    };

    const goToEdit = (item) => {
        const id = item.id;
        window.location.href = "#/user/digital/digital-providers/edit/" + id;
    };

    const goToCreate = () => {
        window.location.href = "#/user/digital/digital-providers/create";
    };

    const onDelete = (id) => {
        deleteDigitalProvider(id);
        setDeleteModel(false);
        setIsDelete(null);
    };

    const columns = [
        {
            name: getFormattedMessage("digital-provider.title"),
            selector: (row) => row.name,
            sortField: "name",
            sortable: true,
            width: "200px",
            cell: (row) => (
                <div className="d-flex align-items-center">
                    {row.logo && (
                        <img
                            src={row.logo}
                            height="30"
                            width="30"
                            alt={row.name}
                            className="me-2 rounded-circle"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    )}
                    <span className="text-truncate" title={row.name}>{row.name}</span>
                </div>
            ),
        },
        {
            name: getFormattedMessage("globally.detail.code"),
            selector: (row) => row.code,
            sortField: "code",
            sortable: true,
            width: "100px",
            cell: (row) => (
                <span className="badge bg-light-primary text-center" style={{ minWidth: "60px" }}>
                    {row.code}
                </span>
            ),
        },
        {
            name: getFormattedMessage("globally.detail.description"),
            selector: (row) => row.description,
            sortField: "description",
            sortable: false,
            width: "300px",
            cell: (row) => (
                <div className="text-wrap" style={{ maxWidth: "300px" }}>
                    <span title={row.description || "-"}>
                        {row.description || "-"}
                    </span>
                </div>
            ),
        },
        {
            name: getFormattedMessage("globally.detail.status"),
            selector: (row) => row.is_active,
            sortField: "is_active",
            sortable: false,
            width: "100px",
            cell: (row) => (
                <span
                    className={`badge ${
                        row.is_active ? "bg-light-success" : "bg-light-danger"
                    }`}
                >
                    {row.is_active
                        ? getFormattedMessage("globally.active")
                        : getFormattedMessage("globally.in-active")}
                </span>
            ),
        },
        {
            name: getFormattedMessage("react-data-table.action.column.label"),
            right: true,
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: "120px",
            cell: (row) => (
                <ActionButton
                    item={row}
                    goToEditProduct={goToEdit}
                    isEditMode={getPermission(
                        allConfigData?.permissions,
                        Permissions.EDIT_DIGITAL_PROVIDERS
                    )}
                    onClickDeleteModel={onClickDeleteModel}
                    isDeleteMode={getPermission(
                        allConfigData?.permissions,
                        Permissions.DELETE_DIGITAL_PROVIDERS
                    )}
                />
            ),
        },
    ];

    return (
        <ErrorBoundary>
            <MasterLayout>
                <TopProgressBar />
                <TabTitle title={getFormattedMessage("digital.providers.title")} />
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body">
                                <style jsx>{`
                                    .digital-providers-table .rdt_TableHeadRow .rdt_TableCol {
                                        font-weight: 600;
                                        background-color: #f8f9fa;
                                        border-bottom: 2px solid #dee2e6;
                                    }
                                    .digital-providers-table .rdt_TableRow:hover {
                                        background-color: #f8f9fa;
                                    }
                                    .digital-providers-table .rdt_TableCell {
                                        padding: 12px 8px;
                                        vertical-align: middle;
                                    }
                                    .digital-providers-table .text-truncate {
                                        white-space: nowrap;
                                        overflow: hidden;
                                        text-overflow: ellipsis;
                                    }
                                    .digital-providers-table .text-wrap span {
                                        display: block;
                                        word-break: break-word;
                                        line-height: 1.4;
                                    }
                                `}</style>
                                <ReactDataTable
                                    columns={columns}
                                    items={itemsValue || []}
                                    onChange={onChange}
                                    isLoading={isLoading}
                                    totalRows={totalRecord}
                                    isCallFetchDataApi={isCallFetchDataApi}
                                    customClass="digital-providers-table"
                                    AddButton={
                                        getPermission(
                                            allConfigData?.permissions,
                                            Permissions.CREATE_DIGITAL_PROVIDERS
                                        ) && (
                                            <button
                                                className="btn btn-primary"
                                                onClick={goToCreate}
                                            >
                                                {getFormattedMessage("digital-provider.create.title")}
                                            </button>
                                        )
                                    }
                                />
                                <DeleteDigitalProvider
                                    onClickDeleteModel={onClickDeleteModel}
                                    deleteModel={deleteModel}
                                    onDelete={onDelete}
                                    id={isDelete}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </MasterLayout>
        </ErrorBoundary>
    );
};

const mapStateToProps = (state) => {
    const {
        digitalProviders: digitalProvidersState = {},
        allConfigData,
        isCallFetchDataApi,
    } = state;

    return {
        digitalProviders: digitalProvidersState.digitalProviders || [],
        totalRecord: digitalProvidersState.totalRecord || 0,
        isLoading: digitalProvidersState.isLoading || false,
        allConfigData,
        isCallFetchDataApi,
    };
};

export default connect(mapStateToProps, {
    fetchDigitalProviders,
    deleteDigitalProvider,
})(DigitalProviders);
