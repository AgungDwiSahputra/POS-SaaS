import React, { useEffect } from "react";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import MasterLayout from "../../MasterLayout";
import TabTitle from "../../../shared/tab-title/TabTitle";
import { placeholderText } from "../../../shared/sharedMethod";
import DigitalWithdrawalForm from "./DigitalWithdrawalForm";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import { addDigitalWithdrawal } from "../../../store/action/digitalWithdrawalAction";
import { fetchStore } from "../../../store/action/storeAction";
import { fetchActiveDigitalProviders } from "../../../store/action/digitalProviderAction";
import { fetchStoreDigitalProviders } from "../../../store/action/storeDigitalProviderAction";

const CreateDigitalWithdrawal = ({
    addDigitalWithdrawal,
    fetchStore,
    fetchActiveDigitalProviders,
    fetchStoreDigitalProviders,
    stores,
    digitalProviders,
    storeDigitalProviders,
    frontSetting,
    allConfigData,
    isSaving,
}) => {
    const navigate = useNavigate();

    useEffect(() => {
        fetchStore(false);
        fetchActiveDigitalProviders();
        fetchStoreDigitalProviders({}, false);
    }, [fetchStore, fetchActiveDigitalProviders, fetchStoreDigitalProviders]);

    const addDigitalWithdrawalData = (formValue) => {
        addDigitalWithdrawal(formValue, navigate);
    };

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle
                title={placeholderText("digital-withdrawal.create.title")}
            />
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <DigitalWithdrawalForm
                                onSubmit={addDigitalWithdrawalData}
                                isLoading={isSaving}
                                stores={stores}
                                digitalProviders={digitalProviders}
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
        storeDigitalProviders: storeDigitalProvidersState = {},
        frontSetting,
        allConfigData,
        digitalWithdrawals: digitalWithdrawalsState = {},
    } = state;

    return {
        stores,
        digitalProviders: digitalProvidersState.activeProviders || digitalProvidersState.digitalProviders || [],
        storeDigitalProviders: storeDigitalProvidersState.storeDigitalProviders || [],
        frontSetting,
        allConfigData,
        isSaving: digitalWithdrawalsState.isSaving || false,
    };
};

export default connect(mapStateToProps, {
    addDigitalWithdrawal,
    fetchStore,
    fetchActiveDigitalProviders,
    fetchStoreDigitalProviders,
})(CreateDigitalWithdrawal);
