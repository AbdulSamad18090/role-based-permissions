"use client";
import React, { useState, useEffect } from "react";
import Menu from "../../json-data/Menu.json"; // Import Menu.json
import Roles from "../../json-data/Roles.json"; // Import Roles.json
import Link from "next/link";

const Sidebar = ({ user }) => {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Find the role for the current user
    const role = Roles.find((role) => role.roleId === parseInt(user.role));
    setUserRole(role);
  }, [user]);

  // Check if the user has permission for a specific menu or submenu based on role
  const getMenuPermissions = (menuId) => {
    if (userRole) {
      // Check if the menuId is included in the user's menu permissions
      return userRole.permissions.menuPermission.some((menu) =>
        menu.includes(menuId)
      );
    }
    return false;
  };

  // Function to render the submenus recursively and ensure they are sorted
  const renderSubmenus = (submenus) => {
    if (!submenus) return null;

    // Sort the submenus by their id
    return (
      <ul className="space-y-2 ml-4">
        {submenus
          .sort((a, b) => a.id.localeCompare(b.id)) // Sort submenus by id
          .map(
            (submenu) =>
              // Check if the user has permission to view this submenu
              getMenuPermissions(submenu.id) && (
                <li key={submenu.id}>
                  <a
                    href={submenu.path}
                    className="text-gray-300 hover:text-white hover:underline"
                  >
                    {submenu.name}
                  </a>
                  {/* If the submenu has nested submenus, render them recursively */}
                  {renderSubmenus(submenu.submenus)}
                </li>
              )
          )}
      </ul>
    );
  };

  // Sort menus by their menuId
  const sortedMenus = Menu.sort((a, b) => a.menuId - b.menuId);

  return (
    <div className="sidebar bg-gray-800 text-white w-72 min-h-screen p-4">
      <h2 className="text-xl font-bold mb-6">Sidebar</h2>
      <ul className="space-y-4">
        {sortedMenus.map(
          (menu) =>
            // Check if the user has permission to view this menu
            getMenuPermissions(menu.menuId.toString()) && (
              <li key={menu.menuId}>
                <Link
                  href={`${menu?.path ? menu.path : ""}`}
                  className="font-semibold text-lg"
                >
                  {menu.name}
                </Link>
                {/* Render submenus if present */}
                {renderSubmenus(menu.submenus)}
              </li>
            )
        )}
      </ul>
    </div>
  );
};

export default Sidebar;
