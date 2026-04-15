import { useState, useEffect } from 'react';

export const useDeviceId = (): string => {
  const [deviceId, setDeviceId] = useState<string>('');

  useEffect(() => {
    const stored = localStorage.getItem('asistencia_device_id');
    if (stored) {
      setDeviceId(stored);
    } else {
      const newId = crypto.randomUUID?.() || 
        `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('asistencia_device_id', newId);
      setDeviceId(newId);
    }
  }, []);

  return deviceId;
};
