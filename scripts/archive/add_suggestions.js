const fs = require('fs');

const suggestionsMap = {
  'image-eraser': [
    'How do I get cleaner cutout edges?',
    'What image formats work best for transparent backgrounds?',
    'Can I remove the background of a complex image like hair?'
  ],
  'image-compressor': [
    'How do I compress without losing visible quality?',
    'What is the best compression level for websites?',
    'Can I batch compress a whole folder?'
  ],
  'image-resizer': [
    'What are the best dimensions for Instagram?',
    'How do I crop without ruining the composition?',
    'Will resizing reduce the image quality?'
  ],
  'image-converter': [
    'What is the difference between WEBP and PNG?',
    'Which format is best for transparent images?',
    'How do I convert a batch of images?'
  ],
  'image-restorer': [
    'Can it fix heavily blurred faces?',
    'How does it handle torn or damaged photos?',
    'Will it add color to black and white photos?'
  ],
  'watermark-remover': [
    'Can it remove large transparent text?',
    'Will the removed area look blurry?',
    'How does it handle watermarks on complex backgrounds?'
  ],
  'image-collage': [
    'What are the best layouts for Instagram stories?',
    'How do I add borders between images?',
    'Can I adjust the spacing between photos?'
  ],
  'image-minecraft-skin': [
    'Help me write a prompt for a futuristic knight',
    'How do I fix issues with the arms/legs?',
    'Can I upload a reference image?'
  ],
  'face-swap': [
    'How do I match the lighting perfectly?',
    'What angles work best for face swapping?',
    'Does it work with multiple faces in one photo?'
  ],
  'youtube-thumbnail': [
    'What makes a high-converting thumbnail?',
    'Which fonts are best for readability on mobile?',
    'How do I add a glow effect around my subject?'
  ],
  'meme-generator': [
    'What are the trending meme formats right now?',
    'How do I change the font to Impact?',
    'Can I upload my own blank template?'
  ],
  'video-bg-remover': [
    'How does this work without a green screen?',
    'Does it struggle with fast movement?',
    'What is the maximum video length supported?'
  ],
  'video-trimmer': [
    'How do I make precise frame-level cuts?',
    'Will trimming re-encode and lose quality?',
    'Can I trim multiple segments at once?'
  ],
  'video-compressor': [
    'What is the best bitrate for Discord/Twitter?',
    'How do I keep the audio quality high while compressing?',
    'Which codec is most universally supported?'
  ],
  'video-subtitles': [
    'How do I fix misheard words?',
    'Can I translate the subtitles to another language?',
    'How do I style the font and background of the text?'
  ],
  'video-enhancer': [
    'Can this upscale 720p to 4K?',
    'Does it remove grain and noise?',
    'How long does upscaling usually take?'
  ],
  'video-gif': [
    'How do I make the GIF loop perfectly?',
    'What frame rate is best for a smooth GIF?',
    'How do I reduce the GIF file size?'
  ],
  'video-merger': [
    'How do I add crossfade transitions between clips?',
    'Do the clips need to have the same resolution?',
    'Can I add background music to the merged video?'
  ],
  'audio-vocal-remover': [
    'How do I isolate the vocals completely?',
    'Does it work well with heavy metal tracks?',
    'What format should I download for mixing?'
  ],
  'audio-stem-splitter': [
    'How cleanly does it separate the bass from the drums?',
    'Can I mute specific instruments?',
    'What is the difference between 2-stem and 4-stem split?'
  ],
  'audio-noise-remover': [
    'Will it remove wind noise?',
    'Does it affect the quality of the main voice?',
    'How do I deal with echo or reverb?'
  ],
  'audio-tts': [
    'Which voice sounds the most natural?',
    'How do I add pauses or emphasis?',
    'Can it speak in different accents?'
  ],
  'audio-stt': [
    'How accurate is it with heavy accents?',
    'Does it automatically add punctuation?',
    'Can it differentiate between multiple speakers?'
  ],
  'audio-voice-changer': [
    'How do I make my voice sound like a robot?',
    'Will it preserve my original emotion and pitch?',
    'Does it work in real-time?'
  ],
  'audio-music-gen': [
    'Help me describe a lo-fi hip hop beat',
    'How do I make the track longer?',
    'Can I specify the tempo or BPM?'
  ],
  'pdf-merger': [
    'Can I rearrange the order of the files?',
    'Is there a file size limit for merging?',
    'Will it keep the original formatting?'
  ],
  'pdf-splitter': [
    'How do I extract only pages 5 to 10?',
    'Can I split every page into a separate file?',
    'Will the split files retain their text selectability?'
  ],
  'pdf-compressor': [
    'Will compressing make the images blurry?',
    'What is the recommended compression level for email?',
    'Does it remove invisible metadata to save space?'
  ],
  'pdf-to-img': [
    'Should I choose JPG or PNG?',
    'How do I increase the resolution of the output images?',
    'Can I download all pages as a ZIP file?'
  ],
  'pdf-img-to-pdf': [
    'How do I ensure the images fit the page properly?',
    'Can I add a margin around the images?',
    'Will it preserve the original image quality?'
  ],
  'pdf-to-word': [
    'Will it preserve complex tables and formatting?',
    'Can I edit the text directly after converting?',
    'How does it handle scanned documents?'
  ],
  'pdf-ocr': [
    'How accurate is it with handwritten text?',
    'Does it support multiple languages?',
    'Can it extract text from low-quality scans?'
  ],
  'ai-writer': [
    'Write a prompt for a persuasive sales email',
    'How can I change the tone to be more professional?',
    'Can you help me expand on a short bullet point?'
  ],
  'ai-img-gen': [
    'What are the best keywords for photorealism?',
    'How do I specify the lighting and camera angle?',
    'Help me fix weird hands or faces'
  ],
  'ai-chat': [
    'What kind of tasks can you help me with?',
    'Can you remember context from earlier in the conversation?',
    'How do I get you to adopt a specific persona?'
  ],
  'support-agent': [
    'How do I upgrade my Exismic account?',
    'Where can I find my billing history?',
    'I found a bug, how do I report it?'
  ],
  'ai-code': [
    'Help me plan the architecture for a new app',
    'How do I debug a confusing React error?',
    'Can you explain this snippet of code to me?'
  ],
  'ai-logo': [
    'What styles are best for a tech startup?',
    'How do I ensure the logo is minimalist?',
    'Can I specify exact brand colors?'
  ],
  'screenshot-to-code': [
    'What frameworks do you support?',
    'How accurate is the generated Tailwind CSS?',
    'Can it handle complex interactive components?'
  ],
  'discord-card': [
    'What image dimensions are best for the banner?',
    'How do I add custom badges?',
    'Can I preview how it looks on mobile vs desktop?'
  ],
  'productivity-qr': [
    'Can I change the color of the QR code?',
    'How do I add my logo to the center?',
    'Will this QR code expire?'
  ],
  'productivity-passgen': [
    'What makes a password truly secure?',
    'How many characters should I use?',
    'Can I exclude ambiguous characters like I and l?'
  ],
  'productivity-units': [
    'How do I convert complex derived units?',
    'Does it support metric to imperial conversions?',
    'Can I save my most used conversions?'
  ],
  'productivity-palette': [
    'Help me generate a cyberpunk color scheme',
    'What are the rules of color harmony?',
    'How do I export this palette to Tailwind?'
  ],
  'productivity-json': [
    'How do I fix a trailing comma error?',
    'Can it minify the JSON instead of formatting it?',
    'Does it support sorting the keys alphabetically?'
  ],
  'hashtag-generator': [
    'What is the ideal number of hashtags for Instagram?',
    'How do I mix broad and niche tags?',
    'Can it generate hashtags based on an image?'
  ],
  'typing-test': [
    'What is considered a good WPM score?',
    'How can I improve my accuracy?',
    'Should I focus on speed or avoiding mistakes?'
  ],
  'resume-builder': [
    'What keywords will get past the ATS?',
    'How do I summarize a 10-year career?',
    'Should I include a photo on my resume?'
  ],
  'invoice-generator': [
    'What essential details must an invoice have?',
    'How do I add tax and discounts?',
    'Can I save my company details for next time?'
  ],
  'social-caption-generator': [
    'Write an engaging hook for a lifestyle post',
    'How long should an Instagram caption be?',
    'Should I put hashtags in the caption or comments?'
  ]
};

let content = fs.readFileSync('src/data/tools.ts', 'utf8');

for (const [id, suggestions] of Object.entries(suggestionsMap)) {
  const regex = new RegExp("(id:\\s*'" + id + "'[\\s\\S]*?href:\\s*'[^']+',)");
  content = content.replace(regex, "$1\n    suggestions: " + JSON.stringify(suggestions) + ",");
}

fs.writeFileSync('src/data/tools.ts', content, 'utf8');
console.log('Successfully added custom suggestions to all tools!');
