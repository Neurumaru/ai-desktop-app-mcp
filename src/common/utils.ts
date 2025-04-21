/**
 * AbortSignal을 사용하여 취소 가능한 지연을 생성합니다.
 * @param signal - 지연을 취소하는 데 사용할 AbortSignal
 * @param ms - 지연 시간 (밀리초)
 * @param message - 타임아웃 시 표시할 오류 메시지
 * @returns Promise<void> - 지연이 완료되면 resolve되거나 취소되면 reject됩니다.
 */
export function cancellableDelay(signal: AbortSignal, ms: number, message: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      return reject(new Error(message));
    }
    const timeoutId = setTimeout(() => {
      resolve();
    }, ms);
    signal.addEventListener('abort', () => {
      clearTimeout(timeoutId);
      reject(new Error(message));
    });
  });
} 