import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import DigitalSalesForm from './DigitalSalesForm';
import MasterLayout from '../MasterLayout';
import HeaderTitle from '../header/HeaderTitle';
import { editDigitalSale, fetchDigitalSaleDetails } from '../../store/action/digitalSaleAction';
import { fetchProviders } from '../../store/action/providerAction';
import { fetchDigitalProducts } from '../../store/action/digitalProductAction';
import { getFormattedMessage } from '../../shared/sharedMethod';
import Spinner from "../../shared/components/loaders/Spinner";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";

const EditDigitalSale = (props) => {
    const {
        fetchDigitalSaleDetails,
        editDigitalSale,
        digitalSaleDetails,
        providers,
        digitalProducts,
        fetchProviders,
        fetchDigitalProducts,
        isLoading
    } = props;
    const { id } = useParams();

    useEffect(() => {
        fetchProviders();
        fetchDigitalProducts();
        fetchDigitalSaleDetails(id);
    }, [id]);

    const statusOptions = [
        { id: 1, name: 'Completed', value: 1 },
        { id: 2, name: 'Pending', value: 2 },
        { id: 3, name: 'Cancelled', value: 3 },
    ];

    const statusDefaultValue = digitalSaleDetails?.attributes?.status
        ? statusOptions.filter((option) => option.value === digitalSaleDetails.attributes.status)
        : [];

    const singleSale = digitalSaleDetails?.attributes && {
        date: digitalSaleDetails.attributes?.date,
        provider_id: digitalSaleDetails.attributes?.provider_id,
        note: digitalSaleDetails.attributes?.note,
        description: digitalSaleDetails.attributes?.description,
        status: digitalSaleDetails.attributes?.status,
        status_id: statusDefaultValue[0] || { label: 'Completed', value: 1 },
        items: digitalSaleDetails.attributes?.items || [],
    };

    const isDataReady = digitalSaleDetails?.attributes && providers?.length > 0;

    return (
        <MasterLayout>
            <TopProgressBar />
            <HeaderTitle title={getFormattedMessage('digital-sales.edit.title')} to='/user/digital-sales' />
            {isLoading || !isDataReady ? <Spinner /> :
                <DigitalSalesForm
                    singleSale={singleSale}
                    id={id}
                    providers={providers}
                    digitalProducts={digitalProducts}
                    editSale={true}
                    editDigitalSale={editDigitalSale}
                />}
        </MasterLayout>
    )
};

const mapStateToProps = (state) => {
    const { digitalSaleDetails, providers, digitalProducts, isLoading } = state;
    return { digitalSaleDetails, providers, digitalProducts, isLoading }
};

export default connect(mapStateToProps, { fetchDigitalSaleDetails, editDigitalSale, fetchProviders, fetchDigitalProducts })(EditDigitalSale);
