import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Login from './components/Login'
import Signup from './components/Signup'
import PostList from './pages/PostList'
import PostDetail from './pages/PostDetail'
import UserProfile from './pages/UserProfile'
import PrivateRoute from './components/PrivateRoute'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<PrivateRoute><PostList /></PrivateRoute>} />
          <Route path="/posts/:id" element={<PrivateRoute><PostDetail /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
