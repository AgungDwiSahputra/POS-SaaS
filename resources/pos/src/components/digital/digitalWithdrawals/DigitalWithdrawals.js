import React, { useEffect, useMemo, useState } from "react";
import { connect } from "react-redux";
import { Badge, Button } from "react-bootstrap";
import MasterLayout from "../../MasterLayout";
import ReactDataTable from "../../../shared/table/ReactDataTable";
import TabTitle from "../../../shared/tab-title/TabTitle";
import {
    getFormattedMessage,
    getPermission,
    currencySymbolHandling,
} from "../../../shared/sharedMethod";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import { Permissions } from "../../../constants";
import {
    fetchDigitalWithdrawals,
    deleteDigitalWithdrawal,
} from "../../../store/action/digitalWithdrawalAction";
import DeleteDigitalWithdrawal from "./DeleteDigitalWithdrawal";

const DigitalWithdrawals = ({
    digitalWithdrawals,
    totalRecord,
    isLoading,
    allConfigData,
    frontSetting,
    isCallFetchDataApi,
    fetchDigitalWithdrawals,
    deleteDigitalWithdrawal,
}) => {
    const [deleteModel, setDeleteModel] = useState(false);
    const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);

    const currencySymbol = frontSetting?.value?.currency_symbol || "Rp";
    const withdrawalList = useMemo(
        () => (Array.isArray(digitalWithdrawals) ? digitalWithdrawals : []),
        [digitalWithdrawals]
    );

    useEffect(() => {
        fetchDigitalWithdrawals({}, true);
    }, [fetchDigitalWithdrawals]);

    const onClickDeleteModel = (withdrawal = null) => {
        setDeleteModel(!deleteModel);
        setSelectedWithdrawal(withdrawal);
    };

    const onDelete = (withdrawal) => {
        const id = withdrawal?.id || withdrawal?.attributes?.id;
        if (!id) return;
        deleteDigitalWithdrawal(id);
        setDeleteModel(false);
        setSelectedWithdrawal(null);
    };

    const itemsValue = useMemo(
        () =>
            withdrawalList.map((withdrawal) => ({
                reference_code: withdrawal.attributes.reference_code,
                date: withdrawal.attributes.date,
                store_name: withdrawal.attributes.store?.name || "-",
                provider_name: withdrawal.attributes.digital_provider?.name || "-",
                customer_name: withdrawal.attributes.customer_name,
                withdrawal_amount: withdrawal.attributes.withdrawal_amount,
                admin_fee: withdrawal.attributes.admin_fee,
                total_amount: withdrawal.attributes.total_amount,
                status: withdrawal.attributes.status,
                id: withdrawal.id,
            })),
        [withdrawalList]
    );

    const formatCurrency = (amount) =>
        currencySymbolHandling(allConfigData, currencySymbol, amount);

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { variant: "warning", text: "Menunggu" },
            completed: { variant: "success", text: "Selesai" },
            cancelled: { variant: "secondary", text: "Dibatalkan" },
        };

        const config = statusConfig[status] || statusConfig.pending;
        return <Badge bg={config.variant}>{config.text}</Badge>;
    };

    const columns = [
        {
            name: getFormattedMessage("globally.detail.reference-code"),
            selector: (row) => row.reference_code,
            sortField: "reference_code",
            sortable: true,
            cell: (row) => (
                <span className="badge bg-light-primary">{row.reference_code}</span>
            ),
        },
        {
            name: getFormattedMessage("globally.detail.date"),
            selector: (row) => row.date,
            sortField: "date",
            sortable: true,
            cell: (row) => (
                <span className="badge bg-light-info">
                    {row.date ? new Date(row.date).toLocaleDateString("id-ID") : "-"}
                </span>
            ),
        },
        {
            name: getFormattedMessage("store.title"),
            selector: (row) => row.store_name,
            sortField: "store_name",
            sortable: true,
        },
        {
            name: getFormattedMessage("digital-provider.title"),
            selector: (row) => row.provider_name,
            sortField: "provider_name",
            sortable: true,
        },
        {
            name: getFormattedMessage("customer.name"),
            selector: (row) => row.customer_name,
            sortField: "customer_name",
            sortable: false,
        },
        {
            name: getFormattedMessage("digital-withdrawal.withdrawal-amount.label"),
            selector: (row) => row.withdrawal_amount,
            sortField: "withdrawal_amount",
            sortable: true,
            cell: (row) => (
                <span className="text-success fw-bold">
                    {formatCurrency(row.withdrawal_amount)}
                </span>
            ),
        },
        {
            name: getFormattedMessage("digital-withdrawal.admin-fee.label"),
            selector: (row) => row.admin_fee,
            sortField: "admin_fee",
            sortable: true,
            cell: (row) => (
                <span className="text-info">
                    {formatCurrency(row.admin_fee)}
                </span>
            ),
        },
        {
            name: getFormattedMessage("digital-withdrawal.total-amount.label"),
            selector: (row) => row.total_amount,
            sortField: "total_amount",
            sortable: true,
            cell: (row) => (
                <span className="text-primary fw-bold">
                    {formatCurrency(row.total_amount)}
                </span>
            ),
        },
        {
            name: getFormattedMessage("globally.detail.status"),
            selector: (row) => row.status,
            sortField: "status",
            sortable: true,
            cell: (row) => getStatusBadge(row.status),
        },
        {
            name: getFormattedMessage("react-data-table.action.column.label"),
            right: true,
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            cell: (row) => (
                <div className="d-flex">
                    <Button
                        variant="outline-info"
                        size="sm"
                        className="me-2"
                        title={getFormattedMessage("globally.view")}
                    >
                        <i className="bi bi-eye" />
                    </Button>
                    {row.status === "pending" && (
                        <Button
                            variant="outline-danger"
                            size="sm"
                            title={getFormattedMessage("globally.delete.btn")}
                            onClick={() => onClickDeleteModel(row)}
                            disabled={
                                !getPermission(
                                    allConfigData?.permissions,
                                    Permissions.DELETE_DIGITAL_WITHDRAWAL
                                )
                            }
                        >
                            <i className="bi bi-trash" />
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={getFormattedMessage("digital.withdrawal.title")} />

            <div className="row mb-4">
                <div className="col-md-3">
                    <div className="card border-primary">
                        <div className="card-body text-center">
                            <i className="bi bi-cash-stack fs-1 text-primary mb-2" />
                            <h4 className="mb-0">{withdrawalList.length}</h4>
                            <small className="text-muted">Total Penarikan</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-success">
                        <div className="card-body text-center">
                            <i className="bi bi-check-circle fs-1 text-success mb-2" />
                            <h4 className="mb-0">
                                {
                                    withdrawalList.filter(
                                        (item) => item.attributes.status === "completed"
                                    ).length
                                }
                            </h4>
                            <small className="text-muted">Transaksi Selesai</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-warning">
                        <div className="card-body text-center">
                            <i className="bi bi-clock fs-1 text-warning mb-2" />
                            <h4 className="mb-0">
                                {
                                    withdrawalList.filter(
                                        (item) => item.attributes.status === "pending"
                                    ).length
                                }
                            </h4>
                            <small className="text-muted">Menunggu Proses</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-info">
                        <div className="card-body text-center">
                            <i className="bi bi-graph-up fs-1 text-info mb-2" />
                            <h4 className="mb-0">
                                {formatCurrency(
                                    withdrawalList.reduce(
                                        (total, item) =>
                                            total +
                                            parseFloat(item.attributes.withdrawal_amount || 0),
                                        0
                                    )
                                )}
                            </h4>
                            <small className="text-muted">Total Nilai Penarikan</small>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <ReactDataTable
                                columns={columns}
                                items={itemsValue}
                                onChange={(filter) => fetchDigitalWithdrawals(filter, true)}
                                isLoading={isLoading}
                                totalRows={totalRecord}
                                isCallFetchDataApi={isCallFetchDataApi}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <DeleteDigitalWithdrawal
                onClickDeleteModel={onClickDeleteModel}
                deleteModel={deleteModel}
                onDelete={onDelete}
                digitalWithdrawal={selectedWithdrawal}
            />
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const {
        digitalWithdrawals: digitalWithdrawalsState = {},
        allConfigData,
        frontSetting,
        isCallFetchDataApi,
    } = state;

    return {
        digitalWithdrawals: digitalWithdrawalsState.digitalWithdrawals || [],
        totalRecord: digitalWithdrawalsState.totalRecord || 0,
        isLoading: digitalWithdrawalsState.isLoading || false,
        allConfigData,
        frontSetting,
        isCallFetchDataApi,
    };
};

export default connect(mapStateToProps, {
    fetchDigitalWithdrawals,
    deleteDigitalWithdrawal,
})(DigitalWithdrawals);
