const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function downloadFacebookVideo(videoUrl) {
  // Launch Puppeteer
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    // Navigate to the Facebook video page
    await page.goto(videoUrl, { waitUntil: 'networkidle2' });

    // Extract the video URL
    const videoSrc = await page.evaluate(() => {
      const videoElement = document.querySelector('video');
      return videoElement ? videoElement.src : null;
    });

    if (!videoSrc) {
      throw new Error('Could not find video element.');
    }

    // Download the video
    const videoPath = path.resolve(__dirname, 'downloaded_video.mp4');
    const writer = fs.createWriteStream(videoPath);
    const response = await axios({
      url: videoSrc,
      method: 'GET',
      responseType: 'stream'
    });

    response.data.pipe(writer);

    // Return a promise to handle completion
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

  } catch (error) {
    console.error('Error downloading video:', error);
  } finally {
    await browser.close();
  }
}

// Example usage
const facebookVideoUrl = "https://www.facebook.com/reel/1126234458470125/?mibextid=FqQbvRVe40gbju2b";
downloadFacebookVideo(facebookVideoUrl)
  .then(() => console.log('Video downloaded successfully!'))
  .catch(error => console.error('Error:', error));
