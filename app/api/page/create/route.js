import dbConnect from "@/lib/connectdb/connection";
import Page from "@/lib/models/Page";

export async function POST(req) {
  try {
    // Connect to MongoDB
    await dbConnect();

    // Parse the request body
    const body = await req.json();

    // Validate the required fields
    if (!body.pageId || !body.pageName || !Array.isArray(body.tabs)) {
      return new Response(
        JSON.stringify({ message: "Invalid input format" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create a new page document in the database
    const newPage = await Page.create(body);

    // Respond with the created page
    return new Response(JSON.stringify(newPage), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle errors
    console.error("Error creating page:", error);

    return new Response(
      JSON.stringify({ message: "Failed to create page", error }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
