import React, { useEffect, useMemo } from "react";
import { connect } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import MasterLayout from "../../MasterLayout";
import TabTitle from "../../../shared/tab-title/TabTitle";
import { placeholderText } from "../../../shared/sharedMethod";
import DigitalSaleForm from "./DigitalSaleForm";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import {
    editDigitalSale,
    fetchDigitalSale,
} from "../../../store/action/digitalSaleAction";
import { fetchStore } from "../../../store/action/storeAction";
import { fetchActiveDigitalProviders } from "../../../store/action/digitalProviderAction";
import { fetchDigitalProducts } from "../../../store/action/digitalProductAction";
import { fetchStoreDigitalProviders } from "../../../store/action/storeDigitalProviderAction";

const EditDigitalSale = ({
    digitalSale,
    isSaving,
    isLoading,
    editDigitalSale,
    fetchDigitalSale,
    fetchStore,
    fetchActiveDigitalProviders,
    fetchDigitalProducts,
    fetchStoreDigitalProviders,
    stores,
    digitalProviders,
    digitalProducts,
    storeDigitalProviders,
    frontSetting,
    allConfigData,
}) => {
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        if (id) {
            fetchDigitalSale(id);
        }
    }, [id, fetchDigitalSale]);

    useEffect(() => {
        fetchStore(false);
        fetchActiveDigitalProviders();
        fetchDigitalProducts({}, false);
        fetchStoreDigitalProviders({}, false);
    }, [
        fetchStore,
        fetchActiveDigitalProviders,
        fetchDigitalProducts,
        fetchStoreDigitalProviders,
    ]);

    const editDigitalSaleData = (formValue) => {
        editDigitalSale(id, formValue, navigate);
    };

    const formattedDigitalSale = useMemo(() => {
        if (!digitalSale) {
            return null;
        }

        const data = digitalSale.attributes ?? digitalSale;

        return {
            id: digitalSale.id ?? data.id ?? id,
            reference_code: data.reference_code,
            store_id: data.store_id,
            digital_provider_id: data.digital_provider_id,
            digital_product_id: data.digital_product_id,
            customer_name: data.customer_name,
            customer_phone: data.customer_phone,
            cost_price: data.cost_price,
            sell_price: data.sell_price,
            margin: data.margin,
            notes: data.notes,
        };
    }, [digitalSale, id]);

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle
                title={placeholderText("digital-sale.edit.title")}
            />
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <DigitalSaleForm
                                onSubmit={editDigitalSaleData}
                                isLoading={isLoading || isSaving}
                                digitalSale={formattedDigitalSale}
                                stores={stores}
                                digitalProviders={digitalProviders}
                                digitalProducts={digitalProducts}
                                storeDigitalProviders={storeDigitalProviders}
                                frontSetting={frontSetting}
                                allConfigData={allConfigData}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const {
        digitalSales: digitalSalesState = {},
        stores,
        digitalProviders: digitalProvidersState = {},
        digitalProducts: digitalProductsState = {},
        storeDigitalProviders: storeDigitalProvidersState = {},
        frontSetting,
        allConfigData,
    } = state;

    return {
        digitalSale: digitalSalesState.digitalSale || null,
        isLoading: digitalSalesState.isLoading || digitalProvidersState.isLoading || digitalProductsState.isLoading || storeDigitalProvidersState.isLoading || false,
        isSaving: digitalSalesState.isSaving || false,
        stores,
        digitalProviders: digitalProvidersState.activeProviders || [],
        digitalProducts: digitalProductsState.digitalProducts || [],
        storeDigitalProviders: storeDigitalProvidersState.storeDigitalProviders || [],
        frontSetting,
        allConfigData,
    };
};

export default connect(mapStateToProps, {
    editDigitalSale,
    fetchDigitalSale,
    fetchStore,
    fetchActiveDigitalProviders,
    fetchDigitalProducts,
    fetchStoreDigitalProviders,
})(EditDigitalSale);
