import React, { useEffect } from "react";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchWarehouses } from "../../store/action/warehouseAction";
import HeaderTitle from "../header/HeaderTitle";
import MasterLayout from "../MasterLayout";
import CashAdvanceForm from "./CashAdvanceForm";
import { fetchCashAdvance, editCashAdvance } from "../../store/action/cashAdvanceAction";
import { getFormattedMessage } from "../../shared/sharedMethod";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";

const EditCashAdvance = (props) => {
    const {
        fetchCashAdvance,
        editCashAdvance,
        cashAdvances,
        warehouses,
        fetchWarehouses,
        frontSetting,
    } = props;
    const { id } = useParams();

    useEffect(() => {
        fetchCashAdvance(id);
        fetchWarehouses();
    }, []);

    const itemsValue =
        cashAdvances &&
        cashAdvances.length === 1 &&
        cashAdvances.map((cashAdvance) => ({
            date: cashAdvance.attributes.date,
            identity_id: {
                value: cashAdvance.attributes.identity_id,
                label: cashAdvance.attributes.identity_name,
            },
            amount: cashAdvance.attributes.amount,
            notes: cashAdvance.attributes.notes,
            id: cashAdvance.id,
        }));

    return (
        <MasterLayout>
            <TopProgressBar />
            <HeaderTitle
                title={getFormattedMessage("cash-advance.edit.title")}
                to="/user/cash-advances"
            />
            {cashAdvances.length === 1 && (
                <CashAdvanceForm
                    singleCashAdvance={itemsValue}
                    id={id}
                    warehouses={warehouses}
                    editCashAdvance={editCashAdvance}
                    frontSetting={frontSetting}
                />
            )}
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const { cashAdvances, frontSetting } = state;
    return { cashAdvances, frontSetting };
};

export default connect(mapStateToProps, {
    fetchCashAdvance,
    editCashAdvance,
})(EditCashAdvance);
