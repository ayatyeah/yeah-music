import { BrowserRouter } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import Toaster from './components/ui/Toaster';

export default function App() {
  return (
    <BrowserRouter>
      <AppRouter />
      <Toaster />
    </BrowserRouter>
  );
}