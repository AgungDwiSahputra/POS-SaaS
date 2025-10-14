import React, { useEffect, useMemo } from "react";
import { connect } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import MasterLayout from "../../MasterLayout";
import TabTitle from "../../../shared/tab-title/TabTitle";
import { placeholderText } from "../../../shared/sharedMethod";
import DigitalWithdrawalForm from "./DigitalWithdrawalForm";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import {
    editDigitalWithdrawal,
    fetchDigitalWithdrawal,
} from "../../../store/action/digitalWithdrawalAction";
import { fetchStore } from "../../../store/action/storeAction";
import { fetchActiveDigitalProviders } from "../../../store/action/digitalProviderAction";
import { fetchStoreDigitalProviders } from "../../../store/action/storeDigitalProviderAction";

const EditDigitalWithdrawal = ({
    digitalWithdrawal,
    isSaving,
    isLoading,
    editDigitalWithdrawal,
    fetchDigitalWithdrawal,
    fetchStore,
    fetchActiveDigitalProviders,
    fetchStoreDigitalProviders,
    stores,
    digitalProviders,
    storeDigitalProviders,
    frontSetting,
    allConfigData,
}) => {
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        if (id) {
            fetchDigitalWithdrawal(id);
        }
    }, [id, fetchDigitalWithdrawal]);

    useEffect(() => {
        fetchStore(false);
        fetchActiveDigitalProviders();
        fetchStoreDigitalProviders({}, false);
    }, [
        fetchStore,
        fetchActiveDigitalProviders,
        fetchStoreDigitalProviders,
    ]);

    const editDigitalWithdrawalData = (formValue) => {
        editDigitalWithdrawal(id, formValue, navigate);
    };

    const formattedDigitalWithdrawal = useMemo(() => {
        if (!digitalWithdrawal) {
            return null;
        }

        const attributes = digitalWithdrawal.attributes || {};
        return {
            id: digitalWithdrawal.id,
            store_id: attributes.store_id,
            digital_provider_id: attributes.digital_provider_id,
            customer_name: attributes.customer_name,
            customer_phone: attributes.customer_phone,
            withdrawal_amount: attributes.withdrawal_amount,
            admin_fee: attributes.admin_fee,
            notes: attributes.notes,
        };
    }, [digitalWithdrawal]);

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("digital-withdrawal.edit.title")} />
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <DigitalWithdrawalForm
                                onSubmit={editDigitalWithdrawalData}
                                isLoading={isSaving || isLoading}
                                digitalWithdrawal={formattedDigitalWithdrawal}
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
        digitalWithdrawals: digitalWithdrawalsState = {},
        stores,
        digitalProviders: digitalProvidersState = {},
        storeDigitalProviders: storeDigitalProvidersState = {},
        frontSetting,
        allConfigData,
    } = state;

    return {
        digitalWithdrawal: digitalWithdrawalsState.digitalWithdrawal || null,
        isLoading: digitalWithdrawalsState.isLoading || false,
        isSaving: digitalWithdrawalsState.isSaving || false,
        stores,
        digitalProviders: digitalProvidersState.activeProviders || digitalProvidersState.digitalProviders || [],
        storeDigitalProviders: storeDigitalProvidersState.storeDigitalProviders || [],
        frontSetting,
        allConfigData,
    };
};

export default connect(mapStateToProps, {
    editDigitalWithdrawal,
    fetchDigitalWithdrawal,
    fetchStore,
    fetchActiveDigitalProviders,
    fetchStoreDigitalProviders,
})(EditDigitalWithdrawal);
