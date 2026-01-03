import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchActiveIdentitiesForSelect } from "../../store/action/cashAdvanceIdentityAction";
import HeaderTitle from "../header/HeaderTitle";
import MasterLayout from "../MasterLayout";
import CashAdvanceForm from "./CashAdvanceForm";
import { fetchCashAdvance, editCashAdvance } from "../../store/action/cashAdvanceAction";
import { getFormattedMessage } from "../../shared/sharedMethod";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import { Alert } from "react-bootstrap-v5";

const EditCashAdvance = (props) => {
    const {
        fetchCashAdvance,
        editCashAdvance,
        cashAdvances,
        frontSetting,
        activeIdentitiesForSelect,
        fetchActiveIdentitiesForSelect,
    } = props;
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);

            try {
                await Promise.all([
                    fetchCashAdvance(id),
                    fetchActiveIdentitiesForSelect()
                ]);
            } catch (err) {
                setError(err.response?.status || 'ERROR');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id]);

    const itemsValue =
        cashAdvances &&
        cashAdvances.length === 1 &&
        cashAdvances.map((cashAdvance) => ({
            date: cashAdvance.date,
            identity_id: cashAdvance.identity_id,
            identity_name: cashAdvance.identity_name,
            amount: cashAdvance.amount,
            notes: cashAdvance.notes,
            id: cashAdvance.id,
        }));

    if (loading) {
        return (
            <MasterLayout>
                <TopProgressBar />
                <HeaderTitle
                    title={getFormattedMessage("cash-advance.edit.title")}
                    to="/user/cash-advance-identities"
                />
                <div className="card">
                    <div className="card-body">
                        <div className="text-center">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2">Loading cash advance data...</p>
                        </div>
                    </div>
                </div>
            </MasterLayout>
        );
    }

    if (error === 404) {
        return (
            <MasterLayout>
                <TopProgressBar />
                <HeaderTitle
                    title={getFormattedMessage("cash-advance.edit.title")}
                    to="/user/cash-advance-identities"
                />
                <Alert variant="warning" className="text-center">
                    <h5>Data tidak ditemukan</h5>
                    <p>Cash advance dengan ID tersebut tidak ada atau sudah dihapus.</p>
                </Alert>
            </MasterLayout>
        );
    }

    if (error === 403) {
        return (
            <MasterLayout>
                <TopProgressBar />
                <HeaderTitle
                    title={getFormattedMessage("cash-advance.edit.title")}
                    to="/user/cash-advance-identities"
                />
                <Alert variant="danger" className="text-center">
                    <h5>Akses Ditolak</h5>
                    <p>Anda tidak memiliki izin untuk mengedit cash advance ini.</p>
                </Alert>
            </MasterLayout>
        );
    }

    if (error) {
        return (
            <MasterLayout>
                <TopProgressBar />
                <HeaderTitle
                    title={getFormattedMessage("cash-advance.edit.title")}
                    to="/user/cash-advance-identities"
                />
                <Alert variant="danger" className="text-center">
                    <h5>Terjadi Kesalahan</h5>
                    <p>Gagal memuat data cash advance. Silakan coba lagi.</p>
                </Alert>
            </MasterLayout>
        );
    }

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
                    editCashAdvance={editCashAdvance}
                    frontSetting={frontSetting}
                    activeIdentitiesForSelect={activeIdentitiesForSelect}
                    fetchActiveIdentitiesForSelect={fetchActiveIdentitiesForSelect}
                />
            )}
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const { cashAdvances, frontSetting, cashAdvanceIdentities } = state;
    return { 
        cashAdvances, 
        frontSetting,
        activeIdentitiesForSelect: cashAdvanceIdentities.activeIdentitiesForSelect,
    };
};

export default connect(mapStateToProps, {
    fetchCashAdvance,
    editCashAdvance,
    fetchActiveIdentitiesForSelect,
})(EditCashAdvance);
