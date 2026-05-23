import { Router, Request, Response } from 'express';
import { f1TimingService } from '../services/f1timing.service';

const router = Router();

function sseWrite(res: Response, event: string, data: unknown) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  // Force the response buffer to flush — required when compression is active
  // or behind a proxy. The compression middleware attaches .flush(); fall back
  // to a no-op if it's absent (e.g. when compression is disabled for this route).
  if (typeof (res as any).flush === 'function') (res as any).flush();
}

// SSE stream — each connected client receives live F1 timing updates
router.get('/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // disable nginx/proxy buffering
  res.flushHeaders();

  // Always send a "connected" event so the client knows the channel is open,
  // even when there is no live F1 session and the state cache is empty.
  sseWrite(res, 'connected', { ok: true });

  // Send current cached state immediately so the client doesn't start blank
  const currentState = f1TimingService.getState();
  if (Object.keys(currentState).length > 0) {
    sseWrite(res, 'snapshot', currentState);
  }

  const onSnapshot = (state: Record<string, any>) => {
    sseWrite(res, 'snapshot', state);
  };

  const onUpdate = (msg: { topic: string; data: any; timestamp: string }) => {
    sseWrite(res, 'update', msg);
  };

  f1TimingService.on('snapshot', onSnapshot);
  f1TimingService.on('update', onUpdate);

  // Keep-alive comment every 25 s so proxies don't close the idle connection
  const ping = setInterval(() => {
    res.write(': ping\n\n');
    if (typeof (res as any).flush === 'function') (res as any).flush();
  }, 25000);

  req.on('close', () => {
    clearInterval(ping);
    f1TimingService.off('snapshot', onSnapshot);
    f1TimingService.off('update', onUpdate);
  });
});

// Snapshot REST endpoint (for initial page load without SSE)
router.get('/state', (_req: Request, res: Response) => {
  res.json(f1TimingService.getState());
});

export default router;
