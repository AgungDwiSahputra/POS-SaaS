import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { Button } from "react-bootstrap-v5";
import MasterLayout from "../MasterLayout";
import { fetchBalanceRequests, fetchBalanceRequestPendingCount } from "../../store/action/balanceRequestAction";
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
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import { Permissions, ROLES } from "../../constants";
import { useSelector } from "react-redux";

const BalanceRequestList = (props) => {
    const {
        fetchBalanceRequests,
        balanceRequests,
        totalRecord,
        isLoading,
        frontSetting,
        allConfigData,
    } = props;

    const navigate = useNavigate();
    const { loginUser } = useSelector((state) => state);

    // Handle new state structure
    const requestsList = balanceRequests?.balanceRequests || balanceRequests || [];

    const [deleteModel, setDeleteModel] = useState(false);
    const [isDelete, setIsDelete] = useState(null);

    // Check if user is Admin (check roles from Spatie Permission)
    const isAdmin = loginUser?.roles?.name === ROLES.ADMIN || loginUser?.roles === ROLES.ADMIN;

    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete(isDelete);
    };

    const goToProcess = (id) => {
        navigate(`/user/balance-requests/process/${id}`);
    };

    const onChange = (filter) => {
        fetchBalanceRequests(filter, true);
    };

    useEffect(() => {
        fetchBalanceRequests();
        fetchBalanceRequestPendingCount();
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
        requestsList.length >= 0 &&
        requestsList.map((request) => {
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
            width: "150px",
            cell: (row) => (
                <div className="d-flex justify-content-end gap-1">
                    {row.raw_status === "pending" ? (
                        <>
                            {isAdmin && (
                                <Button
                                    variant="success btn-sm"
                                    title={getFormattedMessage("balance-request.action.approve")}
                                    onClick={() => goToProcess(row.id)}
                                >
                                    <i className="fas fa-check"></i>
                                </Button>
                            )}
                            {getPermission(allConfigData?.permissions, Permissions.DELETE_BALANCE_REQUESTS) && (
                                <Button
                                    variant="danger btn-sm"
                                    title={getFormattedMessage("react-data-table.action.delete")}
                                    onClick={() => onClickDeleteModel(row)}
                                >
                                    <i className="fas fa-trash"></i>
                                </Button>
                            )}
                        </>
                    ) : (
                        <Button
                            variant="info btn-sm"
                            title={getFormattedMessage("react-data-table.action.view")}
                            onClick={() => goToProcess(row.id)}
                        >
                            <i className="fas fa-eye"></i>
                        </Button>
                    )}
                </div>
            ),
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
