let clients = []; // Store connected clients for SSE

export async function POST(req, res) {
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
}
