import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RoomPage, { loader as roomLoader } from './pages/RoomPage';
import PeersProvider from './providers/PeersProvider';

function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <HomePage />,
    },
    {
      path: '/:roomId',
      element: <RoomPage />,
      loader: roomLoader,
    },
  ]);
  return (
    <PeersProvider>
      <RouterProvider router={router}></RouterProvider>;
    </PeersProvider>
  );
}

export default App;
