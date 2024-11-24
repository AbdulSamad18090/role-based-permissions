let clients = []; // Store connected clients for SSE

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { operationType, fullDocument, documentKey, updateDescription } =
      req.body;

    console.log("Trigger event received:", req.body);

    // Handle the change event
    switch (operationType) {
      case "insert":
        console.log("New document inserted:", fullDocument);
        break;
      case "update":
        console.log(
          "Document updated:",
          documentKey,
          updateDescription.updatedFields
        );
        break;
      case "delete":
        console.log("Document deleted:", documentKey);
        break;
      default:
        console.log("Unhandled operation type:", operationType);
    }

    // Notify all connected clients
    clients.forEach((client) =>
      client.res.write(
        `data: ${JSON.stringify({ reload: true, operationType })}\n\n`
      )
    );

    res.status(200).json({ message: "Event processed successfully" });
  } else if (req.method === "GET") {
    // Handle SSE connections
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Keep the connection open
    res.write("retry: 10000\n\n");

    // Add the client to the list
    const clientId = Date.now();
    clients.push({ id: clientId, res });

    // Remove the client on connection close
    req.on("close", () => {
      clients = clients.filter((client) => client.id !== clientId);
    });
  } else {
    res.setHeader("Allow", ["POST", "GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
