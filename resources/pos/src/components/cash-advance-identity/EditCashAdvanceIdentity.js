import React, { useEffect } from "react";
import { connect } from "react-redux";
import MasterLayout from "../MasterLayout";
import HeaderTitle from "../header/HeaderTitle";
import { useNavigate, useParams } from "react-router-dom";
import CashAdvanceIdentityForm from "./CashAdvanceIdentityForm";
import { editCashAdvanceIdentity, fetchCashAdvanceIdentity } from "../../store/action/cashAdvanceIdentityAction";
import { getFormattedMessage } from "../../shared/sharedMethod";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";

const EditCashAdvanceIdentity = (props) => {
    const { editCashAdvanceIdentity, fetchCashAdvanceIdentity, singleCashAdvanceIdentity, frontSetting } = props;
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        fetchCashAdvanceIdentity(id);
    }, []);

    const editCashAdvanceIdentityData = (formValue) => {
        editCashAdvanceIdentity(id, formValue, navigate);
    };

    return (
        <MasterLayout>
            <TopProgressBar />
            <HeaderTitle
                title={getFormattedMessage("cash-advance-identity.edit.title")}
                to="/user/cash-advance-identities"
            />
            <CashAdvanceIdentityForm
                editCashAdvanceIdentity={editCashAdvanceIdentityData}
                singleCashAdvanceIdentity={singleCashAdvanceIdentity}
                frontSetting={frontSetting}
            />
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const { cashAdvanceIdentities, frontSetting } = state;
    return {
        singleCashAdvanceIdentity: cashAdvanceIdentities.singleCashAdvanceIdentity,
        frontSetting: frontSetting,
    };
};

export default connect(mapStateToProps, { editCashAdvanceIdentity, fetchCashAdvanceIdentity })(EditCashAdvanceIdentity);
