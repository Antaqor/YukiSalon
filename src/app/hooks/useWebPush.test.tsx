import React from 'react';
import { render, act } from '@testing-library/react';
import axios from 'axios';
import useWebPush from './useWebPush';

jest.mock('axios');
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { accessToken: 'token' } }),
}));

test('subscribe requests permission', async () => {
  const requestPermission = jest.fn().mockResolvedValue('granted');
  (global as any).Notification = { permission: 'default', requestPermission };
  (navigator as any).serviceWorker = {
    register: jest.fn().mockResolvedValue({
      pushManager: { subscribe: jest.fn().mockResolvedValue({}) }
    }),
    getRegistration: jest.fn().mockResolvedValue({ pushManager: { getSubscription: jest.fn().mockResolvedValue(null) } })
  };
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  mockedAxios.get.mockResolvedValue({ data: { publicKey: 'test' } });
  mockedAxios.post.mockResolvedValue({});
  (global as any).Buffer = Buffer;

  let hook: any;
  function Wrapper() {
    hook = useWebPush();
    return null;
  }

  render(<Wrapper />);
  await act(async () => {
    await hook.subscribe();
  });

  expect(requestPermission).toHaveBeenCalled();
  expect((axios as jest.Mocked<typeof axios>).get).toHaveBeenCalled();
  expect((axios as jest.Mocked<typeof axios>).post).toHaveBeenCalled();
});
