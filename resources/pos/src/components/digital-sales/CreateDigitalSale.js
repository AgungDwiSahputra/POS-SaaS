import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DigitalSalesForm from './DigitalSalesForm';
import MasterLayout from '../MasterLayout';
import HeaderTitle from '../header/HeaderTitle';
import { addDigitalSale } from '../../store/action/digitalSaleAction';
import { fetchProviders } from '../../store/action/providerAction';
import { fetchDigitalProducts } from '../../store/action/digitalProductAction';
import { getFormattedMessage } from '../../shared/sharedMethod';

const CreateDigitalSale = (props) => {
    const {
        addDigitalSale,
        providers,
        digitalProducts,
        fetchProviders,
        fetchDigitalProducts
    } = props;
    const navigate = useNavigate();

    useEffect(() => {
        fetchProviders();
        fetchDigitalProducts();
    }, []);

    const addSaleData = (formValue) => {
        addDigitalSale(formValue, navigate);
    };

    return (
        <MasterLayout>
            <HeaderTitle title={getFormattedMessage('digital-sales.create.title')} to='/user/digital-sales' />
            <DigitalSalesForm
                addSaleData={addSaleData}
                providers={providers}
                digitalProducts={digitalProducts}
            />
        </MasterLayout>
    )
};

const mapStateToProps = (state) => {
    const { providers, digitalProducts } = state;
    return { providers, digitalProducts }
};

export default connect(mapStateToProps, { addDigitalSale, fetchProviders, fetchDigitalProducts })(CreateDigitalSale);
