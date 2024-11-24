"use client";

import React, { useEffect, useState } from "react";

const Form = () => {
  const [formData, setFormData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const user = {
    userId: 1,
    username: "john_doe",
    role: 1,
  };

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch Role and its permissions
        const roleRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/role/get/${user.role}`, {
          cache: "no-store",
        });
        const roleData = await roleRes.json();

        // Extract pageDetails for the specific role
        const pageDetails = roleData.pageDetails;

        // Get form permissions for this role
        const formPermissions = roleData.permissions.formPermission.find(
          (form) => form.pageId === "page1"
        );

        if (formPermissions) {
          // Filter pageDetails based on permissions
          const filteredPageDetails = {
            ...pageDetails.find((page) => page.pageId === "page1"),
            tabs: pageDetails
              .find((page) => page.pageId === "page1")
              ?.tabs.map((tab) => {
                const permissionTab = formPermissions.tabs.find(
                  (t) => t.tabId === tab.tabId
                );
                return permissionTab?.view
                  ? {
                      ...tab,
                      sections: tab.sections
                        .map((section) => {
                          const permissionSection = permissionTab.sections.find(
                            (s) => s.sectionId === section.sectionId
                          );
                          return permissionSection?.view
                            ? {
                                ...section,
                                fields: section.fields.map((field) => {
                                  const permissionField =
                                    permissionSection.fields.find(
                                      (f) => f.fieldId === field.fieldId
                                    );
                                  return {
                                    ...field,
                                    permissionType:
                                      permissionField?.permissionType || [],
                                  };
                                }),
                              }
                            : null;
                        })
                        .filter(Boolean),
                    }
                  : null;
              })
              .filter(Boolean),
          };

          setFormData(filteredPageDetails);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, [user.role]);

  const renderField = (field) => {
    const isReadonly = field.permissionType.includes("Readonly");
    const isEditable = field.permissionType.includes("Edit");
    const isHidden = field.permissionType.includes("Hidden");

    if (isHidden) return null;

    switch (field.fieldElement) {
      case "textbox":
        return (
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              {field.fieldName}
            </label>
            <input
              type="text"
              name={field.fieldName}
              className="border p-2 rounded-md w-full"
              readOnly={isReadonly}
              disabled={isReadonly}
            />
          </div>
        );
      case "radio":
        return (
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              {field.fieldName}
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={field.fieldName}
                  value="Yes"
                  readOnly={isReadonly}
                  disabled={isReadonly}
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={field.fieldName}
                  value="No"
                  readOnly={isReadonly}
                  disabled={isReadonly}
                />
                <span>No</span>
              </label>
            </div>
          </div>
        );
      case "calendar":
        return (
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              {field.fieldName}
            </label>
            <input
              type="date"
              name={field.fieldName}
              className="border p-2 rounded-md w-full"
              readOnly={isReadonly}
              disabled={isReadonly}
            />
          </div>
        );
      case "browse":
        return (
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              {field.fieldName}
            </label>
            <input
              type="file"
              name={field.fieldName}
              className="border p-2 rounded-md w-full"
              disabled={!isEditable}
            />
          </div>
        );
      default:
        return null;
    }
  };

  if (!formData) return <div>Loading...</div>;

  return (
    <div className="w-full h-screen overflow-y-auto bg-white rounded-lg shadow-md">
      <div className="sticky top-0 bg-white px-6 pt-6">
        <h1 className="text-2xl font-bold text-center mb-6">
          {formData.pageName}
        </h1>
        <div className="flex space-x-4 border-b mb-6">
          {formData.tabs.map((tab, index) => (
            <button
              key={tab.tabId}
              className={`py-2 px-4 font-medium ${
                activeTab === index
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600"
              }`}
              onClick={() => setActiveTab(index)}
            >
              {tab.tabName}
            </button>
          ))}
        </div>
      </div>
      <div className="px-6">
        {formData.tabs[activeTab]?.sections.map((section) => (
          <div
            key={section.sectionId}
            className="mb-6 border p-4 bg-neutral-50 rounded-lg shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-700">
              {section.sectionName}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {section.sectionDescription}
            </p>
            <div className="space-y-4">
              {section.fields.map((field) => renderField(field))}
            </div>
          </div>
        ))}
      </div>
      <button className="mx-6 mb-6 bg-blue-600 text-white py-2 px-4 rounded-md">
        Submit
      </button>
    </div>
  );
};

export default Form;
