
import React from 'react';

const Disclaimer: React.FC = () => {
  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-md my-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <i className="fas fa-exclamation-triangle text-amber-400"></i>
        </div>
        <div className="ml-3">
          <p className="text-sm text-amber-800">
            <span className="font-bold">Medical Disclaimer:</span> This tool is for educational and preliminary screening purposes only. It is not a substitute for professional medical diagnosis or treatment. Always seek the advice of an ophthalmologist or other qualified healthcare provider with any questions you may have regarding a medical condition.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;
