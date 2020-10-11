const Cache = require('@11ty/eleventy-cache-assets');

module.exports = async function () {
  console.log("Fetching events");
    
  try {
    const response = await Cache(
      `https://meetingplace.io/api/v1/group/virtual-coffee/events`,
      {
        duration: '1d', // 1 day
        type: 'json', // also supports "text" or "buffer"
      }
    )
    console.log(response);
    return response.slice(0, 10);
  } catch (e) {
    console.error(e);
  }
  
};




























