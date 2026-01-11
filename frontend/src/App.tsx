import type React from 'react';
import { Dashboard } from './components/Dashboard/Dashboard';

const App: React.FC = () => {
  return (
    <div className="bg-background text-foreground">
      <Dashboard />
    </div>
  );
};

export default App;
