import dbConnect from "@/lib/connectdb/connection";
import Role from "@/lib/models/Role";

export async function GET(req, { params }) {
  try {
    // Connect to MongoDB
    await dbConnect();

    const { roleId } = params;

    const roleWithDetails = await Role.aggregate([
      // Step 1: Match the specific role
      { $match: { roleId: Number(roleId) } },

      // Step 2: Lookup and filter menus
      {
        $lookup: {
          from: "menus", // Menu collection name
          let: { menuPermissions: "$permissions.menuPermission" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $in: ["$menuId", "$$menuPermissions"] }, // Include if menuId matches
                    {
                      $gt: [
                        {
                          $size: {
                            $filter: {
                              input: "$submenus",
                              as: "submenu",
                              cond: {
                                $or: [
                                  { $in: ["$$submenu.id", "$$menuPermissions"] }, // Include if submenu.id matches
                                  {
                                    $gt: [
                                      {
                                        $size: {
                                          $filter: {
                                            input: "$$submenu.submenus",
                                            as: "subsubmenu",
                                            cond: {
                                              $in: ["$$subsubmenu.id", "$$menuPermissions"],
                                            },
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
                    }, // Include if nested submenus match
                  ],
                },
              },
            },
            // Filter submenus and sub-submenus recursively
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
          as: "menuDetails",
        },
      },

      // Step 3: Lookup Page documents
      {
        $lookup: {
          from: "pages", // Page collection name
          localField: "permissions.formPermission.pageId", // Field in Role
          foreignField: "pageId", // Field in Page
          as: "pageDetails", // Output array
        },
      },

      // Step 4: Project relevant fields
      {
        $project: {
          _id: 1,
          roleId: 1,
          role: 1,
          "permissions.menuPermission": 1,
          "permissions.formPermission": 1,
          "permissions.reportPermission": 1,
          "permissions.workflowPermission": 1,
          menuDetails: 1,
          pageDetails: 1,
        },
      },
    ]);

    // If no role found, return 404
    if (!roleWithDetails || roleWithDetails.length === 0) {
      return new Response(JSON.stringify({ message: "Role not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Respond with the specific role details
    return new Response(JSON.stringify(roleWithDetails[0]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle errors
    console.error("Error fetching role:", error);

    return new Response(
      JSON.stringify({ message: "Failed to fetch role", error }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
