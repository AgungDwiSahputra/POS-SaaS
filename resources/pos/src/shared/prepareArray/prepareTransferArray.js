export const prepareTransferArray = (products) => {
    let transferProductRowArray = [];
    products.forEach(product => {
        // Use HPP if available, fallback to product_cost for new products without HPP
        const hppValue = product.attributes.hpp || product.attributes.product_cost;
        
        transferProductRowArray.push({
            name: product.attributes.name,
            code: product.attributes.code,
            barcode_url: product.attributes.barcode_url,
            stock: product.attributes.stock && product.attributes.stock.quantity,
            short_name: product.attributes.purchase_unit_name?.short_name,
            net_unit_cost :  hppValue,
            product_unit: product.attributes.product_unit,
            fix_net_unit: hppValue,
            purchase_unit: product.attributes.purchase_unit,
            id: product.id,
            product_id: product.id,
            product_price: hppValue,
            net_unit_price: hppValue,
            tax_type: product.attributes.tax_type,
            tax_value: product.attributes.order_tax ? product.attributes.order_tax : 0.00,
            tax_amount: 0.00,
            discount_type: '2',
            discount_value: 0.00,
            discount_amount: 0.00,
            quantity: 1,
            sub_total: 0.00,
            transfer_item_id: '',
        })
    });
    return transferProductRowArray;
};
