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
            warehouse_id: {
                value: cashAdvance.attributes.warehouse_id,
                label: cashAdvance.attributes.warehouse_name,
            },
            issued_to_name: cashAdvance.attributes.issued_to_name,
            issued_to_phone: cashAdvance.attributes.issued_to_phone,
            issued_to_email: cashAdvance.attributes.issued_to_email,
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
    const { cashAdvances, warehouses, frontSetting } = state;
    return { cashAdvances, warehouses, frontSetting };
};

export default connect(mapStateToProps, {
    fetchCashAdvance,
    fetchWarehouses,
    editCashAdvance,
})(EditCashAdvance);
