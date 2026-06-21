import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap-v5";
import MasterLayout from "../MasterLayout";
import { fetchBalanceRequest, updateBalanceRequestStatus } from "../../store/action/balanceRequestAction";
import {
    getFormattedMessage,
    getFormattedText,
    currencySymbolHandling
} from "../../shared/sharedMethod";
import HeaderTitle from "../header/HeaderTitle";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import { ROLES } from "../../constants";
import { useSelector } from "react-redux";

const ProcessBalanceRequest = (props) => {
    const {
        fetchBalanceRequest,
        updateBalanceRequestStatus,
        frontSetting,
        allConfigData,
        singleBalanceRequest,
    } = props;

    const { id } = useParams();
    const navigate = useNavigate();
    const { loginUser } = useSelector((state) => state);

    const [showModal, setShowModal] = useState(false);
    const [action, setAction] = useState(""); // 'approve' or 'reject'

    // Check if user is Admin (check roles from Spatie Permission)
    const isAdmin = loginUser?.roles?.name === ROLES.ADMIN || loginUser?.roles === ROLES.ADMIN;

    useEffect(() => {
        if (id) {
            fetchBalanceRequest(id);
        }
    }, [id]);

    const currencySymbol = frontSetting?.value?.currency_symbol || '$';

    // Extract status from the correct location (handles both JSON:API and flat formats)
    const requestStatus = singleBalanceRequest?.attributes?.status || singleBalanceRequest?.status;

    const handleAction = (actionType) => {
        if (requestStatus !== 'pending') {
            return;
        }
        setAction(actionType);
        setShowModal(true);
    };

    const confirmAction = () => {
        const formData = new FormData();
        formData.append("status", action === "approve" ? "approved" : "rejected");

        updateBalanceRequestStatus(id, formData, navigate);
        setShowModal(false);
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { bg: "warning", text: "Pending" },
            approved: { bg: "success", text: "Approved" },
            rejected: { bg: "danger", text: "Rejected" },
        };
        const config = statusConfig[status] || statusConfig.pending;
        return (
            <span className={`badge bg-light-${config.bg} fs-6`}>
                {config.text}
            </span>
        );
    };

    if (!singleBalanceRequest) {
        return (
            <MasterLayout>
                <TopProgressBar />
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </MasterLayout>
        );
    }

    const attributes = singleBalanceRequest.attributes || singleBalanceRequest;
    const provider = attributes.provider || singleBalanceRequest.provider;
    const requestedBy = attributes.requested_by || singleBalanceRequest.requested_by;
    const processedBy = attributes.processed_by || singleBalanceRequest.processed_by;

    return (
        <MasterLayout>
            <TopProgressBar />
            <HeaderTitle
                title={getFormattedMessage("balance-request.process.title")}
                to="/user/balance-requests"
            />
            <div className="card">
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6">
                            <h5 className="mb-4">{getFormattedMessage("balance-request.detail.info")}</h5>
                            <table className="table table-bordered">
                                <tbody>
                                    <tr>
                                        <th>{getFormattedMessage("balance-request.input.provider.label")}</th>
                                        <td>{provider?.nama_provider || "-"}</td>
                                    </tr>
                                    <tr>
                                        <th>{getFormattedMessage("balance-request.input.amount.label")}</th>
                                        <td>{currencySymbolHandling(allConfigData, currencySymbol, attributes.requested_amount)}</td>
                                    </tr>
                                    <tr>
                                        <th>{getFormattedMessage("balance-request.input.status.label")}</th>
                                        <td>{getStatusBadge(attributes.status)}</td>
                                    </tr>
                                    <tr>
                                        <th>{getFormattedMessage("balance-request.input.requested-by.label")}</th>
                                        <td>{requestedBy?.name || requestedBy?.first_name || "-"}</td>
                                    </tr>
                                    <tr>
                                        <th>{getFormattedMessage("balance-request.input.created-at.label")}</th>
                                        <td>{attributes.created_at ? new Date(attributes.created_at).toLocaleString() : "-"}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="col-md-6">
                            <h5 className="mb-4">{getFormattedMessage("balance-request.detail.additional-info")}</h5>
                            <table className="table table-bordered">
                                <tbody>
                                    <tr>
                                        <th>{getFormattedMessage("balance-request.input.notes.label")}</th>
                                        <td>{attributes.notes || "-"}</td>
                                    </tr>
                                    {attributes.processed_by && (
                                        <tr>
                                            <th>{getFormattedMessage("balance-request.input.processed-by.label")}</th>
                                            <td>{processedBy?.name || processedBy?.first_name || "-"}</td>
                                        </tr>
                                    )}
                                    {attributes.processed_at && (
                                        <tr>
                                            <th>{getFormattedMessage("balance-request.input.processed-at.label")}</th>
                                            <td>{new Date(attributes.processed_at).toLocaleString()}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {attributes.status === "pending" && isAdmin && (
                                <div className="mt-4">
                                    <h5>{getFormattedMessage("balance-request.process.actions")}</h5>
                                    <div className="d-flex gap-2">
                                        <Button
                                            variant="success"
                                            onClick={() => handleAction("approve")}
                                        >
                                            {getFormattedMessage("balance-request.action.approve")}
                                        </Button>
                                        <Button
                                            variant="danger"
                                            onClick={() => handleAction("reject")}
                                        >
                                            {getFormattedMessage("balance-request.action.reject")}
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {attributes.status === "pending" && !isAdmin && (
                                <div className="mt-4">
                                    <div className="alert alert-info">
                                        {getFormattedMessage("balance-request.process.waiting-admin")}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {action === "approve"
                            ? getFormattedMessage("balance-request.modal.approve.title")
                            : getFormattedMessage("balance-request.modal.reject.title")}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        {action === "approve"
                            ? getFormattedMessage("balance-request.modal.approve.message")
                            : getFormattedMessage("balance-request.modal.reject.message")}
                    </p>
                    <p className="fw-bold">
                        {getFormattedMessage("balance-request.input.provider.label")}: {provider?.nama_provider}
                    </p>
                    <p className="fw-bold">
                        {getFormattedMessage("balance-request.input.amount.label")}: {currencySymbolHandling(allConfigData, currencySymbol, attributes.requested_amount)}
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        {getFormattedMessage("delete-modal.no-btn")}
                    </Button>
                    <Button
                        variant={action === "approve" ? "success" : "danger"}
                        onClick={confirmAction}
                    >
                        {action === "approve"
                            ? getFormattedMessage("balance-request.action.approve")
                            : getFormattedMessage("balance-request.action.reject")}
                    </Button>
                </Modal.Footer>
            </Modal>
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const {
        frontSetting,
        allConfigData,
        balanceRequests: { singleBalanceRequest },
    } = state;
    return {
        frontSetting,
        allConfigData,
        singleBalanceRequest,
    };
};

export default connect(mapStateToProps, {
    fetchBalanceRequest,
    updateBalanceRequestStatus,
})(ProcessBalanceRequest);
