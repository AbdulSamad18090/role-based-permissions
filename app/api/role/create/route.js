import dbConnect from "@/lib/connectdb/connection";
import Role from "@/lib/models/Role";

export async function POST(req) {
  try {
    // Connect to MongoDB
    await dbConnect();

    // Parse the request body
    const body = await req.json();

    // Validate the required fields
    if (!body.roleId || !body.role || !body.permissions) {
      return new Response(
        JSON.stringify({ message: "Invalid input format" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create a new role document in the database
    const newRole = await Role.create(body);

    // Respond with the created role
    return new Response(JSON.stringify(newRole), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle errors
    console.error("Error creating role:", error);

    return new Response(
      JSON.stringify({ message: "Failed to create role", error }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
