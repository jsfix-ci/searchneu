import React, { ReactElement } from 'react';

interface FailedProps {
  onCancel: () => void;
}

export default function Failed({ onCancel }: FailedProps): ReactElement {
  return (
    <>
      <div className="phone-modal__body">
        <span className="phone-modal__header">
          Oops! Something went wrong. Please try again later.
        </span>
      </div>
      <div className="phone-modal__footer phone-modal__footer--buttons">
        <div className="phone-modal__input-group">
          <button key="cancel" onClick={onCancel} className="phone-modal__btn">
            Exit
          </button>
          <button
            key="ok"
            onClick={onCancel}
            className="phone-modal__btn phone-modal__btn--primary"
          >
            OK
          </button>
        </div>
      </div>
    </>
  );
}
