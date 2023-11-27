import { useState, useEffect, useMemo } from 'react';
import {
  LINE_ITEM_UNITS,
  LINE_ITEM_SHIPPING_FEE,
  LINE_ITEM_CUSTOMER_COMMISSION,
} from '../../../util/types';

import { useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

export const stripeCountry = 'GB';
export const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

export const usePaymentOptions = paymentRequest => {
  const options = useMemo(
    () => ({
      paymentRequest,
      style: {
        paymentRequestButton: {
          theme: 'dark', // One of 'dark', 'light', or 'light-outline'
          height: '48px', // Defaults to '40px'. The width is always '100%'.
          type: 'buy', // One of 'default', 'book', 'buy', or 'donate'
        },
      },
    }),
    [paymentRequest]
  );

  return options;
};

export const usePaymentRequest = ({ options, onPaymentMethod }) => {
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [canMakePayment, setCanMakePayment] = useState(false);

  useEffect(() => {
    if (stripe && paymentRequest === null) {
      const pr = stripe.paymentRequest(options);
      setPaymentRequest(pr);
    }
  }, [stripe, options, paymentRequest]);

  useEffect(() => {
    let subscribed = true;
    if (paymentRequest) {
      paymentRequest.canMakePayment().then(res => {
        if (res && subscribed) {
          setCanMakePayment(true);
        }
      });
    }

    return () => {
      subscribed = false;
    };
  }, [paymentRequest]);

  useEffect(() => {
    if (paymentRequest) {
      paymentRequest.on('paymentmethod', onPaymentMethod);
    }
    return () => {
      if (paymentRequest) {
        paymentRequest.off('paymentmethod', onPaymentMethod);
      }
    };
  }, [paymentRequest, onPaymentMethod]);

  return canMakePayment ? paymentRequest : null;
};

export const convertTransactionLineItemsToStripeFormat = lineItems => {
  const customerLineItems = lineItems?.filter(item => item.includeFor.includes('customer'));

  const lineItemLabels = {
    [LINE_ITEM_UNITS]: 'Item(s)',
    [LINE_ITEM_SHIPPING_FEE]: 'Shipping fee',
    [LINE_ITEM_CUSTOMER_COMMISSION]: 'Customer commission',
  };

  const formattedLineItems = customerLineItems?.map(item => ({
    label: lineItemLabels[item.code] || item.code,
    amount: item.lineTotal.amount,
  }));

  return formattedLineItems;
};
