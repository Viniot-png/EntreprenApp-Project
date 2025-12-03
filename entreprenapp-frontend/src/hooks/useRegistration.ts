
import { useState } from 'react';

export type UserRole = 'entrepreneur' | 'investisseur' | 'startup' | 'organisation' | 'universite';

export interface BasicInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface RoleSpecificData {
  [key: string]: any;
}

export interface RegistrationData {
  role: UserRole | null;
  basicInfo: BasicInfo;
  roleSpecificData: RoleSpecificData;
}

const initialBasicInfo: BasicInfo = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
};

export const useRegistration = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    role: null,
    basicInfo: initialBasicInfo,
    roleSpecificData: {}
  });

  const updateRole = (role: UserRole) => {
    setRegistrationData(prev => ({ ...prev, role }));
  };

  const updateBasicInfo = (basicInfo: BasicInfo) => {
    setRegistrationData(prev => ({ ...prev, basicInfo }));
  };

  const updateRoleSpecificData = (data: RoleSpecificData) => {
    setRegistrationData(prev => ({ ...prev, roleSpecificData: data }));
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  return {
    currentStep,
    registrationData,
    updateRole,
    updateBasicInfo,
    updateRoleSpecificData,
    nextStep,
    prevStep,
    setCurrentStep
  };
};
