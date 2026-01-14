import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      // Successful login - navigate to /chat
      navigate('/chat');
    } catch (err: any) {
      // Error handling based on status codes from DISCOVERY.md Section 7.1
      if (err.response?.status === 401) {
        setError('Invalid email or password');
      } else if (err.response?.status === 404) {
        setError('User not found');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        {/* Company Branding */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <Building2 className="h-12 w-12 text-primary" />
          <h1 className="text-2xl font-bold text-primary">Company Name</h1>
          <p className="text-sm text-gray-600">
            Sign in to access your account
          </p>
        </div>

        {/* Error Message Display */}
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                // Clear error on new input
                if (error) setError('');
              }}
              placeholder="your.email@company.com"
              required
              disabled={submitting}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                // Clear error on new input
                if (error) setError('');
              }}
              placeholder="Enter your password"
              required
              disabled={submitting}
              className="w-full"
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-secondary hover:bg-secondary/90"
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
}
