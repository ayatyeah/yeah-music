import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import Toaster from './components/ui/Toaster';
import { useDataStore } from './store/useDataStore';

export default function App() {
  const loadLibrary = useDataStore((state) => state.loadLibrary);

  useEffect(() => {
    void loadLibrary();
  }, [loadLibrary]);

  return (
    <BrowserRouter>
      <AppRouter />
      <Toaster />
    </BrowserRouter>
  );
}