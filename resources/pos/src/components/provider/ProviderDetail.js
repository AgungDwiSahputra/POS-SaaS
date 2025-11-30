import React, { useEffect } from "react";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import MasterLayout from "../MasterLayout";
import TabTitle from "../../shared/tab-title/TabTitle";
import { fetchProvider } from "../../store/action/providerAction";
import HeaderTitle from "../header/HeaderTitle";
import {
    getFormattedMessage,
    placeholderText,
    currencySymbolHandling,
    getFormattedDate,
} from "../../shared/sharedMethod";
import Spinner from "../../shared/components/loaders/Spinner";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";

const ProviderDetail = (props) => {
    const { providers, fetchProvider, isLoading, frontSetting, allConfigData } = props;
    const { id } = useParams();

    useEffect(() => {
        console.log('ProviderDetail: useEffect called, fetching provider with ID:', id);
        fetchProvider(id);
    }, []);

    const provider = providers && providers.length > 0 ? providers[0] : null;
    const attributes = provider ? (provider.attributes || provider) : null;

    const currencySymbol =
        frontSetting &&
        frontSetting.value &&
        frontSetting.value.currency_symbol;

    const formattedPrice = (saldo) => {
        return currencySymbolHandling(
            allConfigData,
            currencySymbol,
            saldo
        );
    };

    return (
        <MasterLayout>
            <TopProgressBar />
            <HeaderTitle
                title={getFormattedMessage("provider.detail.title")}
                to="/user/providers"
            />
            <TabTitle
                title={placeholderText("provider.detail.title")}
            />
            <div className="card card-body">
                <div className="row">
                    {isLoading ? (
                        <Spinner />
                    ) : (
                        attributes && (
                            <div className="col-xxl-12">
                                <table className="table table-responsive gy-7">
                                    <tbody>
                                        <tr>
                                            <th className="py-4" scope="row">
                                                {getFormattedMessage("provider.input.nama_provider.label")}
                                            </th>
                                            <td className="py-4">
                                                {attributes.nama_provider}
                                            </td>
                                        </tr>
                                        <tr>
                                            <th className="py-4" scope="row">
                                                {getFormattedMessage("provider.input.saldo.label")}
                                            </th>
                                            <td className="py-4">
                                                {formattedPrice(attributes.saldo)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <th className="py-4" scope="row">
                                                {getFormattedMessage("provider.input.deskripsi.label")}
                                            </th>
                                            <td className="py-4">
                                                {attributes.deskripsi || '-'}
                                            </td>
                                        </tr>
                                        <tr>
                                            <th className="py-4" scope="row">
                                                {getFormattedMessage("provider.input.status.label")}
                                            </th>
                                            <td className="py-4">
                                                <span className={`badge bg-light-${attributes.status === 'active' ? 'success' : 'danger'}`}>
                                                    {attributes.status}
                                                </span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th className="py-4" scope="row">
                                                {getFormattedMessage("globally.created-date.label")}
                                            </th>
                                            <td className="py-4">
                                                {getFormattedDate(attributes.created_at, allConfigData)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )
                    )}
                </div>
            </div>
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const { providers, isLoading, frontSetting, allConfigData } = state;
    return { providers, isLoading, frontSetting, allConfigData };
};

export default connect(mapStateToProps, { fetchProvider })(ProviderDetail);