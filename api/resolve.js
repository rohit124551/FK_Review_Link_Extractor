export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "No URL provided" });
  }

  try {
    const response = await fetch(url, { redirect: "follow" });
    res.status(200).json({ finalUrl: response.url });
  } catch (err) {
    res.status(500).json({ error: "Failed to resolve link" });
  }
}
