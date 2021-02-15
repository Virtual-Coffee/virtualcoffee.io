const fs = require('fs');
const path = require('path');

module.exports = {
  eleventyComputed: {
    transcript: (data) => {
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
        return undefined;
      } catch (error) {
        console.log(error);
        return undefined;
      }
    },
  },
};
