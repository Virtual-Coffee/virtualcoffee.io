const ImgixClient = require('imgix-core-js');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const useImgix =
  process.env.USE_IMGIX || process.env.ELEVENTY_ENV === 'production';

var imgixClient = new ImgixClient({
  domain: 'virtualcoffee.imgix.net',
});

module.exports = {
  eleventyComputed: {
    metadata: (data) => {
      if (data.podcast) {
        try {
          const { mp3, card } = data.podcast;
          if (mp3 && card) {
            const [urlKey, query] = mp3.split('.mp3?');
            const queries = querystring.parse(query);

            return {
              ...data.metadata,
              tags: {
                ...data.metadata.tags,
                'twitter:player':
                  urlKey +
                  '?client_source=twitter_card&amp;player_type=full_screen',
                'twitter:player:stream': `${urlKey}'.mp3?blob_id=${queries.blob_id}&client_source=twitter_card`,
                'og:image': useImgix
                  ? imgixClient.buildURL(card, {
                      w: 250,
                      auto: 'compress,format',
                    })
                  : card,
                'twitter:image': useImgix
                  ? imgixClient.buildURL(card, {
                      w: 1200,
                      auto: 'compress,format',
                    })
                  : card,
              },
            };
          }
          return data.metadata;
        } catch (e) {
          console.log(e);
          return data.metadata;
        }
      }
      return data.metadata;
    },

    podcast: (data) => {
      if (data.podcast) {
        try {
          const { mp3 } = data.podcast;
          if (mp3) {
            const [urlKey, query] = mp3.split('.mp3?');
            const queries = querystring.parse(query);
            return {
              ...data.podcast,
              blob_id: queries.blob_id,
              playerSrc: `${urlKey}.js?container_id=buzzsprout-player-${queries.blob_id}&player=small`,
            };
          }
          return data.podcast;
        } catch (e) {
          console.log(e);
          return data.podcast;
        }
      }
      return data.podcast;
    },

    transcript: (data) => {
      // attach transcript
      try {
        const filename = path.resolve(
          __dirname,
          data.page.inputPath.split('/').pop().split('.njk')[0] + '.txt'
        );

        if (fs.existsSync(filename)) {
          // return fs.readFileSync(filename, 'utf8');
          const lines = fs.readFileSync(filename, 'utf8').split('\n');
          const r = [];
          lines.forEach((line, i) => {
            if (i % 3 === 0) {
              const s = line.split('  ');
              if (s[1]) {
                r.push({
                  name: s[0],
                  timestamp: s[1],
                });
              }
            }

            if (i % 3 === 1) {
              if (r[Math.floor(i / 3)]) {
                r[Math.floor(i / 3)].text = line;
              }
            }
          });

          return r;
        }
      } catch (error) {
        console.log(error);
        return undefined;
      }

      return undefined;
    },
  },
};
