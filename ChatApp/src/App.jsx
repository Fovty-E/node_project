import { useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './utils/contexts/AuthProvider';
import { PrivateRoute } from './components/PrivateRoute';
import { RegisterUser } from './pages/RegisterUser';
import { LoginUser } from './pages/LoginUser';
import { Dashboard } from './pages/Dashboard';
import { ChatsPage } from './pages/ChatsPage';

import 'bootstrap/dist/css/bootstrap.min.css';

const router = createBrowserRouter([
  {
    path: '/register',
    element: <RegisterUser />,
  },
  {
    path: 'login',
    element: <LoginUser />
  },
  {
    path: '/dashboard',
    element: (
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    )
  },
  {
    path: '/chat',
    element: (
      <PrivateRoute>
        <ChatsPage />
      </PrivateRoute>
    )
  },
])
function App() {
  const [count, setCount] = useState(0)

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
