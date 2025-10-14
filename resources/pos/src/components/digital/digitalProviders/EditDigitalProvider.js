import React, { useEffect, useMemo } from "react";
import { connect } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import MasterLayout from "../../MasterLayout";
import TabTitle from "../../../shared/tab-title/TabTitle";
import {
    getFormattedMessage,
    placeholderText,
} from "../../../shared/sharedMethod";
import DigitalProviderForm from "./DigitalProviderForm";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import {
    editDigitalProvider,
    fetchDigitalProvider,
} from "../../../store/action/digitalProviderAction";

const EditDigitalProvider = ({
    digitalProvider,
    isLoading,
    isSaving,
    editDigitalProvider,
    fetchDigitalProvider,
}) => {
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        if (id) {
            fetchDigitalProvider(id);
        }
    }, [id, fetchDigitalProvider]);

    const editDigitalProviderData = (formValue) =>
        editDigitalProvider(id, formValue, navigate);

    const formattedDigitalProvider = useMemo(() => {
        if (!digitalProvider) {
            return null;
        }

        return digitalProvider.attributes
            ? { ...digitalProvider.attributes, id: digitalProvider.id }
            : digitalProvider;
    }, [digitalProvider]);

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle
                title={placeholderText("digital-provider.edit.title")}
            />
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <DigitalProviderForm
                                onSubmit={editDigitalProviderData}
                                isLoading={isSaving || isLoading}
                                digitalProvider={formattedDigitalProvider}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const { digitalProviders: digitalProvidersState = {} } = state;
    return {
        digitalProvider: digitalProvidersState.digitalProvider || null,
        isLoading: digitalProvidersState.isLoading || false,
        isSaving: digitalProvidersState.isSaving || false,
    };
};

export default connect(mapStateToProps, {
    editDigitalProvider,
    fetchDigitalProvider,
})(EditDigitalProvider);
