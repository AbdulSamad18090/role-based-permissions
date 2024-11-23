import dbConnect from "@/lib/connectdb/connection";
import Role from "@/lib/models/Role";

export async function GET(req) {
  try {
    // Connect to MongoDB
    await dbConnect();

    // Perform aggregation to join Role, Menu, and Page collections
    const rolesWithDetails = await Role.aggregate([
      // Step 1: Lookup Menu documents
      {
        $lookup: {
          from: "menus", // Menu collection name in MongoDB
          let: { menuPermissions: "$permissions.menuPermission" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $in: ["$menuId", "$$menuPermissions"] }, // Match Menu.menuId
                    {
                      $in: [
                        "$$menuPermissions",
                        { $map: { input: "$submenus", as: "submenu", in: "$$submenu.id" } },
                      ],
                    }, // Match Menu.submenus.id
                  ],
                },
              },
            },
          ],
          as: "menuDetails", // Output array
        },
      },
      // Step 2: Lookup Page documents
      {
        $lookup: {
          from: "pages", // Page collection name in MongoDB
          localField: "permissions.formPermission.pageId", // Field in Role
          foreignField: "pageId", // Field in Page
          as: "pageDetails", // Output array
        },
      },
      // Step 3: Optionally project fields to return only relevant data
      {
        $project: {
          _id: 1,
          roleId: 1,
          role: 1,
          "permissions.menuPermission": 1,
          "permissions.formPermission": 1,
          menuDetails: 1,
          pageDetails: 1,
        },
      },
    ]);

    // Respond with the aggregated result
    return new Response(JSON.stringify(rolesWithDetails), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle errors
    console.error("Error fetching roles with details:", error);

    return new Response(
      JSON.stringify({ message: "Failed to fetch roles", error }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
