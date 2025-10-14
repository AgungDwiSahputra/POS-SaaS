import React, { useEffect, useMemo, useState } from "react";
import { connect } from "react-redux";
import { Badge, Button, Modal } from "react-bootstrap";
import MasterLayout from "../../MasterLayout";
import ReactDataTable from "../../../shared/table/ReactDataTable";
import TabTitle from "../../../shared/tab-title/TabTitle";
import {
    getFormattedMessage,
    currencySymbolHandling,
} from "../../../shared/sharedMethod";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import {
    fetchDigitalTopupRequests,
    approveDigitalTopupRequest,
    rejectDigitalTopupRequest,
} from "../../../store/action/digitalTopupRequestAction";

const TopupRequests = ({
    topupRequests,
    totalRecord,
    isLoading,
    allConfigData,
    frontSetting,
    isCallFetchDataApi,
    fetchDigitalTopupRequests,
    approveDigitalTopupRequest,
    rejectDigitalTopupRequest,
}) => {
    const [approvalModal, setApprovalModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [approvalAction, setApprovalAction] = useState("approve");

    const currencySymbol = frontSetting?.value?.currency_symbol || "Rp";
    const requestList = useMemo(
        () => (Array.isArray(topupRequests) ? topupRequests : []),
        [topupRequests]
    );

    useEffect(() => {
        fetchDigitalTopupRequests({}, true);
    }, [fetchDigitalTopupRequests]);

    const onApprovalModal = (request, action) => {
        setSelectedRequest(request);
        setApprovalAction(action);
        setApprovalModal(true);
    };

    const formatCurrency = (amount) =>
        currencySymbolHandling(allConfigData, currencySymbol, amount);

    const itemsValue = useMemo(
        () =>
            requestList.map((request) => ({
                request_code: request.attributes.request_code,
                store_name: request.attributes.store?.name || "-",
                provider_name: request.attributes.digital_provider?.name || "-",
                requested_by_name:
                    `${request.attributes.requested_by?.first_name || ""} ${
                        request.attributes.requested_by?.last_name || ""
                    }`.trim() || "-",
                amount: request.attributes.amount,
                current_balance: request.attributes.current_balance,
                balance_after_topup: request.attributes.balance_after_topup,
                status: request.attributes.status,
                reason: request.attributes.reason,
                created_at: request.attributes.created_at,
                id: request.id,
            })),
        [requestList]
    );

    const pendingTopupRequests = useMemo(
        () =>
            requestList.filter((request) => request.attributes.status === "pending"),
        [requestList]
    );

    const handleApproval = (action) => {
        if (!selectedRequest?.id) {
            setApprovalModal(false);
            return;
        }

        if (action === "approve") {
            approveDigitalTopupRequest(selectedRequest.id, "", null);
        } else {
            rejectDigitalTopupRequest(selectedRequest.id, "", null);
        }

        setApprovalModal(false);
        fetchDigitalTopupRequests({}, false);
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { variant: "warning", text: getFormattedMessage("topup-requests.pending-requests") },
            approved: { variant: "info", text: "Disetujui" },
            rejected: { variant: "danger", text: "Ditolak" },
            completed: { variant: "success", text: "Selesai" },
            cancelled: { variant: "secondary", text: "Dibatalkan" },
        };

        const config = statusConfig[status] || statusConfig.pending;
        return <Badge bg={config.variant}>{config.text}</Badge>;
    };

    const columns = [
        {
            name: getFormattedMessage("topup-request.request-code.label"),
            selector: (row) => row.request_code,
            sortField: "request_code",
            sortable: true,
            cell: (row) => (
                <span className="badge bg-light-primary">{row.request_code}</span>
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
            name: getFormattedMessage("topup-request.requested-by.label"),
            selector: (row) => row.requested_by_name,
            sortField: "requested_by_name",
            sortable: false,
        },
        {
            name: getFormattedMessage("topup-request.amount.label"),
            selector: (row) => row.amount,
            sortField: "amount",
            sortable: true,
            cell: (row) => (
                <span className="text-primary fw-bold">
                    {formatCurrency(row.amount)}
                </span>
            ),
        },
        {
            name: getFormattedMessage("topup-request.current-balance.label"),
            selector: (row) => row.current_balance,
            sortField: "current_balance",
            sortable: true,
            cell: (row) => (
                <span className="text-muted">
                    {formatCurrency(row.current_balance)}
                </span>
            ),
        },
        {
            name: getFormattedMessage("topup-request.balance-after.label"),
            selector: (row) => row.balance_after_topup,
            sortField: "balance_after_topup",
            sortable: true,
            cell: (row) => (
                <span className="text-success fw-bold">
                    {formatCurrency(row.balance_after_topup)}
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
            name: getFormattedMessage("react-data-table.column.created-date.label"),
            selector: (row) => row.created_at,
            sortField: "created_at",
            sortable: true,
            cell: (row) => (
                <span className="badge bg-light-info">
                    {row.created_at
                        ? new Date(row.created_at).toLocaleDateString("id-ID")
                        : "-"}
                </span>
            ),
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
                        <>
                            <Button
                                variant="outline-success"
                                size="sm"
                                className="me-2"
                                title={getFormattedMessage("digital-topup.approve")}
                                onClick={() => onApprovalModal(row, "approve")}
                            >
                                <i className="bi bi-check-circle" />
                            </Button>
                            <Button
                                variant="outline-danger"
                                size="sm"
                                title={getFormattedMessage("digital-topup.reject")}
                                onClick={() => onApprovalModal(row, "reject")}
                            >
                                <i className="bi bi-x-circle" />
                            </Button>
                        </>
                    )}
                </div>
            ),
        },
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={getFormattedMessage("digital.topup.title")} />

            <div className="row mb-4">
                <div className="col-md-3">
                    <div className="card border-warning">
                        <div className="card-body text-center">
                            <i className="bi bi-clock fs-1 text-warning mb-2" />
                            <h4 className="mb-0">{pendingTopupRequests.length}</h4>
                            <small className="text-muted">
                                {getFormattedMessage("topup-requests.pending-requests")}
                            </small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-success">
                        <div className="card-body text-center">
                            <i className="bi bi-check-circle fs-1 text-success mb-2" />
                            <h4 className="mb-0">
                                {
                                    requestList.filter(
                                        (r) => r.attributes.status === "completed"
                                    ).length
                                }
                            </h4>
                            <small className="text-muted">
                                {getFormattedMessage("topup-requests.completed-requests")}
                            </small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-info">
                        <div className="card-body text-center">
                            <i className="bi bi-cash fs-1 text-info mb-2" />
                            <h4 className="mb-0">
                                {formatCurrency(
                                    requestList
                                        .filter((r) => r.attributes.status === "completed")
                                        .reduce(
                                            (total, request) =>
                                                total +
                                                parseFloat(request.attributes.amount || 0),
                                            0
                                        )
                                )}
                            </h4>
                            <small className="text-muted">
                                {getFormattedMessage("topup-requests.total-topup-amount")}
                            </small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-primary">
                        <div className="card-body text-center">
                            <i className="bi bi-building fs-1 text-primary mb-2" />
                            <h4 className="mb-0">
                                {new Set(requestList.map((r) => r.attributes.store_id)).size}
                            </h4>
                            <small className="text-muted">
                                {getFormattedMessage("topup-requests.stores-involved")}
                            </small>
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
                                onChange={(filter) => fetchDigitalTopupRequests(filter, true)}
                                isLoading={isLoading}
                                totalRows={totalRecord}
                                isCallFetchDataApi={isCallFetchDataApi}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={approvalModal} onHide={() => setApprovalModal(false)}>
            <Modal.Header closeButton>
                    <Modal.Title>
                        {approvalAction === "approve" ? "Setujui Permintaan" : "Tolak Permintaan"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedRequest && (
                        <div>
                            <p>
                                <strong>{getFormattedMessage("topup-request.request-code.label")}:</strong>{" "}
                                {selectedRequest.request_code}
                            </p>
                            <p>
                                <strong>{getFormattedMessage("store.title")}:</strong>{" "}
                                {selectedRequest.store_name}
                            </p>
                            <p>
                                <strong>{getFormattedMessage("digital-provider.title")}:</strong>{" "}
                                {selectedRequest.provider_name}
                            </p>
                            <p>
                                <strong>{getFormattedMessage("topup-request.amount.label")}:</strong>{" "}
                                {formatCurrency(selectedRequest.amount)}
                            </p>
                            <p>
                                <strong>{getFormattedMessage("topup-request.reason.label")}:</strong>{" "}
                                {selectedRequest.reason || "-"}
                            </p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setApprovalModal(false)}>
                        {getFormattedMessage("globally.cancel.btn")}
                    </Button>
                    <Button
                        variant={approvalAction === "approve" ? "success" : "danger"}
                        onClick={() => handleApproval(approvalAction)}
                    >
                        {approvalAction === "approve" ? "Setujui" : "Tolak"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const {
        digitalTopupRequests: digitalTopupRequestsState = {},
        allConfigData,
        frontSetting,
        isCallFetchDataApi,
    } = state;

    return {
        topupRequests: digitalTopupRequestsState.digitalTopupRequests || [],
        totalRecord: digitalTopupRequestsState.totalRecord || 0,
        isLoading: digitalTopupRequestsState.isLoading || false,
        allConfigData,
        frontSetting,
        isCallFetchDataApi,
    };
};

export default connect(mapStateToProps, {
    fetchDigitalTopupRequests,
    approveDigitalTopupRequest,
    rejectDigitalTopupRequest,
})(TopupRequests);
