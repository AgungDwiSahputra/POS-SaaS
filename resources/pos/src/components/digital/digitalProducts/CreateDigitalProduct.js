import React from "react";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import MasterLayout from "../../MasterLayout";
import TabTitle from "../../../shared/tab-title/TabTitle";
import { getFormattedMessage } from "../../../shared/sharedMethod";
import DigitalProductForm from "./DigitalProductForm";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import { addDigitalProduct } from "../../../store/action/digitalProductAction";

const CreateDigitalProduct = ({ addDigitalProduct, isSaving }) => {
    const navigate = useNavigate();

    const addDigitalProductData = (formValue) => {
        addDigitalProduct(formValue, navigate);
    };

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle
                title={getFormattedMessage("digital-product.create.title")}
            />
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <DigitalProductForm
                                onSubmit={addDigitalProductData}
                                isLoading={isSaving}
                                isEditMode={false}
                                digitalProduct={null}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </MasterLayout>
    );
};

const mapStateToProps = (state) => ({
    isSaving: state.digitalProducts?.isSaving || false,
});

export default connect(mapStateToProps, {
    addDigitalProduct,
})(CreateDigitalProduct);
