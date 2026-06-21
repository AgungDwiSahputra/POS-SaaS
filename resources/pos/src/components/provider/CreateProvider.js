import React, { useEffect } from "react";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import MasterLayout from "../MasterLayout";
import { addProvider } from "../../store/action/providerAction";
import ProviderForm from "./ProviderForm";
import HeaderTitle from "../header/HeaderTitle";
import { getFormattedMessage } from "../../shared/sharedMethod";

const CreateProvider = (props) => {
    const { addProvider } = props;
    const navigate = useNavigate();

    const addProviderData = (formValue) => {
        addProvider(formValue, navigate);
    };

    return (
        <MasterLayout>
            <HeaderTitle
                title={getFormattedMessage("provider.create.title")}
                to="/user/providers"
            />
            <ProviderForm addProviderData={addProviderData} />
        </MasterLayout>
    );
};

export default connect(null, { addProvider })(CreateProvider);