import React, { useMemo } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Card, Row, Col, Badge } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMobile,
    faShoppingCart,
    faWallet,
    faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import {
    getFormattedMessage,
    getPermission,
    currencySymbolHandling,
} from "../../shared/sharedMethod";
import { Permissions } from "../../constants";

const DigitalProductSummary = (props) => {
    const {
        digitalProviders,
        digitalProducts,
        digitalSales,
        storeDigitalProviders,
        frontSetting,
        allConfigData,
    } = props;

    const currencySymbol = frontSetting?.value?.currency_symbol || "Rp";

    // Calculate summary data
    const summaryData = useMemo(() => {
        const totalProducts = digitalProducts && Array.isArray(digitalProducts) ? digitalProducts.length : 0;
        const activeProducts = digitalProducts && Array.isArray(digitalProducts) ? digitalProducts.filter(p => p.attributes?.is_active).length : 0;
        const totalProviders = digitalProviders && Array.isArray(digitalProviders) ? digitalProviders.length : 0;
        const activeProviders = storeDigitalProviders && Array.isArray(storeDigitalProviders) ? storeDigitalProviders.filter(p => p.attributes?.is_active).length : 0;

        const totalSales = digitalSales && Array.isArray(digitalSales) ? digitalSales.filter(s => s.attributes?.status === 'completed').length : 0;
        const totalRevenue = digitalSales && Array.isArray(digitalSales) ?
            digitalSales.filter(s => s.attributes?.status === 'completed')
                      .reduce((sum, sale) => sum + parseFloat(sale.attributes?.margin || 0), 0) : 0;

        const totalBalance = storeDigitalProviders && Array.isArray(storeDigitalProviders) ?
            storeDigitalProviders.reduce((sum, provider) => sum + parseFloat(provider.attributes?.balance || 0), 0) : 0;

        return {
            totalProducts,
            activeProducts,
            totalProviders,
            activeProviders,
            totalSales,
            totalRevenue,
            totalBalance,
        };
    }, [digitalProviders, digitalProducts, digitalSales, storeDigitalProviders]);

    const formatCurrency = (amount) => {
        return currencySymbolHandling(allConfigData, currencySymbol, amount);
    };

    const summaryCards = [
        {
            title: getFormattedMessage("digital-products.total-products"),
            value: summaryData.totalProducts,
            icon: faMobile,
            color: "primary",
            bgColor: "bg-primary",
            permission: Permissions.MANAGE_DIGITAL_PRODUCTS,
        },
        {
            title: getFormattedMessage("digital-providers.total-providers"),
            value: summaryData.totalProviders,
            icon: faWallet,
            color: "success",
            bgColor: "bg-success",
            permission: Permissions.MANAGE_DIGITAL_PROVIDERS,
        },
        {
            title: getFormattedMessage("digital-sales.total-sales"),
            value: summaryData.totalSales,
            icon: faShoppingCart,
            color: "info",
            bgColor: "bg-info",
            permission: Permissions.MANAGE_DIGITAL_SALES,
        },
        {
            title: getFormattedMessage("digital-balance.total-balance"),
            value: formatCurrency(summaryData.totalBalance),
            icon: faChartLine,
            color: "warning",
            bgColor: "bg-warning",
            permission: Permissions.MANAGE_DIGITAL_PROVIDERS,
        },
    ];

    return (
        <div className="row g-4 mb-4">
            {summaryCards.map((card, index) => {
                const hasPermission = getPermission(allConfigData?.permissions, card.permission);

                if (!hasPermission) return null;

                return (
                    <div key={index} className="col-xl-3 col-md-6">
                        <Card className="h-100 border-0 shadow-sm">
                            <Card.Body className="text-center">
                                <div className={`${card.bgColor} rounded-circle d-inline-flex align-items-center justify-content-center mb-3`} style={{width: '60px', height: '60px'}}>
                                    <FontAwesomeIcon
                                        icon={card.icon}
                                        className="fs-4 text-white"
                                    />
                                </div>
                                <h4 className="mb-2 text-dark">
                                    {card.value}
                                </h4>
                                <p className="mb-0 text-muted small">
                                    {card.title}
                                </p>
                            </Card.Body>
                        </Card>
                    </div>
                );
            })}
        </div>
    );
};

const mapStateToProps = (state) => {
    const {
        digitalProviders,
        digitalProducts,
        digitalSales,
        storeDigitalProviders,
        frontSetting,
        allConfigData,
    } = state;

    return {
        digitalProviders,
        digitalProducts,
        digitalSales,
        storeDigitalProviders,
        frontSetting,
        allConfigData,
    };
};

export default connect(mapStateToProps)(DigitalProductSummary);