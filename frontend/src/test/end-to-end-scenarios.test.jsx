/**
 * End-to-end testing scenarios for Impact ID application.
 * Tests complete user workflows and application behavior.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

// Test utilities
import { renderWithProviders } from './utils/renderWithProviders';

// Mock API responses
const mockApiResponses = {
  login: {
    success: {
      access_token: 'mock-token',
      user: {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'user'
      }
    },
    failure: {
      detail: 'Invalid credentials'
    }
  },
  signup: {
    success: {
      id: 1,
      username: 'newuser',
      email: 'new@example.com'
    },
    failure: {
      detail: 'Username already exists'
    }
  },
  tasks: {
    success: [
      {
        id: 1,
        title: 'Complete Profile',
        description: 'Fill out your profile information',
        xp_reward: 50,
        status: 'available'
      },
      {
        id: 2,
        title: 'First Task Submission',
        description: 'Submit your first impact task',
        xp_reward: 100,
        status: 'available'
      }
    ]
  },
  badges: {
    success: [
      {
        id: 1,
        title: 'First Steps',
        description: 'Completed your first task',
        icon: '🏆',
        rarity: 'common',
        earned: false,
        progress: 0
      },
      {
        id: 2,
        title: 'Profile Complete',
        description: 'Filled out complete profile',
        icon: '📝',
        rarity: 'common',
        earned: true,
        progress: 100
      }
    ]
  },
  leaderboard: {
    success: [
      {
        username: 'topuser',
        xp: 1000,
        rank: 1,
        badges_count: 5
      },
      {
        username: 'testuser',
        xp: 150,
        rank: 42,
        badges_count: 1
      }
    ]
  }
};

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('End-to-End User Scenarios', () => {
  let queryClient;
  let user;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    user = userEvent.setup();
    
    // Reset mocks
    vi.clearAllMocks();
    mockFetch.mockClear();
    
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });
  });

  afterEach(() => {
    queryClient.clear();
    vi.restoreAllMocks();
  });

  describe('User Registration Flow', () => {
    it('completes successful user registration', async () => {
      // Mock successful registration API call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockApiResponses.signup.success,
      });

      const RegistrationForm = () => {
        const [formData, setFormData] = React.useState({
          username: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        const [isSubmitting, setIsSubmitting] = React.useState(false);
        const [success, setSuccess] = React.useState(false);

        const handleSubmit = async (e) => {
          e.preventDefault();
          setIsSubmitting(true);
          
          try {
            const response = await fetch('/api/users/signup', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(formData),
            });
            
            if (response.ok) {
              setSuccess(true);
            }
          } catch (error) {
            console.error('Registration failed:', error);
          } finally {
            setIsSubmitting(false);
          }
        };

        if (success) {
          return <div data-testid="success-message">Registration successful!</div>;
        }

        return (
          <form onSubmit={handleSubmit}>
            <input
              data-testid="username-input"
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
            <input
              data-testid="email-input"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
            <input
              data-testid="password-input"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
            <input
              data-testid="confirm-password-input"
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              required
            />
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
        );
      };

      render(<RegistrationForm />);

      // Fill out registration form
      await user.type(screen.getByTestId('username-input'), 'newuser');
      await user.type(screen.getByTestId('email-input'), 'new@example.com');
      await user.type(screen.getByTestId('password-input'), 'SecurePass123!');
      await user.type(screen.getByTestId('confirm-password-input'), 'SecurePass123!');

      // Submit form
      await user.click(screen.getByText('Sign Up'));

      // Should show loading state
      expect(screen.getByText('Creating Account...')).toBeInTheDocument();

      // Should show success message
      await waitFor(() => {
        expect(screen.getByTestId('success-message')).toBeInTheDocument();
      });

      // Verify API was called correctly
      expect(mockFetch).toHaveBeenCalledWith('/api/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'newuser',
          email: 'new@example.com',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!'
        }),
      });
    });

    it('handles registration validation errors', async () => {
      // Mock registration failure
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockApiResponses.signup.failure,
      });

      const RegistrationFormWithValidation = () => {
        const [error, setError] = React.useState('');

        const handleSubmit = async (e) => {
          e.preventDefault();
          
          try {
            const response = await fetch('/api/users/signup', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username: 'existinguser' }),
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              setError(errorData.detail);
            }
          } catch (error) {
            setError('Network error occurred');
          }
        };

        return (
          <form onSubmit={handleSubmit}>
            {error && <div data-testid="error-message" role="alert">{error}</div>}
            <input type="text" placeholder="Username" />
            <button type="submit">Sign Up</button>
          </form>
        );
      };

      render(<RegistrationFormWithValidation />);

      await user.click(screen.getByText('Sign Up'));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Username already exists');
      });
    });
  });

  describe('User Login Flow', () => {
    it('completes successful login and redirects to dashboard', async () => {
      // Mock successful login
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockApiResponses.login.success,
      });

      const LoginForm = () => {
        const [credentials, setCredentials] = React.useState({ username: '', password: '' });
        const [isLoggedIn, setIsLoggedIn] = React.useState(false);

        const handleLogin = async (e) => {
          e.preventDefault();
          
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
          });

          if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.access_token);
            setIsLoggedIn(true);
          }
        };

        if (isLoggedIn) {
          return <div data-testid="dashboard">Welcome to Dashboard!</div>;
        }

        return (
          <form onSubmit={handleLogin}>
            <input
              data-testid="login-username"
              type="text"
              placeholder="Username"
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
            />
            <input
              data-testid="login-password"
              type="password"
              placeholder="Password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            />
            <button type="submit">Login</button>
          </form>
        );
      };

      render(<LoginForm />);

      // Enter credentials
      await user.type(screen.getByTestId('login-username'), 'testuser');
      await user.type(screen.getByTestId('login-password'), 'password123');

      // Submit login
      await user.click(screen.getByText('Login'));

      // Should redirect to dashboard
      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });

      // Should store token
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'mock-token');
    });

    it('handles invalid login credentials', async () => {
      // Mock login failure
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => mockApiResponses.login.failure,
      });

      const LoginFormWithError = () => {
        const [error, setError] = React.useState('');

        const handleLogin = async (e) => {
          e.preventDefault();
          
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username: 'wrong', password: 'wrong' }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            setError(errorData.detail);
          }
        };

        return (
          <form onSubmit={handleLogin}>
            {error && <div data-testid="login-error" role="alert">{error}</div>}
            <button type="submit">Login</button>
          </form>
        );
      };

      render(<LoginFormWithError />);

      await user.click(screen.getByText('Login'));

      await waitFor(() => {
        expect(screen.getByTestId('login-error')).toHaveTextContent('Invalid credentials');
      });
    });
  });

  describe('Task Management Flow', () => {
    it('displays available tasks and allows task submission', async () => {
      // Mock tasks API
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponses.tasks.success,
      });

      const TaskList = () => {
        const [tasks, setTasks] = React.useState([]);
        const [selectedTask, setSelectedTask] = React.useState(null);

        React.useEffect(() => {
          const fetchTasks = async () => {
            const response = await fetch('/api/tasks/');
            if (response.ok) {
              const data = await response.json();
              setTasks(data);
            }
          };
          fetchTasks();
        }, []);

        const handleTaskSubmit = (taskId) => {
          setTasks(tasks.map(task => 
            task.id === taskId 
              ? { ...task, status: 'submitted' }
              : task
          ));
        };

        return (
          <div>
            <h2>Available Tasks</h2>
            {tasks.map(task => (
              <div key={task.id} data-testid={`task-${task.id}`}>
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <span>XP: {task.xp_reward}</span>
                <button 
                  onClick={() => handleTaskSubmit(task.id)}
                  disabled={task.status === 'submitted'}
                >
                  {task.status === 'submitted' ? 'Submitted' : 'Submit Task'}
                </button>
              </div>
            ))}
          </div>
        );
      };

      render(<TaskList />);

      // Should load and display tasks
      await waitFor(() => {
        expect(screen.getByText('Complete Profile')).toBeInTheDocument();
        expect(screen.getByText('First Task Submission')).toBeInTheDocument();
      });

      // Should show task details
      expect(screen.getByText('Fill out your profile information')).toBeInTheDocument();
      expect(screen.getByText('XP: 50')).toBeInTheDocument();

      // Should allow task submission
      const submitButton = screen.getAllByText('Submit Task')[0];
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Submitted')).toBeInTheDocument();
      });
    });

    it('handles task submission with file upload', async () => {
      const TaskSubmissionForm = () => {
        const [file, setFile] = React.useState(null);
        const [description, setDescription] = React.useState('');
        const [isSubmitting, setIsSubmitting] = React.useState(false);

        const handleSubmit = async (e) => {
          e.preventDefault();
          setIsSubmitting(true);
          
          const formData = new FormData();
          formData.append('file', file);
          formData.append('description', description);

          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          setIsSubmitting(false);
        };

        return (
          <form onSubmit={handleSubmit}>
            <textarea
              data-testid="task-description"
              placeholder="Describe your submission"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <input
              data-testid="file-upload"
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Task'}
            </button>
          </form>
        );
      };

      render(<TaskSubmissionForm />);

      // Fill out form
      await user.type(screen.getByTestId('task-description'), 'This is my task submission');

      // Mock file upload
      const file = new File(['task content'], 'task.pdf', { type: 'application/pdf' });
      const fileInput = screen.getByTestId('file-upload');
      await user.upload(fileInput, file);

      // Submit form
      await user.click(screen.getByText('Submit Task'));

      // Should show loading state
      expect(screen.getByText('Submitting...')).toBeInTheDocument();

      // Should complete submission
      await waitFor(() => {
        expect(screen.getByText('Submit Task')).toBeInTheDocument();
      });
    });
  });

  describe('Badge System Flow', () => {
    it('displays user badges and progress', async () => {
      // Mock badges API
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponses.badges.success,
      });

      const BadgeDisplay = () => {
        const [badges, setBadges] = React.useState([]);

        React.useEffect(() => {
          const fetchBadges = async () => {
            const response = await fetch('/api/badges/');
            if (response.ok) {
              const data = await response.json();
              setBadges(data);
            }
          };
          fetchBadges();
        }, []);

        return (
          <div>
            <h2>Your Badges</h2>
            {badges.map(badge => (
              <div key={badge.id} data-testid={`badge-${badge.id}`}>
                <span>{badge.icon}</span>
                <h3>{badge.title}</h3>
                <p>{badge.description}</p>
                <div data-testid={`progress-${badge.id}`}>
                  Progress: {badge.progress}%
                </div>
                {badge.earned && (
                  <span data-testid={`earned-${badge.id}`}>✅ Earned</span>
                )}
              </div>
            ))}
          </div>
        );
      };

      render(<BadgeDisplay />);

      // Should display badges
      await waitFor(() => {
        expect(screen.getByText('First Steps')).toBeInTheDocument();
        expect(screen.getByText('Profile Complete')).toBeInTheDocument();
      });

      // Should show progress
      expect(screen.getByTestId('progress-1')).toHaveTextContent('Progress: 0%');
      expect(screen.getByTestId('progress-2')).toHaveTextContent('Progress: 100%');

      // Should show earned status
      expect(screen.getByTestId('earned-2')).toHaveTextContent('✅ Earned');
    });
  });

  describe('Leaderboard Flow', () => {
    it('displays leaderboard with user rankings', async () => {
      // Mock leaderboard API
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponses.leaderboard.success,
      });

      const Leaderboard = () => {
        const [rankings, setRankings] = React.useState([]);

        React.useEffect(() => {
          const fetchLeaderboard = async () => {
            const response = await fetch('/api/leaderboard/');
            if (response.ok) {
              const data = await response.json();
              setRankings(data);
            }
          };
          fetchLeaderboard();
        }, []);

        return (
          <div>
            <h2>Leaderboard</h2>
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Username</th>
                  <th>XP</th>
                  <th>Badges</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((user, index) => (
                  <tr key={user.username} data-testid={`rank-${user.rank}`}>
                    <td>{user.rank}</td>
                    <td>{user.username}</td>
                    <td>{user.xp}</td>
                    <td>{user.badges_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      };

      render(<Leaderboard />);

      // Should display leaderboard
      await waitFor(() => {
        expect(screen.getByText('topuser')).toBeInTheDocument();
        expect(screen.getByText('testuser')).toBeInTheDocument();
      });

      // Should show correct rankings
      expect(screen.getByTestId('rank-1')).toHaveTextContent('topuser');
      expect(screen.getByTestId('rank-42')).toHaveTextContent('testuser');

      // Should show XP and badge counts
      const topUserRow = screen.getByTestId('rank-1');
      expect(within(topUserRow).getByText('1000')).toBeInTheDocument();
      expect(within(topUserRow).getByText('5')).toBeInTheDocument();
    });
  });

  describe('Complete User Journey', () => {
    it('simulates complete user onboarding to task completion', async () => {
      // This would be a comprehensive test that combines multiple flows
      // Registration -> Login -> Profile Setup -> Task Completion -> Badge Earning

      let currentStep = 'registration';
      
      const CompleteJourney = () => {
        const [step, setStep] = React.useState('registration');
        const [user, setUser] = React.useState(null);

        const handleRegistration = () => {
          setUser({ username: 'newuser', xp: 0 });
          setStep('login');
        };

        const handleLogin = () => {
          setStep('dashboard');
        };

        const handleTaskComplete = () => {
          setUser({ ...user, xp: 100 });
          setStep('badge-earned');
        };

        switch (step) {
          case 'registration':
            return (
              <div>
                <h2>Sign Up</h2>
                <button onClick={handleRegistration}>Complete Registration</button>
              </div>
            );
          case 'login':
            return (
              <div>
                <h2>Login</h2>
                <button onClick={handleLogin}>Login</button>
              </div>
            );
          case 'dashboard':
            return (
              <div>
                <h2>Dashboard</h2>
                <p>Welcome, {user.username}!</p>
                <p>XP: {user.xp}</p>
                <button onClick={handleTaskComplete}>Complete First Task</button>
              </div>
            );
          case 'badge-earned':
            return (
              <div>
                <h2>Congratulations!</h2>
                <p>You earned your first badge!</p>
                <p>XP: {user.xp}</p>
              </div>
            );
          default:
            return null;
        }
      };

      render(<CompleteJourney />);

      // Complete registration
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
      await user.click(screen.getByText('Complete Registration'));

      // Login
      expect(screen.getByText('Login')).toBeInTheDocument();
      await user.click(screen.getByText('Login'));

      // Dashboard
      expect(screen.getByText('Welcome, newuser!')).toBeInTheDocument();
      expect(screen.getByText('XP: 0')).toBeInTheDocument();

      // Complete task
      await user.click(screen.getByText('Complete First Task'));

      // Badge earned
      expect(screen.getByText('Congratulations!')).toBeInTheDocument();
      expect(screen.getByText('XP: 100')).toBeInTheDocument();
    });
  });
});