import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

jest.mock('next/link', () => {
  return ({ children, href }) => <a href={href}>{children}</a>
})

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: null, logout: jest.fn() }),
}))

import Navbar from '../components/Navbar'

describe('Navbar Component', () => {
  it('renders StudyHub brand', () => {
    render(<Navbar />)
    expect(screen.getByText('StudyHub')).toBeInTheDocument()
  })

  it('shows Login and Register buttons when not logged in', () => {
    render(<Navbar />)
    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByText('Register')).toBeInTheDocument()
  })
})