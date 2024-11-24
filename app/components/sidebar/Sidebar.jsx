"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

const Sidebar = ({ user }) => {
  const [menuDetails, setMenuDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [collapsedMenus, setCollapsedMenus] = useState({}); // State for collapsed/expanded menus

  useEffect(() => {
    async function fetchRoleData() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/role/get/${user.role}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API Error: ${response.status} ${errorText}`);
        }

        const roleData = await response.json();

        if (Array.isArray(roleData?.menuDetails)) {
          setMenuDetails(roleData.menuDetails);
        } else {
          throw new Error("menuDetails is not an array");
        }
      } catch (error) {
        console.error("Error fetching role data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRoleData();
  }, [user]);

  // Toggle menu visibility
  const toggleMenu = (menuId) => {
    setCollapsedMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  // Render submenus recursively, sorted by "id"
  const renderSubmenus = (submenus, parentId) => {
    if (!submenus) return null;

    return (
      <ul
        className={`ml-4 mt-2 space-y-2 ${
          collapsedMenus[parentId] ? "hidden" : "block"
        }`}
      >
        {submenus
          .sort((a, b) => a.id.localeCompare(b.id)) // Sort submenus by "id"
          .map((submenu) => (
            <li key={submenu.id}>
              <div className="flex items-center justify-between">
                <Link
                  href={submenu.path || "#"}
                  className="text-gray-400 hover:text-white hover:bg-gray-700 px-2 py-1 rounded-md flex-grow"
                >
                  {submenu.name}
                </Link>
                {submenu.submenus && submenu.submenus.length > 0 && (
                  <button
                    onClick={() => toggleMenu(submenu.id)}
                    className="text-gray-500 hover:text-white text-xl focus:outline-none ml-2"
                  >
                    {collapsedMenus[submenu.id] ? "+" : "-"}
                  </button>
                )}
              </div>
              {/* Recursive rendering for nested submenus */}
              {renderSubmenus(submenu.submenus, submenu.id)}
            </li>
          ))}
      </ul>
    );
  };

  if (isLoading) {
    return (
      <div className="sidebar bg-gradient-to-b from-gray-800 to-gray-900 text-white w-72 min-h-screen flex items-center justify-center">
        <div className="loader border-4 border-t-blue-500 border-gray-300 rounded-full w-8 h-8 animate-spin"></div>
      </div>
    );
  }

  // Sort top-level menus by "menuId"
  const sortedMenus = menuDetails.sort((a, b) => a.menuId - b.menuId);

  return (
    <div className="sidebar bg-gradient-to-b from-gray-800 to-gray-900 text-white w-72 h-screen flex flex-col p-4">
      {/* Sidebar Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-blue-400">MyApp</h2>
        <p className="text-sm text-gray-400">User Dashboard</p>
      </div>

      {/* Menu Items */}
      <div className="flex-grow overflow-y-auto">
        <ul className="space-y-4">
          {sortedMenus.map((menu) => (
            <li key={menu.menuId}>
              <div className="flex items-center justify-between">
                <Link
                  href={menu.path || "#"}
                  className="block text-lg font-medium text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md flex-grow"
                >
                  {menu.name}
                </Link>
                {menu.submenus && menu.submenus.length > 0 && (
                  <button
                    onClick={() => toggleMenu(menu.menuId)}
                    className="text-gray-500 hover:text-white text-2xl focus:outline-none ml-2"
                  >
                    {collapsedMenus[menu.menuId] ? "+" : "-"}
                  </button>
                )}
              </div>
              {/* Render submenus */}
              {renderSubmenus(menu.submenus, menu.menuId)}
            </li>
          ))}
        </ul>
      </div>

      {/* Sidebar Footer */}
      <div className="mt-6 border-t border-gray-700 pt-4">
        <p className="text-sm text-gray-500">Logged in as</p>
        <p className="font-medium text-white">{user.username}</p>
      </div>
    </div>
  );
};

export default Sidebar;
