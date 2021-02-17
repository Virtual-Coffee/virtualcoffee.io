exports.handler = (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ event, context }, null, 2),
  };
};
