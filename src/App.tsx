import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { WelcomeScreen } from './components/screens/WelcomeScreen';
import { IndexingScreen } from './components/screens/IndexingScreen';
import { LibraryScreen } from './components/screens/LibraryScreen';
import { DetailScreen } from './components/screens/DetailScreen';
import { Toast } from './components/ui/Toast';

function App() {
  const { currentView, loadSettings, loadScreenshots, settings } = useAppStore();

  useEffect(() => {
    // Load settings and screenshots on startup
    const init = async () => {
      await loadSettings();
      await loadScreenshots();

      // If we have existing data, we could go to library
      // But let user decide from welcome screen
    };
    init();
  }, []);

  return (
    <div className="font-sans antialiased">
      {currentView === 'welcome' && <WelcomeScreen />}
      {currentView === 'indexing' && <IndexingScreen />}
      {currentView === 'library' && <LibraryScreen />}
      {currentView === 'detail' && <DetailScreen />}
      <Toast />
    </div>
  );
}

export default App;
