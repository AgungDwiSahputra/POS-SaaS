import React, { useEffect } from "react";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import MasterLayout from "../MasterLayout";
import { addDigitalProduct } from "../../store/action/digitalProductAction";
import DigitalProductForm from "./DigitalProductForm";
import HeaderTitle from "../header/HeaderTitle";
import { getFormattedMessage } from "../../shared/sharedMethod";

const CreateDigitalProduct = (props) => {
    const { addDigitalProduct } = props;
    const navigate = useNavigate();

    const addDigitalProductData = (formValue) => {
        addDigitalProduct(formValue, navigate);
    };

    return (
        <MasterLayout>
            <HeaderTitle
                title={getFormattedMessage("digital-product.create.title")}
                to="/user/digital-products"
            />
            <DigitalProductForm addDigitalProductData={addDigitalProductData} />
        </MasterLayout>
    );
};

export default connect(null, { addDigitalProduct })(CreateDigitalProduct);