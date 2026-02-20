
import React from 'react';

interface DisclaimerProps {
  t: (key: string) => string;
}

const Disclaimer: React.FC<DisclaimerProps> = ({ t }) => {
  return (
    <div className="bg-amber-50 border-l-2 border-amber-400 p-3 rounded-md my-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <i className="fas fa-exclamation-triangle text-amber-400 text-xs"></i>
        </div>
        <div className="ml-3">
          <p className="text-xs text-amber-800">
            <span className="font-bold">{t('disclaimer')}</span> {t('disclaimerText')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;
