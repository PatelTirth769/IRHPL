import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { Toaster } from 'react-hot-toast';

function App() {
  const initializeAuthListener = useAuthStore((state) => state.initializeAuthListener);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    const unsubscribe = initializeAuthListener();
    return () => unsubscribe && unsubscribe();
  }, [initializeAuthListener]);

  if (isLoading) {
    return null;
  }

  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      <Toaster position="top-center" />
    </ThemeProvider>
  );
}

export default App;
