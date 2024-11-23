import dbConnect from "@/lib/connectdb/connection";
import Menu from "@/lib/models/Menu";

export async function POST(req) {
  try {
    // Connect to MongoDB
    await dbConnect();

    // Parse the request body
    const body = await req.json();

    // Validate that the body contains required fields
    if (!body.menuId || !body.name || !Array.isArray(body.submenus)) {
      return new Response(
        JSON.stringify({ message: "Invalid input format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create a new menu document in the database
    const newMenu = await Menu.create(body);

    // Respond with the created menu
    return new Response(JSON.stringify(newMenu), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle errors
    console.error("Error creating menu:", error);

    return new Response(
      JSON.stringify({ message: "Failed to create menu", error }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
