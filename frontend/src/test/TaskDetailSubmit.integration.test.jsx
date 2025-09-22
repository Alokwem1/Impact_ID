import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import TaskDetailPage from '../tasks/TaskDetailPage.jsx';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from './testUtils';

vi.mock('../api/axios', () => {
  const get = vi.fn((url) => {
    if (url === '/api/tasks/123') {
      return Promise.resolve({ data: {
        id: 123,
        title: 'Impact Quiz',
        description: 'Answer a quick question',
        type: 'quiz',
        difficulty: 'beginner',
        xp_reward: 10,
        quiz_question: { question: '2 + 2 = ?', options: ['3','4','5'] },
        user_submission_status: null,
        user_attempts_used: 0,
        max_attempts: 3
      }});
    }
    return Promise.resolve({ data: {} });
  });
  const post = vi.fn((url, payload) => {
    if (url === '/api/tasks/123/submit') {
      return Promise.resolve({ data: { message: 'Task submitted successfully!', auto_approved: true, xp_earned: 10 } });
    }
    return Promise.resolve({ data: {} });
  });
  return { default: { get, post } };
});

vi.mock('react-hot-toast', () => ({
  default: Object.assign(() => {}, { success: vi.fn(), error: vi.fn() }),
  __esModule: true
}));

describe('TaskDetailPage submission flow', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  function renderDetail() {
    return renderWithProviders(
      <Routes>
        <Route path="/tasks/:id" element={<TaskDetailPage />} />
        <Route path="/tasks" element={<div>Tasks List</div>} />
      </Routes>,
      { route: '/tasks/123' }
    );
  }

  it('submits a quiz task and navigates back', async () => {
    renderDetail();
    await waitFor(() => expect(screen.getByText('Impact Quiz')).toBeInTheDocument());

    // Choose quiz answer
    const option = screen.getByLabelText('4');
    fireEvent.click(option);

    // Submit
    const submitBtn = screen.getByRole('button', { name: /submit task/i });
    fireEvent.click(submitBtn);

    await waitFor(() => expect(screen.getByText('Tasks List')).toBeInTheDocument());
  });
});
