import React from 'react';
import { useSelector } from 'react-redux';
import MasterLayout from '../MasterLayout';
import TabTitle from '../../shared/tab-title/TabTitle';
import TodaySalePurchaseCount from './TodaySalePurchaseCount';
import RecentSale from './RecentSale';
import TopSellingProduct from './TopSellingProduct';
import DigitalProductSummary from './DigitalProductSummary';
import { getPermission, placeholderText } from '../../shared/sharedMethod';
import ThisWeekSalePurchaseChart from "./ThisWeekSalePurchaseChart";
import StockAlert from "./StockAlert";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import { Permissions } from '../../constants';

const Dashboard = () => {
    const { frontSetting, allConfigData } = useSelector( state => state );

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText( 'dashboard.title' )} />
            <TodaySalePurchaseCount frontSetting={frontSetting} />
            <ThisWeekSalePurchaseChart frontSetting={frontSetting} />
            <TopSellingProduct frontSetting={frontSetting} />
            {getPermission(allConfigData?.permissions, Permissions.MANAGE_SALE) && <RecentSale frontSetting={frontSetting} />}
            <StockAlert frontSetting={frontSetting} />

            {/* Digital Product Summary - hanya tampil jika user memiliki permission digital product */}
            {(getPermission(allConfigData?.permissions, Permissions.MANAGE_DIGITAL_PROVIDERS) ||
              getPermission(allConfigData?.permissions, Permissions.MANAGE_DIGITAL_PRODUCTS) ||
              getPermission(allConfigData?.permissions, Permissions.MANAGE_DIGITAL_SALES)) && (
                <DigitalProductSummary />
            )}
        </MasterLayout>
    )
}

export default Dashboard;
