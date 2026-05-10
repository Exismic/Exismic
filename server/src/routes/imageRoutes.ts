import express from 'express';
import axios from 'axios';

const router = express.Router();

/**
 * Image Generation Route
 */
router.post('/generate-image', async (req, res) => {
  try {
    const { prompt, width, height } = req.body;
    const hfToken = process.env.HUGGINGFACE_TOKEN;

    if (!hfToken) return res.status(503).json({ error: 'HF Token missing' });

    console.log(`[ImageEngine] Generating image: ${prompt}`);

    const hfUrl = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell";
    const response = await axios.post(hfUrl, {
      inputs: prompt,
      parameters: { width, height }
    }, {
      headers: { Authorization: `Bearer ${hfToken}` },
      responseType: 'arraybuffer'
    });

    const base64Image = Buffer.from(response.data).toString('base64');
    res.json({ success: true, image: `data:image/png;base64,${base64Image}` });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Background Removal Route
 */
router.post('/remove-bg', async (req, res) => {
  // Logic for BG removal offloading
  res.json({ success: false, error: 'BG Removal offloading pending implementation' });
});

export default router;
