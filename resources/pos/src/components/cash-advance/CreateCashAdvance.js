import React, { useEffect } from "react";
import { connect } from "react-redux";
import MasterLayout from "../MasterLayout";
import HeaderTitle from "../header/HeaderTitle";
import { useNavigate } from "react-router-dom";
import CashAdvanceForm from "./CashAdvanceForm";
import { addCashAdvance } from "../../store/action/cashAdvanceAction";
import { fetchAllWarehouses } from "../../store/action/warehouseAction";
import { getFormattedMessage } from "../../shared/sharedMethod";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";

const CreateCashAdvance = (props) => {
    const { addCashAdvance, warehouses, fetchAllWarehouses, frontSetting } = props;
    const navigate = useNavigate();

    useEffect(() => {
        fetchAllWarehouses();
    }, []);

    const addCashAdvanceData = (formValue) => {
        addCashAdvance(formValue, navigate);
    };

    return (
        <MasterLayout>
            <TopProgressBar />
            <HeaderTitle
                title={getFormattedMessage("cash-advance.create.title")}
                to="/user/cash-advances"
            />
            <CashAdvanceForm
                addCashAdvanceData={addCashAdvanceData}
                warehouses={warehouses}
                frontSetting={frontSetting}
            />
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const { warehouses, frontSetting } = state;
    return { warehouses, frontSetting };
};

export default connect(mapStateToProps, {
    addCashAdvance,
    fetchAllWarehouses,
})(CreateCashAdvance);
