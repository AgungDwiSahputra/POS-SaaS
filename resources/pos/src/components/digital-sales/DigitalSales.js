import React, { useEffect, useState } from "react";
import moment from "moment";
import { connect } from "react-redux";
import MasterLayout from "../MasterLayout";
import TabTitle from "../../shared/tab-title/TabTitle";
import ReactDataTable from "../../shared/table/ReactDataTable";
import { fetchDigitalSales, deleteDigitalSale } from "../../store/action/digitalSaleAction";
import DeleteDigitalSale from "./DeleteDigitalSale";
import {
    currencySymbolHandling,
    getFormattedDate,
    getFormattedMessage,
    getPermission,
    placeholderText,
} from "../../shared/sharedMethod";
import ActionDropDownButton from "../../shared/action-buttons/ActionDropDownButton";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import { fetchSetting } from "../../store/action/settingAction";
import { fetchProviders } from "../../store/action/providerAction";
import { fetchUsersList } from "../../store/action/userAction";
import ProviderCard from "../provider/ProviderCard";
import { Permissions } from "../../constants";

const DigitalSales = (props) => {
    const {
        digitalSales,
        fetchDigitalSales,
        totalRecord,
        isLoading,
        frontSetting,
        allConfigData,
        isCallFetchDataApi,
        fetchSetting,
        providers,
        fetchProviders,
        users,
        fetchUsersList
    } = props;

    const [deleteModel, setDeleteModel] = useState(false);
    const [isDelete, setIsDelete] = useState(null);
    const [tableArray, setTableArray] = useState([]);
    const [typeFilter, setTypeFilter] = useState(null);
    const [providerFilter, setProviderFilter] = useState(null);
    const [userFilter, setUserFilter] = useState(null);

    useEffect(() => {
        fetchSetting();
        fetchProviders();
        fetchUsersList();
    }, []);

    const currencySymbol =
        frontSetting &&
        frontSetting.value &&
        frontSetting.value.currency_symbol;

    const onChange = (filter) => {
        fetchDigitalSales(filter, true);
    };

    const onTypeChange = (obj) => {
        setTypeFilter(obj);
    };

    const onProviderChange = (obj) => {
        setProviderFilter(obj);
    };

    const onUserChange = (obj) => {
        setUserFilter(obj);
    };

    const typeOptions = [
        { value: 'tarik_tunai', label: getFormattedMessage('digital-sale.type.tarik-tunai.label') },
        { value: 'setor_tunai', label: getFormattedMessage('digital-sale.type.setor-tunai.label') },
    ];

    const providerOptions = providers && providers.length > 0
        ? providers.map(provider => ({
            value: provider.id,
            label: provider.attributes.nama_provider,
        }))
        : [];

    const userOptions = users && users.length > 0
        ? users.map(user => ({
            value: user.id,
            label: `${user.attributes.first_name} ${user.attributes.last_name}`,
        }))
        : [];

    const goToEdit = (item) => {
        const id = item.id;
        window.location.href = "#/user/digital-sales/edit/" + id;
    };

    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete(isDelete);
    };

    const goToDetailScreen = (id) => {
        window.location.href = "#/user/digital-sales/detail/" + id;
    };

    const itemsValue =
        currencySymbol &&
        digitalSales.length >= 0 &&
        [...digitalSales]
            .sort((a, b) => new Date(b.attributes.created_at) - new Date(a.attributes.created_at))
            .map((sale) => ({
                date: getFormattedDate(
                    sale.attributes.created_at,
                    allConfigData && allConfigData
                ),
                time: moment(sale.attributes.created_at).format("LT"),
                reference_code: sale.attributes.reference_code,
                provider_name: sale.attributes.provider_name,
                type: sale.attributes.type,
                type_label: sale.attributes.type_label,
                cost: sale.attributes.cost,
                price: sale.attributes.price,
                margin: sale.attributes.margin,
                status: sale.attributes.status,
                status_label: sale.attributes.status_label,
                user_name: sale.attributes.user_name,
                id: sale.id,
                currency: currencySymbol,
            }));

    useEffect(() => {
        const costSum = () => {
            let x = 0;
            itemsValue.length &&
                itemsValue.map((item) => {
                    x = x + Number(item.cost);
                    return x;
                });
            return x;
        };

        const priceSum = () => {
            let x = 0;
            itemsValue.length &&
                itemsValue.map((item) => {
                    x = x + Number(item.price);
                    return x;
                });
            return x;
        };

        const marginSum = () => {
            let x = 0;
            itemsValue.length &&
                itemsValue.map((item) => {
                    x = x + Number(item.margin);
                    return x;
                });
            return x;
        };

        if (digitalSales.length) {
            const newObject = itemsValue.length && {
                date: "",
                time: "",
                reference_code: "Total",
                provider_name: "",
                type: "",
                type_label: "",
                cost: costSum(),
                price: priceSum(),
                margin: marginSum(),
                status: "",
                user_name: "",
                id: "totalRows",
                currency: currencySymbol,
            };
            const newItemValue =
                itemsValue.length && newObject && itemsValue.concat(newObject);
            const latestArray = newItemValue.map((item) => item);
            newItemValue.length && setTableArray(latestArray);
        } else {
            setTableArray([]);
        }
    }, [digitalSales]);

    const columns = [
        {
            name: getFormattedMessage("globally.detail.reference"),
            sortField: "reference_code",
            sortable: false,
            cell: (row) => {
                return row.reference_code === "Total" ? (
                    <span className="fw-bold fs-4">
                        {getFormattedMessage("pos-total.title")}
                    </span>
                ) : (
                    <span className="badge bg-light-danger">
                        <span>{row.reference_code}</span>
                    </span>
                );
            },
        },
        {
            name: getFormattedMessage("digital-sale.provider.label"),
            selector: (row) => row.provider_name,
            sortField: "provider_name",
            sortable: false,
        },
        {
            name: getFormattedMessage("digital-sale.user.label"),
            selector: (row) => row.user_name,
            sortField: "user_name",
            sortable: false,
        },
        {
            name: getFormattedMessage("digital-sale.type.filter.label"),
            selector: (row) => row.type_label,
            sortField: "type",
            sortable: false,
            cell: (row) => {
                if (row.reference_code === "Total") {
                    return null;
                }
                const typeClass = row.type === 'tarik_tunai' ? 'bg-light-warning' : 'bg-light-info';
                return (
                    <span className={`badge ${typeClass}`}>
                        <span>{row.type_label}</span>
                    </span>
                );
            },
        },
        {
            name: getFormattedMessage("digital-sale.cost.label"),
            sortField: "cost",
            cell: (row) => {
                return row.reference_code === "Total" ? (
                    <span className="fw-bold fs-4">
                        {currencySymbolHandling(
                            allConfigData,
                            row.currency,
                            row.cost
                        )}
                    </span>
                ) : (
                    <span>
                        {currencySymbolHandling(
                            allConfigData,
                            row.currency,
                            row.cost
                        )}
                    </span>
                );
            },
            sortable: true,
        },
        {
            name: getFormattedMessage("digital-sale.price.label"),
            sortField: "price",
            cell: (row) => {
                return row.reference_code === "Total" ? (
                    <span className="fw-bold fs-4">
                        {currencySymbolHandling(
                            allConfigData,
                            row.currency,
                            row.price
                        )}
                    </span>
                ) : (
                    <span>
                        {currencySymbolHandling(
                            allConfigData,
                            row.currency,
                            row.price
                        )}
                    </span>
                );
            },
            sortable: true,
        },
        {
            name: getFormattedMessage("digital-sale.margin.label"),
            sortField: "margin",
            cell: (row) => {
                const marginClass = row.margin >= 0 ? "text-success" : "text-danger";
                return row.reference_code === "Total" ? (
                    <span className={`fw-bold fs-4 ${marginClass}`}>
                        {currencySymbolHandling(
                            allConfigData,
                            row.currency,
                            row.margin
                        )}
                    </span>
                ) : (
                    <span className={marginClass}>
                        {currencySymbolHandling(
                            allConfigData,
                            row.currency,
                            row.margin
                        )}
                    </span>
                );
            },
            sortable: true,
        },
        {
            name: getFormattedMessage("globally.detail.status"),
            sortField: "status",
            sortable: false,
            cell: (row) => {
                return (
                    (row.status === 1 && (
                        <span className="badge bg-light-success">
                            <span>{getFormattedMessage("status.filter.complated.label")}</span>
                        </span>
                    )) ||
                    (row.status === 2 && (
                        <span className="badge bg-light-primary">
                            <span>{getFormattedMessage("status.filter.pending.label")}</span>
                        </span>
                    )) ||
                    (row.status === 3 && (
                        <span className="badge bg-light-danger">
                            <span>{getFormattedMessage("status.filter.cancelled.label")}</span>
                        </span>
                    ))
                );
            },
        },
        {
            name: getFormattedMessage(
                "globally.react-table.column.created-date.label"
            ),
            selector: (row) => row.date,
            sortField: "date",
            sortable: true,
            cell: (row) => {
                return (
                    row.date && (
                        <span className="badge bg-light-info">
                            <div className="mb-1">{row.time}</div>
                            <div>{row.date}</div>
                        </span>
                    )
                );
            },
        },
        {
            name: getFormattedMessage("react-data-table.action.column.label"),
            right: true,
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            cell: (row) =>
                row.reference_code === "Total" ? null : (
                    <ActionDropDownButton
                        item={row}
                        goToEditProduct={getPermission(allConfigData?.permissions, Permissions.EDIT_DIGITAL_SALES) && goToEdit}
                        isEditMode={true}
                        onClickDeleteModel={onClickDeleteModel}
                        title={getFormattedMessage("digital-sales.title")}
                        isViewIcon={getPermission(allConfigData?.permissions, Permissions.VIEW_DIGITAL_SALES)}
                        goToDetailScreen={goToDetailScreen}
                        isDeleteMode={getPermission(allConfigData?.permissions, Permissions.DELETE_DIGITAL_SALES)}
                    />
                ),
        },
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("digital-sales.title")} />
            <ProviderCard
                providers={providers}
                frontSetting={frontSetting}
                allConfigData={allConfigData}
            />
            <div className="digital_sale_table">
                <ReactDataTable
                    columns={columns}
                    items={tableArray}
                    {...(getPermission(allConfigData?.permissions, Permissions.CREATE_DIGITAL_SALES) && {
                        to: "#/user/digital-sales/create",
                        buttonValue: getFormattedMessage("digital-sales.create.title")
                    })}
                    isShowDateRangeField
                    onChange={onChange}
                    totalRows={totalRecord}
                    goToEdit={goToEdit}
                    isLoading={isLoading}
                    isShowFilterField
                    isStatus
                    isCallFetchDataApi={isCallFetchDataApi}
                    isTypeFilter={true}
                    typeOptions={typeOptions}
                    typeValue={typeFilter}
                    onTypeChange={onTypeChange}
                    typeLabel={getFormattedMessage("digital-sale.type.filter.label")}
                    isProviderFilter={true}
                    providerOptions={providerOptions}
                    providerValue={providerFilter}
                    onProviderChange={onProviderChange}
                    providerLabel={getFormattedMessage("digital-sale.provider.label")}
                    isUserFilter={true}
                    userOptions={userOptions}
                    userValue={userFilter}
                    onUserChange={onUserChange}
                    userLabel={getFormattedMessage("digital-sale.user.label")}
                    extraFilters={{
                        type: typeFilter ? typeFilter.value : null,
                        provider_id: providerFilter ? providerFilter.value : null,
                        user_id: userFilter ? userFilter.value : null,
                    }}
                />
            </div>
            <DeleteDigitalSale
                onClickDeleteModel={onClickDeleteModel}
                deleteModel={deleteModel}
                onDelete={isDelete}
            />
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const {
        digitalSales,
        totalRecord,
        isLoading,
        frontSetting,
        allConfigData,
        isCallFetchDataApi,
        providers,
        users
    } = state;
    return {
        digitalSales,
        totalRecord,
        isLoading,
        frontSetting,
        allConfigData,
        isCallFetchDataApi,
        providers,
        users
    };
};

export default connect(mapStateToProps, {
    fetchDigitalSales,
    deleteDigitalSale,
    fetchSetting,
    fetchProviders,
    fetchUsersList
})(DigitalSales);
