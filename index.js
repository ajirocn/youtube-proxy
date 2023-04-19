
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

const search = async (q) => {
  const response = await axios.get('https://www.youtube.com/results', {
    params: {
      search_query: q
    }
  });
  return response.data
    .split('ytInitialData = ')[1]
    .split(';window')[0];
};

const getVideoInfo = async (id) => {
  const response = await axios.get(`https://www.youtube.com/watch?v=${id}`);
  const playerConfig = response.data
    .split('ytplayer.config = ')[1]
    .split(';ytplayer.load')[0];
  const config = JSON.parse(playerConfig);
  const videoDetails = config.args.player_response
    ? JSON.parse(config.args.player_response).videoDetails
    : {};
  const { url_encoded_fmt_stream_map } = response.data.split('&').reduce((accumulator, currentValue) => {
    const [ key, value ] = currentValue.split('=');
    accumulator[key] = decodeURIComponent(value);
    return accumulator;
  }, {});
  const urls = url_encoded_fmt_stream_map.split(',');
  const qualities = urls.map((url) => {
    const parameters = url.split('&').reduce((accumulator, currentValue) => {
      const [ key, value ] = currentValue.split('=');
      accumulator[key] = decodeURIComponent(value);
      return accumulator;
    }, {});
    const type = parameters.type.split(';')[0];
    return {
      quality: parameters.quality_label || parameters.quality || 'Unknown',
      type,
      url: parameters.url,
    };
  });
  return {
    videoDetails,
    qualities
  };
};

app.get('/search', async (req, res) => {
  const { q } = req.query;
  try {
    const data = await search(q);
    res.status(200).send(data);
  } catch (error) {
    console.log(error);
    res.status(400).send('Error occurred while searching videos.');
  }
});

app.get('/video', async (req, res) => {
  const { id } = req.query;
  try {
    const data = await getVideoInfo(id);
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(400).send('Error occurred while fetching video data.');
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Listening on port ${process.env.PORT || 3000}...`);
});
