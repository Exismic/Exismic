# Lumora Modal Background Remover

Self-hosted background removal endpoint using Modal.com, FastAPI, `rembg`, and the `u2net` model.

## 1. Install Modal CLI

```bash
pip install modal
modal setup
```

## 2. Create the API key secret

Pick a strong private key and store it in Modal:

```bash
modal secret create lumora-bg-remover BG_REMOVER_API_KEY="replace-with-a-long-random-key"
```

The Next.js app must use the same value as `MODAL_IMAGE_API_KEY`.

## 3. Deploy

From the project root:

```bash
modal deploy python-api/modal_bg_remover.py
```

Modal will print a URL like:

```text
https://your-workspace--lumora-bg-remover.modal.run
```

Use that as `MODAL_IMAGE_URL`.

## 4. Configure Next.js

Add this to `.env.local`:

```env
MODAL_IMAGE_URL=https://your-user--lumora-bg-remover-lumora-bg-remover.modal.run
MODAL_IMAGE_API_KEY=replace-with-a-long-random-key
```

Restart `npm run dev` after changing env vars.

## 5. Test with curl

```bash
curl -X POST "$MODAL_IMAGE_URL/remove-bg" \
  -H "X-Api-Key: $MODAL_IMAGE_API_KEY" \
  -F "file=@input.jpg" \
  --output cutout.png
```

## 6. Next.js backend call

The route at `src/app/api/tools/image/bg-remove/route.ts` now tries Modal first:

```ts
const modalResponse = await axios.post(`${MODAL_IMAGE_URL}/remove-bg`, formData, {
  headers: { "X-Api-Key": MODAL_IMAGE_API_KEY },
  responseType: "arraybuffer",
  timeout: 45000
});
```

It saves the returned transparent PNG into `public/results` and returns the local result URL to the frontend.

## Notes

- Cold starts are slower. Warm requests should be much faster because the `u2net` session is loaded once per container.
- `scaledown_window=300` keeps the container warm for about five minutes after use.
- The endpoint accepts PNG, JPEG, and WebP up to 12MB.
- If GPU availability is constrained, change `gpu="T4"` to `gpu="any"` in `modal_bg_remover.py`.
