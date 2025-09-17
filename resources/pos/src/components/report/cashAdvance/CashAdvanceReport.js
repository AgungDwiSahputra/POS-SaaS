import React, { useEffect, useMemo, useRef, useState } from "react";
import { connect } from "react-redux";
import MasterLayout from "../../MasterLayout";
import TabTitle from "../../../shared/tab-title/TabTitle";
import ReactDataTable from "../../../shared/table/ReactDataTable";
import {
    currencySymbolHandling,
    getFormattedDate,
    getFormattedMessage,
    placeholderText,
} from "../../../shared/sharedMethod";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import { fetchCashAdvanceReport } from "../../../store/action/cashAdvanceReportAction";
import { fetchUsers } from "../../../store/action/userAction";
import { cashAdvanceStatusOptions } from "../../../constants";
import ReactSelect from "../../../shared/select/reactSelect";
import { useIntl } from "react-intl";

const CashAdvanceReport = (props) => {
    const {
        fetchCashAdvanceReport,
        fetchUsers,
        report,
        frontSetting,
        allConfigData,
        users,
        isLoading,
    } = props;

    const [statusFilter, setStatusFilter] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const filtersRef = useRef({});
    const intl = useIntl();

    useEffect(() => {
        fetchUsers({}, true, "?page[size]=0&returnAll=true");
    }, []);

    const statusOptions = useMemo(() => {
        return cashAdvanceStatusOptions.map((option) => ({
            value: option.id,
            label: intl.formatMessage({ id: option.name }),
        }));
    }, [intl]);

    useEffect(() => {
        if (!statusFilter && statusOptions.length > 0) {
            setStatusFilter(statusOptions[0]);
        }
    }, [statusOptions, statusFilter]);

    const userOptions = useMemo(() => {
        return (
            users?.map((user) => ({
                value: user.id,
                label: `${user.attributes?.first_name || ""} ${
                    user.attributes?.last_name || ""
                }`.trim() || user.attributes?.email,
            })) || []
        );
    }, [users]);

    const onChange = (filter) => {
        const mergedFilters = {
            ...filter,
            cash_status: statusFilter?.value ?? "all",
            recorded_by: selectedUser?.value ?? null,
        };
        filtersRef.current = mergedFilters;
        fetchCashAdvanceReport(mergedFilters, true);
    };

    useEffect(() => {
        if (statusFilter) {
            const mergedFilters = {
                ...filtersRef.current,
                cash_status: statusFilter?.value ?? "all",
                recorded_by: selectedUser?.value ?? null,
            };
            filtersRef.current = mergedFilters;
            fetchCashAdvanceReport(mergedFilters, true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, selectedUser]);

    const currencySymbol =
        frontSetting?.value && frontSetting.value.currency_symbol
            ? frontSetting.value.currency_symbol
            : "";

    const itemsValue =
        report?.data?.length >= 0 &&
        report.data.map((cashAdvance) => ({
            date: getFormattedDate(cashAdvance.attributes.date, allConfigData),
            reference_code: cashAdvance.attributes.reference_code,
            issued_to_name: cashAdvance.attributes.issued_to_name,
            warehouse_name: cashAdvance.attributes.warehouse_name,
            amount: cashAdvance.attributes.amount,
            paid_amount: cashAdvance.attributes.paid_amount,
            outstanding_amount: cashAdvance.attributes.outstanding_amount,
            status: cashAdvance.attributes.status,
            status_label: cashAdvance.attributes.status_label,
            recorded_by_name: cashAdvance.attributes.recorded_by_name,
            created_at: cashAdvance.attributes.created_at,
            currency: currencySymbol,
        }));

    const columns = [
        {
            name: getFormattedMessage("globally.detail.reference"),
            selector: (row) => row.reference_code,
            sortField: "reference_code",
            sortable: true,
        },
        {
            name: getFormattedMessage("cash-advance.table.recipient"),
            selector: (row) => row.issued_to_name,
            sortField: "issued_to_name",
            sortable: true,
        },
        {
            name: getFormattedMessage("warehouse.title"),
            selector: (row) => row.warehouse_name,
            sortField: "warehouse_name",
            sortable: true,
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
            sortable: true,
        },
    ];

    const summary = report?.summary || {};

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("cash-advance.report.title")} />
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
                            {getFormattedMessage("cash-advance.summary.total-amount")}
                        </div>
                        <div className="fs-5">
                            {currencySymbolHandling(
                                allConfigData,
                                currencySymbol,
                                summary.total_amount || 0
                            )}
                        </div>
                    </div>
                    <div className="border rounded p-3 flex-fill bg-light">
                        <div className="fw-bold">
                            {getFormattedMessage("cash-advance.summary.total-paid")}
                        </div>
                        <div className="fs-5">
                            {currencySymbolHandling(
                                allConfigData,
                                currencySymbol,
                                summary.total_paid || 0
                            )}
                        </div>
                    </div>
                    <div className="border rounded p-3 flex-fill bg-light">
                        <div className="fw-bold">
                            {getFormattedMessage("cash-advance.summary.outstanding")}
                        </div>
                        <div className="fs-5">
                            {currencySymbolHandling(
                                allConfigData,
                                currencySymbol,
                                summary.total_outstanding || 0
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <ReactDataTable
                columns={columns}
                items={itemsValue}
                onChange={onChange}
                isLoading={isLoading}
                totalRows={report?.meta?.total || 0}
                isShowDateRangeField
                extraFilters={{
                    cash_status: statusFilter?.value ?? "all",
                    recorded_by: selectedUser?.value ?? null,
                }}
            />
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const { cashAdvanceReport, frontSetting, allConfigData, users, isLoading } = state;
    return {
        report: cashAdvanceReport,
        frontSetting,
        allConfigData,
        users,
        isLoading,
    };
};

export default connect(mapStateToProps, { fetchCashAdvanceReport, fetchUsers })(CashAdvanceReport);
