import { useState, useCallback } from 'react';

export const usePopAnimation = (duration = 300) => {
  const [poppingId, setPoppingId] = useState<string | null>(null);

  const triggerPop = useCallback((id: string) => {
    setPoppingId(id);
    setTimeout(() => setPoppingId(null), duration);
  }, [duration]);

  return { poppingId, triggerPop };
};

export const useSinglePop = (duration = 300) => {
    const [isPopping, setIsPopping] = useState(false);
    const trigger = useCallback(() => {
        setIsPopping(true);
        setTimeout(() => setIsPopping(false), duration);
    }, [duration]);
    return { isPopping, trigger };
};
