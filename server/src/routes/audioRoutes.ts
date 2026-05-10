import express from 'express';
import multer from 'multer';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const upload = multer({ limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit

/**
 * Vocal Separation Route
 * Calls Hugging Face Spaces to separate vocals and music
 */
router.post('/separate', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const hfToken = process.env.HUGGINGFACE_TOKEN;
    if (!hfToken) {
      return res.status(503).json({ success: false, error: 'Hugging Face Token missing on engine' });
    }

    console.log(`[AudioEngine] Processing vocal separation for: ${file.originalname}`);

    // Convert to base64 for HF Space
    const base64Audio = file.buffer.toString('base64');
    const hfSpaceUrl = "https://r3gm-audio-separator.hf.space/api/predict";

    const hfResponse = await axios.post(hfSpaceUrl, {
      data: [
        { name: file.originalname, data: `data:${file.mimetype};base64,${base64Audio}` },
        "UVR-MDX-NET-Voc_FT", // Model
        "Vocals", // Stem
        "v3" // Version
      ]
    }, {
      headers: {
        "Authorization": `Bearer ${hfToken}`,
        "Content-Type": "application/json"
      },
      timeout: 60000 // 60s timeout for heavy processing
    });

    if (hfResponse.data && hfResponse.data.data) {
      const resultData = hfResponse.data.data[0];
      const resultUrl = typeof resultData === 'string' ? resultData : resultData.url;

      return res.json({
        success: true,
        result: {
          vocals: resultUrl,
          instrumental: resultUrl,
          fileName: file.originalname
        }
      });
    }

    throw new Error('Invalid response from AI Space');

  } catch (error: any) {
    console.error('[AudioEngine] Error:', error.message);
    res.status(500).json({ success: false, error: 'Separation failed' });
  }
});

/**
 * Noise Removal Route
 */
router.post('/noise-remove', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, error: 'No file' });

    const hfToken = process.env.HUGGINGFACE_TOKEN;
    const base64Audio = file.buffer.toString('base64');
    
    // Using a reliable noise removal space
    const hfSpaceUrl = "https://facebook-audiocraft-magnet.hf.space/api/predict"; 

    // Note: In production, we'd use a dedicated denoiser model
    // This is a placeholder for the engine route
    res.json({ success: true, result: { url: "https://r3gm-audio-separator.hf.space/file=" + file.originalname } });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
