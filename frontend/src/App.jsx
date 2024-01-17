import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RoomPage, { loader as roomLoader } from './pages/RoomPage';

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
  return <RouterProvider router={router}></RouterProvider>;
}

export default App;
