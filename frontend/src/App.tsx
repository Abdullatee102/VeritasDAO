import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { RegisterPage } from './pages/RegisterPage';
import { ElectionsPage } from './pages/ElectionsPage';
import { ElectionDetailPage } from './pages/ElectionDetailPage';
import { HistoryPage } from './pages/HistoryPage';
import { ChairmanPage } from './pages/ChairmanPage';
import { GovernancePage } from './pages/GovernancePage';
import { ActivityPage } from './pages/ActivityPage';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedElectionId, setSelectedElectionId] = useState<number | null>(null);

  const handleNavigate = (tab: string, electionId?: number) => {
    if (tab === 'election-detail' && electionId !== undefined) {
      setSelectedElectionId(electionId);
      setCurrentTab('election-detail');
    } else {
      setCurrentTab(tab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0F17] text-gray-100 font-sans">
      {/* Navigation */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'home' && <HomePage onNavigate={handleNavigate} />}
        {currentTab === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
        {currentTab === 'register' && <RegisterPage onNavigate={handleNavigate} />}
        {currentTab === 'elections' && <ElectionsPage onNavigate={handleNavigate} />}
        {currentTab === 'election-detail' && selectedElectionId !== null && (
          <ElectionDetailPage
            electionId={selectedElectionId}
            onBack={() => setCurrentTab('elections')}
            onNavigate={handleNavigate}
          />
        )}
        {currentTab === 'history' && <HistoryPage onNavigate={handleNavigate} />}
        {currentTab === 'governance' && <GovernancePage />}
        {currentTab === 'activity' && <ActivityPage />}
        {currentTab === 'chairman' && <ChairmanPage />}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
