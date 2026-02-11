exports.handler = async (event, context) => {
  const { url } = event.queryStringParameters || {};

  if (!url) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "No URL provided" })
    };
  }

  try {
    const response = await fetch(url, { redirect: "follow" });
    return {
      statusCode: 200,
      body: JSON.stringify({ finalUrl: response.url })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to resolve link" })
    };
  }
};
