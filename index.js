
const fetch = require('node-fetch');
const express = require('express');
const app = express();

const API_BASE_URL = 'https://www.googleapis.com/youtube/v3';
const MAX_RESULTS = 10;
const YOUTUBE_API_KEY = 'YOUR_API_KEY_HERE';

app.get('/', async (req, res) => {
  try {
    const recommendedVideos = await fetchVideos('videos', {
      chart: 'mostPopular',
      maxResults: MAX_RESULTS,
      regionCode: 'CN',
    });
    res.send(recommendedVideos.items);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

app.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const searchResults = await fetchVideos('search', {
      q: query,
      maxResults: MAX_RESULTS,
      regionCode: 'CN',
    });
    res.send(searchResults.items);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

app.get('/video', async (req, res) => {
  try {
    const { id } = req.query;
    const videoData = await fetchVideoData(id);
    const videoUrl = videoData.streams.find((s) => s.quality === 'hd1080').url;
    res.redirect(videoUrl);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

async function fetchVideos(endpoint, queryParams) {
  const url = `${API_BASE_URL}/${endpoint}?part=snippet&key=${YOUTUBE_API_KEY}&${toQueryString(
    queryParams
  )}`;
  const response = await fetch(url);
  const json = await response.json();
  return json;
}

async function fetchVideoData(id) {
  const url = `${API_BASE_URL}/videos?part=streamingDetails&id=${id}&key=${YOUTUBE_API_KEY}`;
  const response = await fetch(url);
  const json = await response.json();
  return json.items[0];
}

function toQueryString(obj) {
  return Object.entries(obj)
    .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
    .join('&');
}

module.exports = app;
