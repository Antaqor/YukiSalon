import React from 'react';
import { render, act } from '@testing-library/react';
import useWebPush from './useWebPush';

test('subscribe requests permission', async () => {
  const requestPermission = jest.fn().mockResolvedValue('granted');
  (global as any).Notification = { permission: 'default', requestPermission };
  (navigator as any).serviceWorker = { register: jest.fn().mockResolvedValue({}) };

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
});
