import React, { useEffect } from "react";
import { connect } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import MasterLayout from "../MasterLayout";
import { editProvider, fetchProvider } from "../../store/action/providerAction";
import ProviderForm from "./ProviderForm";
import HeaderTitle from "../header/HeaderTitle";
import { getFormattedMessage } from "../../shared/sharedMethod";

const EditProvider = (props) => {
    const { editProvider, fetchProvider, providers } = props;
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        console.log('EditProvider: useEffect called, fetching provider with ID:', id);
        fetchProvider(id);
    }, []);

    const editProviderData = (formValue) => {
        editProvider(id, formValue, navigate);
    };

    return (
        <MasterLayout>
            <HeaderTitle
                title={getFormattedMessage("provider.edit.title")}
                to="/user/providers"
            />
            <ProviderForm
                id={id}
                editProviderData={editProviderData}
                providers={providers}
            />
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const { providers } = state;
    return { providers };
};

export default connect(mapStateToProps, { editProvider, fetchProvider })(
    EditProvider
);