import React from 'react';
import { HomepageView } from './HomepageView';

export const LoginView: React.FC<{ onEnterDashboard?: () => void }> = ({ onEnterDashboard }) => {
  return <HomepageView onEnterDashboard={onEnterDashboard} />;
};

export default LoginView;
