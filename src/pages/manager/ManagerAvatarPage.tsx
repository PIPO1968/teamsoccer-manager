
import React from 'react';
import { useParams } from 'react-router-dom';
import { ManagerAvatarEditor } from './ManagerAvatarEditor';
import { useNavigate } from 'react-router-dom';

const ManagerAvatarPage: React.FC = () => {
  const { managerId } = useParams<{ managerId: string }>();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(`/manager/${managerId}`);
  };

  if (!managerId) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Manager ID</h1>
        <p className="text-gray-600">Please provide a valid manager ID.</p>
      </div>
    );
  }

  return (
    <ManagerAvatarEditor
      managerId={parseInt(managerId)}
      onBack={handleBack}
    />
  );
};

export default ManagerAvatarPage;
