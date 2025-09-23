import React, { useEffect } from "react";
import { connect } from "react-redux";
import MasterLayout from "../MasterLayout";
import HeaderTitle from "../header/HeaderTitle";
import { useLocation, useNavigate } from "react-router-dom";
import CashAdvanceForm from "./CashAdvanceForm";
import { addCashAdvance } from "../../store/action/cashAdvanceAction";
import { fetchActiveIdentitiesForSelect } from "../../store/action/cashAdvanceIdentityAction";
import { getFormattedMessage } from "../../shared/sharedMethod";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";

const CreateCashAdvance = (props) => {
    const { addCashAdvance, frontSetting, activeIdentitiesForSelect, fetchActiveIdentitiesForSelect } = props;
    const navigate = useNavigate();
    const location = useLocation();
    const prefillData = location.state?.prefill ?? null;

    const addCashAdvanceData = (formValue) => {
        addCashAdvance(formValue, navigate);
    };

    return (
        <MasterLayout>
            <TopProgressBar />
            <HeaderTitle
                title="Create Cash Advance"
                to="/user/cash-advance-identities"
            />
            <CashAdvanceForm
                addCashAdvanceData={addCashAdvanceData}
                frontSetting={frontSetting}
                activeIdentitiesForSelect={activeIdentitiesForSelect}
                fetchActiveIdentitiesForSelect={fetchActiveIdentitiesForSelect}
            />
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const { frontSetting, cashAdvanceIdentities } = state;
    return { 
        frontSetting,
        activeIdentitiesForSelect: cashAdvanceIdentities.activeIdentitiesForSelect,
    };
};

export default connect(mapStateToProps, {
    addCashAdvance,
    fetchActiveIdentitiesForSelect,
})(CreateCashAdvance);
