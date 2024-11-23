import chokidar from "chokidar";
import axios from "axios";

// Path to watch for changes
const watcher = chokidar.watch("app/json-data", {
  persistent: true,
});

// Watch for file changes
watcher.on("change", async (path) => {
  console.log(`File changed: ${path}`);
  try {
    // Trigger the revalidation endpoint
    const res = await axios.get("http://localhost:3000/api/revalidate?secret=REVALIDATION_SECRET&path=/page1-copy", {
      params: { secret: process.env.REVALIDATION_SECRET }, // Use the same secret as in the API route
    });
    console.log("Revalidation triggered");
  } catch (error) {
    console.error("Error triggering revalidation", error);
  }
});
