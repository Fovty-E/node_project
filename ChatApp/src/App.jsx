import { useState, useEffect } from 'react'
import { RegisterUser } from './pages/RegisterUser'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css';
import { LoginUser } from './pages/LoginUser';
import { Dashboard } from './pages/Dashboard';

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
    element: <Dashboard />
  },
  {
    path: '/dashboard/chat',
    element: <Dashboard />
  }
])
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
