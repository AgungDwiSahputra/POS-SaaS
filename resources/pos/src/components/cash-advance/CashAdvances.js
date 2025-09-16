import React, { useState } from "react";
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
    placeholderText,
} from "../../shared/sharedMethod";
import ActionButton from "../../shared/action-buttons/ActionButton";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import { Permissions } from "../../constants";

const CashAdvances = (props) => {
    const {
        fetchCashAdvances,
        cashAdvances,
        totalRecord,
        isLoading,
        frontSetting,
        allConfigData,
        isCallFetchDataApi,
    } = props;
    const [deleteModel, setDeleteModel] = useState(false);
    const [isDelete, setIsDelete] = useState(null);
    const navigate = useNavigate();

    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete(isDelete);
    };

    const onChange = (filter) => {
        fetchCashAdvances(filter, true);
    };

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
            recorded_by_name: cashAdvance.attributes.recorded_by_name,
            amount: cashAdvance.attributes.amount,
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
        ...((getPermission(
            allConfigData?.permissions,
            Permissions.EDIT_CASH_ADVANCES
        ) ||
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
            />
            <DeleteCashAdvance
                onClickDeleteModel={onClickDeleteModel}
                deleteModel={deleteModel}
                onDelete={isDelete}
            />
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
    } = state;
    return {
        cashAdvances,
        totalRecord,
        isLoading,
        frontSetting,
        allConfigData,
        isCallFetchDataApi,
    };
};

export default connect(mapStateToProps, { fetchCashAdvances })(CashAdvances);
