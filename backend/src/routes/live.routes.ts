import { Router, Request, Response } from 'express';
import { openF1LiveService, fetchOpenF1Snapshot } from '../services/openf1live.service';

const router = Router();

function sseWrite(res: Response, event: string, data: unknown) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  // Force the response buffer to flush — required when compression is active
  // or behind a proxy. The compression middleware attaches .flush(); fall back
  // to a no-op if it's absent (e.g. when compression is disabled for this route).
  if (typeof (res as any).flush === 'function') (res as any).flush();
}

// SSE stream — each connected client receives live F1 timing updates
router.get('/stream', async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // disable nginx/proxy buffering
  res.flushHeaders();

  // Always send a "connected" event so the client knows the channel is open,
  // even when there is no live F1 session and the state cache is empty.
  sseWrite(res, 'connected', { ok: true });

  // On Vercel serverless there is no boot-time connect(); make sure at least
  // one OpenF1 snapshot has been built before we start streaming.
  await openF1LiveService.ensureConnected(8000);

  // Send current cached state immediately so the client doesn't start blank
  const currentState = openF1LiveService.getState();
  if (Object.keys(currentState).length > 0) {
    sseWrite(res, 'snapshot', currentState);
  }

  const onSnapshot = (state: Record<string, any>) => {
    sseWrite(res, 'snapshot', state);
  };

  const onUpdate = (msg: { topic: string; data: any; timestamp: string }) => {
    sseWrite(res, 'update', msg);
  };

  openF1LiveService.on('snapshot', onSnapshot);
  openF1LiveService.on('update', onUpdate);

  // Keep-alive comment every 25 s so proxies don't close the idle connection
  const ping = setInterval(() => {
    res.write(': ping\n\n');
    if (typeof (res as any).flush === 'function') (res as any).flush();
  }, 25000);

  req.on('close', () => {
    clearInterval(ping);
    openF1LiveService.off('snapshot', onSnapshot);
    openF1LiveService.off('update', onUpdate);
  });
});

// Snapshot REST endpoint polled by the frontend every 5 s.
// On a traditional server the persistent singleton already holds state.
// On Vercel serverless every invocation is fresh — in that case we open a
// one-shot SignalR connection, wait for the initial snapshot, and return it.
router.get('/state', async (_req: Request, res: Response) => {
  const cached = openF1LiveService.getState();

  if (Object.keys(cached).length > 0) {
    return res.json(cached);
  }

  // No persistent state — do a one-shot fetch (serverless / cold start)
  const state = await fetchOpenF1Snapshot();
  if (Object.keys(state).length > 0) {
    return res.json(state);
  }

  return res.status(503).json({
    error: 'live_timing_unavailable',
    message: 'F1 live timing is currently unavailable. The OpenF1 API returned no data.',
  });
});

export default router;
