export default async function handler(req, res) {
    const secret = process.env.REVALIDATION_SECRET;
  
    if (req.query.secret !== secret) {
      console.log("Invalid token received");
      return res.status(401).json({ message: "Invalid token" });
    }
  
    try {
      const pathToRevalidate = req.query.path || "/page1-copy";
      console.log(`Revalidating path: ${pathToRevalidate}`);
      await res.revalidate(pathToRevalidate);
      console.log(`Successfully revalidated: ${pathToRevalidate}`);
      return res.json({ revalidated: true });
    } catch (err) {
      console.error("Error during revalidation:", err);
      return res.status(500).send("Error revalidating");
    }
  }
  