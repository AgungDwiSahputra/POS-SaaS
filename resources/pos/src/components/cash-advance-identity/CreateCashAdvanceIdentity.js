import React from "react";
import { connect } from "react-redux";
import MasterLayout from "../MasterLayout";
import HeaderTitle from "../header/HeaderTitle";
import { useNavigate } from "react-router-dom";
import CashAdvanceIdentityForm from "./CashAdvanceIdentityForm";
import { addCashAdvanceIdentity } from "../../store/action/cashAdvanceIdentityAction";
import { getFormattedMessage } from "../../shared/sharedMethod";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";

const CreateCashAdvanceIdentity = (props) => {
    const { addCashAdvanceIdentity, frontSetting } = props;
    const navigate = useNavigate();

    const addCashAdvanceIdentityData = (formValue) => {
        addCashAdvanceIdentity(formValue, navigate);
    };

    return (
        <MasterLayout>
            <TopProgressBar />
            <HeaderTitle
                title={getFormattedMessage("cash-advance-identity.create.title")}
                to="/user/cash-advance-identities"
            />
            <CashAdvanceIdentityForm
                addCashAdvanceIdentityData={addCashAdvanceIdentityData}
                frontSetting={frontSetting}
            />
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const { frontSetting } = state;
    return {
        frontSetting: frontSetting,
    };
};

export default connect(mapStateToProps, { addCashAdvanceIdentity })(CreateCashAdvanceIdentity);
