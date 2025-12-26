import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import moment from "moment";
import { Button } from "react-bootstrap-v5";
import MasterLayout from "../MasterLayout";
import { fetchBalanceRequests } from "../../store/action/balanceRequestAction";
import ReactSelect from "../../shared/select/reactSelect";
import ReactDataTable from "../../shared/table/ReactDataTable";
import DeleteBalanceRequest from "./DeleteBalanceRequest";
import TabTitle from "../../shared/tab-title/TabTitle";
import {
    getFormattedDate,
    getFormattedMessage,
    placeholderText,
    currencySymbolHandling,
    getPermission,
} from "../../shared/sharedMethod";
import ActionButton from "../../shared/action-buttons/ActionButton";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import { Permissions } from "../../constants";

const BalanceRequestList = (props) => {
    const {
        fetchBalanceRequests,
        balanceRequests,
        totalRecord,
        isLoading,
        frontSetting,
        allConfigData,
    } = props;

    const [deleteModel, setDeleteModel] = useState(false);
    const [isDelete, setIsDelete] = useState(null);
    const [statusFilter, setStatusFilter] = useState(null);

    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete(isDelete);
    };

    const onChange = (filter) => {
        fetchBalanceRequests(filter, true);
    };

    // Handle status filter change
    const handleStatusFilter = (selectedStatus) => {
        setStatusFilter(selectedStatus);
        const filter = { status: selectedStatus?.value || "" };
        fetchBalanceRequests(filter, true);
    };

    useEffect(() => {
        fetchBalanceRequests();
    }, []);

    const currencySymbol =
        frontSetting &&
        frontSetting.value &&
        frontSetting.value.currency_symbol;

    const formattedPrice = (amount) => {
        return currencySymbolHandling(
            allConfigData,
            currencySymbol,
            amount
        );
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { bg: "warning", text: "Pending" },
            approved: { bg: "success", text: "Approved" },
            rejected: { bg: "danger", text: "Rejected" },
        };
        const config = statusConfig[status] || statusConfig.pending;
        return (
            <span className={`badge bg-light-${config.bg}`}>
                {config.text}
            </span>
        );
    };

    const itemsValue =
        currencySymbol &&
        balanceRequests.length >= 0 &&
        balanceRequests.map((request) => {
            // Handle JSON:API format
            const attributes = request.attributes || request;
            const provider = attributes.provider || request.provider;
            const requestedBy = attributes.requested_by || request.requested_by;
            const processedBy = attributes.processed_by || request.processed_by;

            return {
                provider_name: provider?.nama_provider || "",
                requested_amount: formattedPrice(attributes.requested_amount || request.requested_amount),
                status: attributes.status || request.status,
                notes: attributes.notes || request.notes || "",
                requested_by: requestedBy?.name || requestedBy?.first_name || "-",
                processed_by: processedBy?.name || processedBy?.first_name || "-",
                processed_at: attributes.processed_at || request.processed_at,
                date: getFormattedDate(
                    attributes.created_at || request.created_at,
                    allConfigData && allConfigData
                ),
                time: moment(attributes.created_at || request.created_at).format("LT"),
                id: attributes.id || request.id,
                currency: currencySymbol,
                raw_status: attributes.status || request.status,
            };
        });

    const columns = [
        {
            name: getFormattedMessage("balance-request.input.provider.label"),
            selector: (row) => row.provider_name,
            className: "provider-name",
            sortField: "provider_id",
            sortable: true,
        },
        {
            name: getFormattedMessage("balance-request.input.amount.label"),
            selector: (row) => row.requested_amount,
            sortField: "requested_amount",
            sortable: true,
        },
        {
            name: getFormattedMessage("balance-request.input.status.label"),
            selector: (row) => getStatusBadge(row.raw_status),
            sortField: "status",
            sortable: true,
        },
        {
            name: getFormattedMessage("balance-request.input.notes.label"),
            selector: (row) => row.notes || "-",
            sortField: "notes",
            sortable: true,
            cell: (row) => (
                <span className="text-truncate d-inline-block" style={{ maxWidth: "150px" }}>
                    {row.notes || "-"}
                </span>
            ),
        },
        {
            name: getFormattedMessage("balance-request.input.requested-by.label"),
            selector: (row) => row.requested_by,
            sortField: "requested_by",
            sortable: true,
        },
        {
            name: getFormattedMessage(
                "globally.react-table.column.created-date.label"
            ),
            selector: (row) => row.date,
            sortField: "created_at",
            sortable: true,
            cell: (row) => {
                return (
                    <span className="badge bg-light-info">
                        <div className="mb-1">{row.time}</div>
                        {row.date}
                    </span>
                );
            },
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
                    isViewIcon={false}
                    goToEditProduct={null}
                    onClickDeleteModel={onClickDeleteModel}
                    isDeleteMode={row.raw_status === "pending" && getPermission(allConfigData?.permissions, Permissions.DELETE_BALANCE_REQUESTS)}
                />
            ),
        },
    ];

    const statusOptions = [
        { value: "", label: getFormattedMessage("balance-request.filter.all-status") },
        { value: "pending", label: getFormattedMessage("balance-request.status.pending") },
        { value: "approved", label: getFormattedMessage("balance-request.status.approved") },
        { value: "rejected", label: getFormattedMessage("balance-request.status.rejected") },
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("balance-request.title")} />
            <div className="mb-3">
                <ReactSelect
                    options={statusOptions}
                    onChange={handleStatusFilter}
                    value={statusFilter}
                    placeholder={getFormattedMessage("balance-request.filter.status-placeholder")}
                />
            </div>
            <ReactDataTable
                columns={columns}
                items={itemsValue}
                onChange={onChange}
                isLoading={isLoading}
                totalRows={totalRecord}
                {...(getPermission(allConfigData?.permissions, Permissions.CREATE_BALANCE_REQUESTS) &&
                {
                    to: "#/user/balance-requests/create",
                    buttonValue: getFormattedMessage("balance-request.create.title")
                }
                )}
            />
            <DeleteBalanceRequest
                onClickDeleteModel={onClickDeleteModel}
                deleteModel={deleteModel}
                onDelete={isDelete}
            />
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const {
        balanceRequests,
        totalRecord,
        isLoading,
        frontSetting,
        allConfigData,
    } = state;
    return {
        balanceRequests,
        totalRecord,
        isLoading,
        frontSetting,
        allConfigData,
    };
};

export default connect(mapStateToProps, {
    fetchBalanceRequests,
})(BalanceRequestList);
