import React from 'react';
import { func } from 'prop-types';

import { Elements } from '@stripe/react-stripe-js';
import { stripePromise as loadedStripe } from './StripePaymentRequestButton.shared';

import PaymentRequestForm from './PaymentRequestForm/PaymentRequestForm';

const StripePaymentRequestButton = props => {
  const { handleSubmit, ...rest } = props;
  return (
    <Elements stripe={loadedStripe}>
      <PaymentRequestForm onSubmit={handleSubmit} {...rest} />
    </Elements>
  );
};

StripePaymentRequestButton.propTypes = {
  handleSubmit: func.isRequired,
};

export default StripePaymentRequestButton;
