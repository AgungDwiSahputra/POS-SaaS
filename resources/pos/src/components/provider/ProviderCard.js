import React from "react";
import { Card } from "react-bootstrap-v5";
import Carousel from "react-elastic-carousel";
import { getFormattedMessage, currencySymbolHandling } from "../../shared/sharedMethod";

const ProviderCard = ({ providers, frontSetting, allConfigData }) => {
    const currencySymbol =
        frontSetting &&
        frontSetting.value &&
        frontSetting.value.currency_symbol;

    const formatCurrency = (amount) => {
        return currencySymbolHandling(
            allConfigData,
            currencySymbol,
            amount
        );
    };

    // Filter only active providers
    const activeProviders = providers && providers.length > 0
        ? providers.filter(provider => {
            const attributes = provider.attributes || provider;
            return attributes.status === 'active';
        })
        : [];

    if (!activeProviders || activeProviders.length === 0) {
        return (
            <div className="text-center py-4">
                <p className="text-muted">{getFormattedMessage("provider.no.providers.available")}</p>
            </div>
        );
    }

    return (
        <div className="provider-cards-container">
            <h5 className="mb-3">{getFormattedMessage("providers.title")}</h5>
            <Carousel
                itemsToShow={3}
                itemsToScroll={1}
                pagination={false}
                showArrows={true}
                breakPoints={[
                    { width: 1, itemsToShow: 1 },
                    { width: 550, itemsToShow: 2 },
                    { width: 850, itemsToShow: 3 },
                    { width: 1150, itemsToShow: 4 },
                    { width: 1450, itemsToShow: 5 },
                    { width: 1750, itemsToShow: 6 },
                ]}
            >
                {activeProviders.map((provider, index) => {
                    const attributes = provider.attributes || provider;
                    return (
                        <div key={provider.id || index} className="px-2">
                            <Card className="h-100 shadow-sm">
                                <Card.Body className="d-flex flex-column">
                                    <div className="text-center mb-3">
                                        <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                                             style={{ width: '60px', height: '60px' }}>
                                            <span className="text-white fw-bold fs-4">
                                                {attributes.nama_provider ? attributes.nama_provider.charAt(0).toUpperCase() : 'P'}
                                            </span>
                                        </div>
                                    </div>
                                    <Card.Title className="text-center mb-2 fs-6">
                                        {attributes.nama_provider || 'N/A'}
                                    </Card.Title>
                                    <div className="text-center">
                                        <small className="text-muted">
                                            {getFormattedMessage("digital-sale.provider.balance")}
                                        </small>
                                        <div className="fw-bold text-success fs-5">
                                            {formatCurrency(attributes.saldo || 0)}
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                    );
                })}
            </Carousel>
        </div>
    );
};

export default ProviderCard;