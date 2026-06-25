export function debugLog(event: string, data?: unknown) {
  if (__DEV__) {
    console.log('[VideoDiary]', event, data ?? '');
  }
}
