// File: pages/api/webhook/role-update.js
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

  res.status(200).json({ message: "Event processed successfully" });
}
