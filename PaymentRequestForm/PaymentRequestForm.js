import React from 'react';
import { string, func, object } from 'prop-types';
import classNames from 'classnames';

import { FormattedMessage } from '../../../../util/reactIntl';
import { LINE_ITEM_SHIPPING_FEE, propTypes } from '../../../../util/types';
import config from '../../../../config';

import { PaymentRequestButtonElement } from '@stripe/react-stripe-js';

import {
  usePaymentRequest,
  usePaymentOptions,
  convertTransactionLineItemsToStripeFormat,
  stripeCountry,
} from '../StripePaymentRequestButton.shared';
import css from './PaymentRequestForm.module.css';

/**
 * Divides the form with other page sections.
 */
const FormDivider = ({ className }) => {
  return (
    <div className={className}>
      <span className={css.formDividerText}>
        <FormattedMessage id="StripePaymentRequestButton.PaymentRequestForm.paymentDividerText" />
      </span>
    </div>
  );
};

const PaymentRequestForm = props => {
  const { rootClassName, className, title, totalPrice, lineItems, onSubmit } = props;
  const classes = classNames(rootClassName || css.root, className);

  const selectedCurrency = totalPrice?.currency || config.currency;
  const currencyInLowerCase = selectedCurrency.toLowerCase();

  const shippingLineItem = lineItems?.find(i => i.code === LINE_ITEM_SHIPPING_FEE);
  const shippingOption = shippingLineItem
    ? {
        id: 'shipping-fee',
        label: 'Shipping',
        detail: 'Arrival date to be confirmed by seller',
        amount: shippingLineItem.lineTotal.amount,
      }
    : null;

  const shippingParamsMaybe = shippingOption
    ? {
        requestShipping: true,
        shippingOptions: [shippingOption],
      }
    : {};

  const paymentAmount = totalPrice?.amount || 0;
  const paymentRequest = usePaymentRequest({
    options: {
      country: stripeCountry,
      currency: currencyInLowerCase,
      total: {
        label: title,
        amount: paymentAmount,
      },
      displayItems: convertTransactionLineItemsToStripeFormat(lineItems),
      ...shippingParamsMaybe,
    },

    onPaymentMethod: ({ complete, paymentMethod, ...data }) => {
      const shippingAddress = data.shippingAddress;
      onSubmit(paymentMethod, shippingAddress);
      complete('success');
    },
  });

  const options = usePaymentOptions(paymentRequest);

  if (!paymentRequest) {
    return null;
  }

  return (
    <div className={classes}>
      <PaymentRequestButtonElement className="PaymentRequestButton" options={options} />
      <FormDivider className={css.formDivider} />
    </div>
  );
};

PaymentRequestForm.defaultProps = {
  rootClassName: null,
  classNames: null,

  title: null,
};

PaymentRequestForm.propTypes = {
  rootClassName: string,
  className: string,

  title: string,
  totalPrice: object,
  lineItems: propTypes.lineItems,
  onSubmit: func.isRequired,
};

export default PaymentRequestForm;
