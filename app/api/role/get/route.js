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
                    { $in: ["$menuId", "$$menuPermissions"] }, // Match top-level Menu.menuId
                    {
                      $gt: [
                        {
                          $size: {
                            $filter: {
                              input: "$submenus",
                              as: "submenu",
                              cond: {
                                $or: [
                                  { $in: ["$$submenu.id", "$$menuPermissions"] }, // Match submenu.id
                                  {
                                    $gt: [
                                      {
                                        $size: {
                                          $filter: {
                                            input: "$$submenu.submenus",
                                            as: "subsubmenu",
                                            cond: { $in: ["$$subsubmenu.id", "$$menuPermissions"] }, // Match subsubmenu.id
                                          },
                                        },
                                      },
                                      0,
                                    ],
                                  },
                                ],
                              },
                            },
                          },
                        },
                        0,
                      ],
                    }, // Check if any nested submenus match
                  ],
                },
              },
            },
            // Step 2: Filter submenus and sub-submenus
            {
              $addFields: {
                submenus: {
                  $map: {
                    input: {
                      $filter: {
                        input: "$submenus",
                        as: "submenu",
                        cond: {
                          $or: [
                            { $in: ["$$submenu.id", "$$menuPermissions"] },
                            {
                              $gt: [
                                {
                                  $size: {
                                    $filter: {
                                      input: "$$submenu.submenus",
                                      as: "subsubmenu",
                                      cond: { $in: ["$$subsubmenu.id", "$$menuPermissions"] },
                                    },
                                  },
                                },
                                0,
                              ],
                            },
                          ],
                        },
                      },
                    },
                    as: "filteredSubmenu",
                    in: {
                      id: "$$filteredSubmenu.id",
                      name: "$$filteredSubmenu.name",
                      path: "$$filteredSubmenu.path",
                      submenus: {
                        $map: {
                          input: {
                            $filter: {
                              input: "$$filteredSubmenu.submenus",
                              as: "subsubmenu",
                              cond: { $in: ["$$subsubmenu.id", "$$menuPermissions"] },
                            },
                          },
                          as: "filteredSubsubmenu",
                          in: {
                            id: "$$filteredSubsubmenu.id",
                            name: "$$filteredSubsubmenu.name",
                            path: "$$filteredSubsubmenu.path",
                          },
                        },
                      },
                    },
                  },
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
      // Step 3: Project fields to include all permissions and joined details
      {
        $project: {
          _id: 1,
          roleId: 1,
          role: 1,
          "permissions.menuPermission": 1,
          "permissions.formPermission": 1,
          "permissions.reportPermission": 1, // Include reportPermission
          "permissions.workflowPermission": 1, // Include workflowPermission
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
