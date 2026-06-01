# Lumora Priority Processing

This implementation adds a priority-processing layer for Pro users without forcing every heavy tool into a new async queue contract immediately.

## Current Flow

1. Next.js checks the authenticated user's Lumora plan.
2. Pro or active-subscription users are tagged as:
   - `priority: true`
   - `queue: "priority"`
   - `processingLabel: "Processing with Priority..."`
3. Free users are tagged as:
   - `priority: false`
   - `queue: "normal"`
4. Heavy backend routes choose the priority Modal endpoint when it is configured.
5. The UI shows a small Priority Processing badge while Pro jobs are running.

## Implemented Routes

- Background remover: `src/app/api/tools/image/bg-remove/route.ts`
- Image generation: `src/app/api/tools/ai/image-generate/route.ts`
- Video enhancer: `src/app/api/tools/video/enhancer/route.ts`

## Modal Endpoint Configuration

Background removal:

```env
MODAL_IMAGE_NORMAL_URL="https://your-normal-bg-worker.modal.run"
MODAL_IMAGE_NORMAL_API_KEY="normal-worker-key"
MODAL_IMAGE_PRIORITY_URL="https://your-priority-bg-worker.modal.run"
MODAL_IMAGE_PRIORITY_API_KEY="priority-worker-key"
```

The existing fallback variables still work:

```env
MODAL_IMAGE_URL="https://your-current-bg-worker.modal.run"
MODAL_IMAGE_API_KEY="current-key"
```

Video enhancement:

```env
MODAL_VIDEO_ENHANCER_NORMAL_URL="https://your-normal-video-worker.modal.run"
MODAL_VIDEO_ENHANCER_PRIORITY_URL="https://your-priority-video-worker.modal.run"
```

Fallback:

```env
MODAL_VIDEO_ENHANCER_URL="https://your-current-video-worker.modal.run"
```

## Modal Deployment Shape

Create two Modal apps per heavy tool:

- `worker-normal`: cheaper GPU, lower concurrency, normal timeout budget.
- `worker-priority`: faster GPU or higher concurrency, shorter timeout target, reserved for Pro traffic.

For the background remover, both workers can reuse `python-api/modal_bg_remover.py`. Deploy a second copy with a different Modal app name and URL, then place its URL in `MODAL_IMAGE_PRIORITY_URL`.

## BullMQ/Redis Phase

When Lumora needs true async queueing, add Redis + BullMQ with two named queues:

- `lumora-normal`
- `lumora-priority`

Next.js should enqueue job data with `priority: true` for Pro users, and workers should consume `lumora-priority` before `lumora-normal`. The current metadata fields already match that future contract, so the UI and job history do not need to change.
