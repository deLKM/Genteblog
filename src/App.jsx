import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Login from './components/Login'
import Signup from './components/Signup'
import Home from './pages/Home'
import PostDetail from './pages/PostDetail'
import UserProfile from './pages/UserProfile'
import Drafts from './pages/Drafts'
import Bookmarks from './pages/Bookmarks'
import Settings from './pages/Settings'
import NewPost from './pages/NewPost'
import PrivateRoute from './components/PrivateRoute'
import Register from './components/Register'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/new-post" element={<PrivateRoute><NewPost /></PrivateRoute>} />
          <Route path="/post/:postId" element={<PrivateRoute><PostDetail /></PrivateRoute>} />
          <Route path="/drafts" element={<PrivateRoute><Drafts /></PrivateRoute>} />
          <Route path="/bookmarks" element={<PrivateRoute><Bookmarks /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          <Route path="/user/:userId" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                {({ currentUser }) => (
                  <Navigate to={`/user/${currentUser?.uid}`} replace />
                )}
              </PrivateRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
