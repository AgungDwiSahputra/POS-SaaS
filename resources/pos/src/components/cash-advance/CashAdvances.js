import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "react-bootstrap-v5";
import { connect } from "react-redux";
import moment from "moment";
import MasterLayout from "../MasterLayout";
import { useNavigate } from "react-router-dom";
import ReactDataTable from "../../shared/table/ReactDataTable";
import { fetchCashAdvances } from "../../store/action/cashAdvanceAction";
import DeleteCashAdvance from "./DeleteCashAdvance";
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
import { Permissions, cashAdvanceStatusOptions } from "../../constants";
import ReactSelect from "../../shared/select/reactSelect";
import { fetchUsers } from "../../store/action/userAction";
import CashAdvancePaymentsModal from "./CashAdvancePaymentsModal";
import { useIntl } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";

const CashAdvances = (props) => {
    const {
        fetchCashAdvances,
        cashAdvances,
        totalRecord,
        isLoading,
        frontSetting,
        allConfigData,
        isCallFetchDataApi,
        fetchUsers,
        users,
        cashAdvanceSummary,
    } = props;
    const [deleteModel, setDeleteModel] = useState(false);
    const [isDelete, setIsDelete] = useState(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedAdvance, setSelectedAdvance] = useState(null);
    const navigate = useNavigate();
    const filtersRef = useRef({});
    const intl = useIntl();
    const canCreateCashAdvance = getPermission(
        allConfigData?.permissions,
        Permissions.CREATE_CASH_ADVANCES
    );

    const handleDuplicate = (cashAdvanceRow) => {
        if (!cashAdvanceRow) {
            return;
        }

        navigate('/user/cash-advances/create', {
            state: {
                prefill: {
                    warehouse_id: cashAdvanceRow.warehouse_id,
                    warehouse_name: cashAdvanceRow.warehouse_name,
                    issued_to_name: cashAdvanceRow.issued_to_name,
                    issued_to_phone: cashAdvanceRow.issued_to_phone,
                    issued_to_email: cashAdvanceRow.issued_to_email,
                },
            },
        });
    };

    useEffect(() => {
        fetchUsers({}, true, "?page[size]=0&returnAll=true");
    }, []);

    const statusOptions = useMemo(() => {
        return cashAdvanceStatusOptions.map((option) => ({
            value: option.id,
            label: intl.formatMessage({ id: option.name }),
        }));
    }, [intl]);

    const [statusFilter, setStatusFilter] = useState(() => statusOptions[0] || {
        value: "all",
        label: intl.formatMessage({ id: "unit.filter.all.label" }),
    });
    const [selectedUser, setSelectedUser] = useState(null);

    const userOptions = useMemo(() => {
        return (
            users?.map((user) => ({
                value: user.id,
                label:
                    `${user.attributes?.first_name || ""} ${
                        user.attributes?.last_name || ""
                    }`.trim() || user.attributes?.email,
            })) || []
        );
    }, [users]);

    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete(isDelete);
    };

    const onChange = (filter) => {
        const mergedFilters = {
            ...filter,
            cash_status: statusFilter?.value ?? "all",
            recorded_by: selectedUser?.value ?? null,
        };
        filtersRef.current = mergedFilters;
        fetchCashAdvances(mergedFilters, true);
    };

    useEffect(() => {
        const baseFilters = {
            ...filtersRef.current,
            cash_status: statusFilter?.value ?? "all",
            recorded_by: selectedUser?.value ?? null,
        };
        filtersRef.current = baseFilters;
        fetchCashAdvances(baseFilters, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, selectedUser]);

    const goToEditRecord = (item) => {
        navigate(`/user/cash-advances/edit/${item.id}`);
    };

    const currencySymbol =
        frontSetting &&
        frontSetting.value &&
        frontSetting.value.currency_symbol;

    const itemsValue =
        currencySymbol &&
        cashAdvances.length >= 0 &&
        cashAdvances.map((cashAdvance) => ({
            date: getFormattedDate(
                cashAdvance.attributes.date,
                allConfigData && allConfigData
            ),
            time: moment(cashAdvance.attributes.created_at).format("LT"),
            reference_code: cashAdvance.attributes.reference_code,
            issued_to_name: cashAdvance.attributes.issued_to_name,
            issued_to_phone: cashAdvance.attributes.issued_to_phone,
            issued_to_email: cashAdvance.attributes.issued_to_email,
            warehouse_name: cashAdvance.attributes.warehouse_name,
            warehouse_id: cashAdvance.attributes.warehouse_id,
            recorded_by_name: cashAdvance.attributes.recorded_by_name,
            amount: cashAdvance.attributes.amount,
            paid_amount: cashAdvance.attributes.paid_amount,
            outstanding_amount: cashAdvance.attributes.outstanding_amount,
            status: cashAdvance.attributes.status,
            status_label: cashAdvance.attributes.status_label,
            payments_count: cashAdvance.attributes.payments_count,
            notes: cashAdvance.attributes.notes,
            id: cashAdvance.id,
            currency: currencySymbol,
        }));

    const columns = [
        {
            name: getFormattedMessage("globally.detail.reference"),
            sortField: "reference_code",
            sortable: true,
            cell: (row) => (
                <span className="badge bg-light-primary">
                    <span>{row.reference_code}</span>
                </span>
            ),
        },
        {
            name: getFormattedMessage("cash-advance.table.recipient"),
            selector: (row) => row.issued_to_name,
            sortField: "issued_to_name",
            sortable: true,
        },
        {
            name: getFormattedMessage("cash-advance.table.contact"),
            selector: (row) => `${row.issued_to_phone || ""} ${row.issued_to_email || ""}`.trim(),
            sortField: "issued_to_phone",
            sortable: false,
            cell: (row) => (
                <div className="d-flex flex-column">
                    <span>{row.issued_to_phone || "-"}</span>
                    <span>{row.issued_to_email || "-"}</span>
                </div>
            ),
        },
        {
            name: getFormattedMessage("warehouse.title"),
            selector: (row) => row.warehouse_name,
            sortField: "warehouse_name",
            sortable: false,
        },
        {
            name: getFormattedMessage("amount.title"),
            selector: (row) =>
                currencySymbolHandling(allConfigData, row.currency, row.amount),
            sortField: "amount",
            sortable: true,
        },
        {
            name: getFormattedMessage("cash-advance.table.paid-amount"),
            selector: (row) =>
                currencySymbolHandling(allConfigData, row.currency, row.paid_amount),
            sortField: "paid_amount",
            sortable: true,
        },
        {
            name: getFormattedMessage("cash-advance.table.outstanding"),
            selector: (row) =>
                currencySymbolHandling(
                    allConfigData,
                    row.currency,
                    row.outstanding_amount
                ),
            sortField: "outstanding_amount",
            sortable: true,
        },
        {
            name: getFormattedMessage("globally.detail.status"),
            selector: (row) => row.status_label,
            sortField: "status",
            sortable: true,
            cell: (row) => (
                <span
                    className={`badge ${
                        row.status === 1 ? "bg-light-success" : "bg-light-warning"
                    }`}
                >
                    {row.status_label}
                </span>
            ),
        },
        {
            name: getFormattedMessage("cash-advance.table.recorded-by"),
            selector: (row) => row.recorded_by_name || "-",
            sortField: "recorded_by_name",
            sortable: false,
        },
        {
            name: getFormattedMessage(
                "globally.react-table.column.created-date.label"
            ),
            selector: (row) => row.date,
            sortField: "created_at",
            sortable: true,
            cell: (row) => (
                <span className="badge bg-light-info">
                    <div className="mb-1">{row.time}</div>
                    {row.date}
                </span>
            ),
        },
        {
            name: getFormattedMessage("cash-advance.table.notes"),
            selector: (row) => row.notes || "-",
            sortField: "notes",
            sortable: false,
            wrap: true,
        },
        {
            name: getFormattedMessage("cash-advance.table.installments"),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            cell: (row) => (
                <div className="d-flex flex-wrap align-items-center gap-2">
                    <Button
                        variant="outline-primary"
                        size="sm"
                        className="d-flex align-items-center gap-1 text-nowrap"
                        onClick={() => {
                            setSelectedAdvance(row);
                            setIsPaymentModalOpen(true);
                        }}
                    >
                        {getFormattedMessage("cash-advance.payment.view")}
                    </Button>
                    {canCreateCashAdvance ? (
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            className="d-flex align-items-center gap-1 text-nowrap"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicate(row);
                            }}
                        >
                            <FontAwesomeIcon icon={faCopy} />
                            {getFormattedMessage("cash-advance.duplicate.button")}
                        </Button>
                    ) : null}
                </div>
            ),
        },
        ...((getPermission(allConfigData?.permissions, Permissions.EDIT_CASH_ADVANCES) ||
            getPermission(
                allConfigData?.permissions,
                Permissions.DELETE_CASH_ADVANCES
            ))
            ? [
                {
                    name: getFormattedMessage(
                        "react-data-table.action.column.label"
                    ),
                    right: true,
                    ignoreRowClick: true,
                    allowOverflow: true,
                    button: true,
                    cell: (row) => (
                        <ActionButton
                            item={row}
                            goToEditProduct={goToEditRecord}
                            isEditMode={getPermission(
                                allConfigData?.permissions,
                                Permissions.EDIT_CASH_ADVANCES
                            )}
                            onClickDeleteModel={onClickDeleteModel}
                            isDeleteMode={getPermission(
                                allConfigData?.permissions,
                                Permissions.DELETE_CASH_ADVANCES
                            )}
                        />
                    ),
                },
            ]
            : []),
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("cash-advance.title")} />
            <div className="row g-3 mb-4">
                <div className="col-md-3">
                    <ReactSelect
                        title={getFormattedMessage("cash-advance.filter.status")}
                        data={statusOptions}
                        value={statusFilter}
                        onChange={(option) => setStatusFilter(option)}
                        isRequired
                    />
                </div>
                <div className="col-md-3">
                    <ReactSelect
                        title={getFormattedMessage("cash-advance.filter.recorded-by")}
                        data={[
                            {
                                value: null,
                                label: getFormattedMessage("unit.filter.all.label"),
                            },
                            ...userOptions,
                        ]}
                        value={selectedUser}
                        onChange={(option) => setSelectedUser(option?.value ? option : null)}
                    />
                </div>
                <div className="col-md-6 d-flex align-items-center gap-3">
                    <div className="border rounded p-3 flex-fill bg-light">
                        <div className="fw-bold">
                            {getFormattedMessage("cash-advance.summary.pending-count")}
                        </div>
                        <div className="fs-4">{cashAdvanceSummary?.pending ?? 0}</div>
                    </div>
                    <div className="border rounded p-3 flex-fill bg-light">
                        <div className="fw-bold">
                            {getFormattedMessage("cash-advance.summary.paid-count")}
                        </div>
                        <div className="fs-4">{cashAdvanceSummary?.paid_off ?? 0}</div>
                    </div>
                </div>
            </div>
            <ReactDataTable
                columns={columns}
                items={itemsValue}
                onChange={onChange}
                isLoading={isLoading}
                totalRows={totalRecord}
                {...(getPermission(
                    allConfigData?.permissions,
                    Permissions.CREATE_CASH_ADVANCES
                ) && {
                    to: "#/user/cash-advances/create",
                    buttonValue: getFormattedMessage("cash-advance.create.title"),
                })}
                isCallFetchDataApi={isCallFetchDataApi}
                extraFilters={{
                    cash_status: statusFilter?.value ?? "all",
                    recorded_by: selectedUser?.value ?? null,
                }}
            />
            <DeleteCashAdvance
                onClickDeleteModel={onClickDeleteModel}
                deleteModel={deleteModel}
                onDelete={isDelete}
            />
            {isPaymentModalOpen && selectedAdvance ? (
                <CashAdvancePaymentsModal
                    show={isPaymentModalOpen}
                    onHide={() => setIsPaymentModalOpen(false)}
                    cashAdvance={selectedAdvance}
                    onPaymentSuccess={() => {
                        if (filtersRef.current) {
                            fetchCashAdvances(filtersRef.current, true);
                        }
                    }}
                />
            ) : null}
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const {
        cashAdvances,
        totalRecord,
        isLoading,
        frontSetting,
        allConfigData,
        isCallFetchDataApi,
        users,
        cashAdvanceSummary,
    } = state;
    return {
        cashAdvances,
        totalRecord,
        isLoading,
        frontSetting,
        allConfigData,
        isCallFetchDataApi,
        users,
        cashAdvanceSummary,
    };
};

export default connect(mapStateToProps, {
    fetchCashAdvances,
    fetchUsers,
})(CashAdvances);
