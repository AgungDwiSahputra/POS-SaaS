import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import moment from "moment";
import { Button, Image } from "react-bootstrap-v5";
import MasterLayout from "../MasterLayout";
import { fetchProviders } from "../../store/action/providerAction";
import ReactSelect from "../../shared/select/reactSelect";
import ReactDataTable from "../../shared/table/ReactDataTable";
import DeleteProvider from "./DeleteProvider";
import TabTitle from "../../shared/tab-title/TabTitle";
import user from "../../assets/images/brand_logo.png";
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

const ProviderList = (props) => {
    const {
        fetchProviders,
        providers,
        totalRecord,
        isLoading,
        frontSetting,
        allConfigData,
    } = props;

    const [deleteModel, setDeleteModel] = useState(false);
    const [isDelete, setIsDelete] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [lightBoxImage, setLightBoxImage] = useState([]);

    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete(isDelete);
    };

    const onChange = (filter) => {
        fetchProviders(filter, true);
    };

    useEffect(() => {
        fetchProviders();
    }, []);

    const goToEditProduct = (item) => {
        const id = item.id;
        window.location.href = "#/user/providers/edit/" + id;
    };

    const goToProductDetailPage = (ProductId) => {
        window.location.href = "#/user/providers/detail/" + ProductId;
    };

    const currencySymbol =
        frontSetting &&
        frontSetting.value &&
        frontSetting.value.currency_symbol;

    const formattedPrice = (saldo) => {
        return currencySymbolHandling(
            allConfigData,
            currencySymbol,
            saldo
        );
    };

    const itemsValue =
          currencySymbol &&
          providers.length >= 0 &&
          providers.map((provider) => {
              // Handle JSON:API format (check if attributes exist)
              const attributes = provider.attributes || provider;

              return {
                  nama_provider: attributes.nama_provider || "",
                  saldo: formattedPrice(attributes.saldo || provider.saldo),
                  deskripsi: attributes.deskripsi || "",
                  status: attributes.status || "",
                  date: getFormattedDate(
                      attributes.created_at || provider.created_at,
                      allConfigData && allConfigData
                  ),
                  time: moment(attributes.created_at || provider.created_at).format("LT"),
                  id: attributes.id || provider.id,
                  currency: currencySymbol,
              };
          });

    const columns = [
        {
            name: getFormattedMessage("provider.input.nama_provider.label"),
            selector: (row) => row.nama_provider,
            className: "provider-name",
            sortField: "nama_provider",
            sortable: true,
        },
        {
            name: getFormattedMessage("provider.input.saldo.label"),
            selector: (row) => row.saldo,
            sortField: "saldo",
            sortable: true,
        },
        {
            name: getFormattedMessage("provider.input.deskripsi.label"),
            selector: (row) => row.deskripsi,
            sortField: "deskripsi",
            sortable: true,
        },
        {
            name: getFormattedMessage("provider.input.status.label"),
            selector: (row) => (
                <span className={`badge bg-light-${row.status === 'active' ? 'success' : 'danger'}`}>
                    {row.status}
                </span>
            ),
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
            width: "120px",
            cell: (row) => (
                <ActionButton
                    isViewIcon={true}
                    goToDetailScreen={goToProductDetailPage}
                    item={row}
                    goToEditProduct={goToEditProduct}
                    isEditMode={getPermission(allConfigData?.permissions, Permissions.EDIT_PROVIDERS)}
                    onClickDeleteModel={onClickDeleteModel}
                    isDeleteMode={getPermission(allConfigData?.permissions, Permissions.DELETE_PROVIDERS)}
                />
            ),
        },
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("provider.title")} />
            <ReactDataTable
                columns={columns}
                items={itemsValue}
                onChange={onChange}
                isLoading={isLoading}
                totalRows={totalRecord}
                {...(getPermission(allConfigData?.permissions, Permissions.CREATE_PROVIDERS) &&
                {
                    to: "#/user/providers/create",
                    buttonValue: getFormattedMessage("provider.create.title")
                }
                )}
            />
            <DeleteProvider
                onClickDeleteModel={onClickDeleteModel}
                deleteModel={deleteModel}
                onDelete={isDelete}
            />
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const {
        providers,
        totalRecord,
        isLoading,
        frontSetting,
        allConfigData,
    } = state;
    return {
        providers,
        totalRecord,
        isLoading,
        frontSetting,
        allConfigData,
    };
};

export default connect(mapStateToProps, {
    fetchProviders,
})(ProviderList);