import React from "react";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import MasterLayout from "../MasterLayout";
import { addBalanceRequest } from "../../store/action/balanceRequestAction";
import BalanceRequestForm from "./BalanceRequestForm";
import HeaderTitle from "../header/HeaderTitle";
import { getFormattedMessage } from "../../shared/sharedMethod";

const CreateBalanceRequest = (props) => {
    const { addBalanceRequest } = props;
    const navigate = useNavigate();

    return (
        <MasterLayout>
            <HeaderTitle
                title={getFormattedMessage("balance-request.create.title")}
                to="/user/balance-requests"
            />
            <BalanceRequestForm addBalanceRequest={addBalanceRequest} navigate={navigate} />
        </MasterLayout>
    );
};

export default connect(null, { addBalanceRequest })(CreateBalanceRequest);
