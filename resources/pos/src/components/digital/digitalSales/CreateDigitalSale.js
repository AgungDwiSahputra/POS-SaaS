import React, { useEffect } from "react";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import MasterLayout from "../../MasterLayout";
import TabTitle from "../../../shared/tab-title/TabTitle";
import { placeholderText } from "../../../shared/sharedMethod";
import DigitalSaleForm from "./DigitalSaleForm";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import { addDigitalSale } from "../../../store/action/digitalSaleAction";
import { fetchStore } from "../../../store/action/storeAction";
import { fetchActiveDigitalProviders } from "../../../store/action/digitalProviderAction";
import { fetchDigitalProducts } from "../../../store/action/digitalProductAction";
import { fetchStoreDigitalProviders } from "../../../store/action/storeDigitalProviderAction";

const CreateDigitalSale = ({
    addDigitalSale,
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
    isSaving,
    isLoading,
}) => {
    const navigate = useNavigate();

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

    const addDigitalSaleData = (formValue) => {
        addDigitalSale(formValue, navigate);
    };

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle
                title={placeholderText("digital-sale.create.title")}
            />
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <DigitalSaleForm
                                onSubmit={addDigitalSaleData}
                                isLoading={isLoading || isSaving}
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
        stores,
        digitalProviders: digitalProvidersState = {},
        digitalProducts: digitalProductsState = {},
        storeDigitalProviders: storeDigitalProvidersState = {},
        frontSetting,
        allConfigData,
        digitalSales: digitalSalesState = {},
    } = state;

    return {
        stores,
        digitalProviders: digitalProvidersState.activeProviders || [],
        digitalProducts: digitalProductsState.digitalProducts || [],
        storeDigitalProviders: storeDigitalProvidersState.storeDigitalProviders || [],
        frontSetting,
        allConfigData,
        isSaving: digitalSalesState.isSaving || false,
        isLoading: digitalProvidersState.isLoading || digitalProductsState.isLoading || storeDigitalProvidersState.isLoading || false,
    };
};

export default connect(mapStateToProps, {
    addDigitalSale,
    fetchStore,
    fetchActiveDigitalProviders,
    fetchDigitalProducts,
    fetchStoreDigitalProviders,
})(CreateDigitalSale);
