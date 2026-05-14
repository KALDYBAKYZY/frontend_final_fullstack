import { AuthProvider } from '../context/AuthContext'
import { SocketProvider } from '../context/SocketContext'
import Navbar from '../components/Navbar'
import './globals.css'

export const metadata = {
  title: 'StudyHub',
  description: 'Collaborative Study Platform',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <SocketProvider>
            <Navbar />
            <main className="main-content">{children}</main>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
