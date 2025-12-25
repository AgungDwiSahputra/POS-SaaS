import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import moment from "moment";
import { Button } from "react-bootstrap-v5";
import MasterLayout from "../MasterLayout";
import { fetchBalanceRequests } from "../../store/action/balanceRequestAction";
import ReactDataTable from "../../shared/table/ReactDataTable";
import TabTitle from "../../shared/tab-title/TabTitle";
import {
    getFormattedDate,
    getFormattedMessage,
    placeholderText,
    currencySymbolHandling,
    getPermission,
    getCurrentUser,
} from "../../shared/sharedMethod";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import ApproveRejectModal from "./ApproveRejectModal";
import CreateBalanceRequestModal from "./CreateBalanceRequestModal";
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

    const [isOpen, setIsOpen] = useState(false);
    const [lightBoxImage, setLightBoxImage] = useState([]);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const onChange = (filter) => {
        fetchBalanceRequests(filter, true);
    };

    const handleApprove = (request) => {
        setSelectedRequest(request);
        setShowApproveModal(true);
    };

    const handleReject = (request) => {
        setSelectedRequest(request);
        setShowRejectModal(true);
    };

    const handleCloseModal = () => {
        setShowApproveModal(false);
        setShowRejectModal(false);
        setShowCreateModal(false);
        setSelectedRequest(null);
    };

    const handleCreateModal = () => {
        setShowCreateModal(true);
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

    const itemsValue =
        currencySymbol &&
        balanceRequests.length >= 0 &&
        balanceRequests.map((balanceRequest) => {
            // Handle JSON:API format - data comes with attributes wrapper
            const attributes = balanceRequest.attributes || balanceRequest;

            // Extract provider name from nested provider data
            const providerName = attributes.provider
                ? (attributes.provider.attributes?.nama_provider || attributes.provider.nama_provider || "")
                : "";

            // Extract status
            const status = attributes.status || balanceRequest.status || "";

            return {
                provider_name: providerName,
                amount: formattedPrice(attributes.amount || balanceRequest.amount),
                notes: attributes.notes || "",
                status: status,
                date: getFormattedDate(
                    attributes.created_at || balanceRequest.created_at,
                    allConfigData && allConfigData
                ),
                time: moment(attributes.created_at || balanceRequest.created_at).format("LT"),
                id: attributes.id || balanceRequest.id,
                currency: currencySymbol,
            };
        });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <span className="badge bg-light-warning">{getFormattedMessage("balance-request.status.pending")}</span>;
            case 'approved':
                return <span className="badge bg-light-success">{getFormattedMessage("balance-request.status.approved")}</span>;
            case 'rejected':
                return <span className="badge bg-light-danger">{getFormattedMessage("balance-request.status.rejected")}</span>;
            default:
                return <span className="badge bg-light-secondary">{status}</span>;
        }
    };

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
            selector: (row) => row.amount,
            sortField: "amount",
            sortable: true,
        },
        {
            name: getFormattedMessage("balance-request.input.notes.label"),
            selector: (row) => row.notes,
            sortField: "notes",
            sortable: true,
        },
        {
            name: getFormattedMessage("globally.detail.status"),
            selector: (row) => getStatusBadge(row.status),
            sortField: "status",
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
            width: "200px",
            cell: (row) => {
                const currentUser = getCurrentUser();
                const isAdmin = currentUser && currentUser.role_name === 'admin';
                const isPending = row.status === 'pending';

                return (
                    <div className="d-flex gap-1">
                        {isAdmin && isPending && (
                            <>
                                <Button
                                    size="sm"
                                    variant="success"
                                    onClick={() => handleApprove(row)}
                                    title={getFormattedMessage("globally.approve.label")}
                                >
                                    ✓
                                </Button>
                                <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() => handleReject(row)}
                                    title={getFormattedMessage("globally.reject.label")}
                                >
                                    ✗
                                </Button>
                            </>
                        )}
                    </div>
                );
            },
        },
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("balance-request.title")} />
            <ReactDataTable
                columns={columns}
                items={itemsValue}
                onChange={onChange}
                isLoading={isLoading}
                totalRows={totalRecord}
                {...(getPermission(allConfigData?.permissions, Permissions.CREATE_BALANCE_REQUESTS) &&
                {
                    AddButton: (
                        <div className="text-end mb-2">
                            <Button
                                variant="primary"
                                className="table-button btn-light-primary"
                                onClick={handleCreateModal}
                            >
                                {getFormattedMessage("balance-request.create.title")}
                            </Button>
                        </div>
                    )
                }
                )}
            />
            <ApproveRejectModal
                show={showApproveModal}
                onHide={handleCloseModal}
                balanceRequest={selectedRequest}
                isApprove={true}
            />
            <ApproveRejectModal
                show={showRejectModal}
                onHide={handleCloseModal}
                balanceRequest={selectedRequest}
                isApprove={false}
            />
            <CreateBalanceRequestModal
                show={showCreateModal}
                onHide={handleCloseModal}
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