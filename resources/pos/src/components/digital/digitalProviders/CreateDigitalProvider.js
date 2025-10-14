import React from "react";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import MasterLayout from "../../MasterLayout";
import TabTitle from "../../../shared/tab-title/TabTitle";
import { placeholderText } from "../../../shared/sharedMethod";
import DigitalProviderForm from "./DigitalProviderForm";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import { addDigitalProvider } from "../../../store/action/digitalProviderAction";

const CreateDigitalProvider = ({ addDigitalProvider, isSaving }) => {
    const navigate = useNavigate();

    const addDigitalProviderData = (formValue) =>
        addDigitalProvider(formValue, navigate);

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle
                title={placeholderText("digital-provider.create.title")}
            />
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <DigitalProviderForm
                                onSubmit={addDigitalProviderData}
                                isLoading={isSaving}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </MasterLayout>
    );
};

const mapStateToProps = (state) => ({
    isSaving: state.digitalProviders?.isSaving || false,
});

export default connect(mapStateToProps, {
    addDigitalProvider,
})(CreateDigitalProvider);
