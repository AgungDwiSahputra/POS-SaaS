import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "react-bootstrap-v5";
import { connect } from "react-redux";
import moment from "moment";
import MasterLayout from "../MasterLayout";
import { useNavigate } from "react-router-dom";
import ReactDataTable from "../../shared/table/ReactDataTable";
import { fetchCashAdvanceIdentities } from "../../store/action/cashAdvanceIdentityAction";
import DeleteCashAdvanceIdentity from "./DeleteCashAdvanceIdentity";
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
            cell: (row) => (
                <ActionButton
                    item={row}
                    goToEditPage={getPermission().isUpdate && getPermission().isUpdate}
                    goToViewPage={getPermission().isRead && getPermission().isRead}
                    isViewMode={true}
                    isEditMode={true}
                    isDeleteMode={getPermission().isDelete && getPermission().isDelete}
                    onClickDeleteModel={onClickDeleteModel}
                    editUrl={`/user/cash-advance-identities/${row.id}/edit`}
                    viewUrl={`/user/cash-advance-identities/${row.id}`}
                />
            ),
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
            <TabTitle title={getFormattedMessage("cash-advance-identity.title")} />
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
