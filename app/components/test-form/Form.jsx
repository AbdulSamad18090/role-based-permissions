"use client";
import React, { useEffect, useState } from "react";
import PagePermissions from "../../json-data/RFIForm.json"; // Import the JSON file

const Form = () => {
  const [formData, setFormData] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // State to manage active tab

  useEffect(() => {
    setFormData(PagePermissions);
  }, []);

  const renderField = (field) => {
    const isReadonly = field.permissionType.includes("Readonly");
    const isEditable = field.permissionType.includes("Edit");

    switch (field.fieldElement) {
      case "textbox":
        return (
          <input
            type="text"
            name={field.fieldName}
            className="border p-2 rounded-md w-full bg-transparent"
            readOnly={isReadonly} // Set readOnly based on permissionType
            disabled={isReadonly} // Disable field if readonly
          />
        );
      case "radio":
        return (
          <div className="flex items-center space-x-4">
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
        );
      case "calendar":
        return (
          <input
            type="date"
            name={field.fieldName}
            className="border p-2 rounded-md w-full"
            readOnly={isReadonly}
            disabled={isReadonly}
          />
        );
      case "browse":
        return (
          <input
            type="file"
            name={field.fieldName}
            className="border p-2 rounded-md w-full"
            disabled={!isEditable} // Disable file input if not editable
          />
        );
      default:
        return null;
    }
  };

  if (!formData) {
    return <div>Loading...</div>; // Show a loading state while data is being fetched
  }

  return (
    <div className="w-full h-screen overflow-y-auto mx-auto bg-white shadow-lg rounded-md">
      <div className="sticky top-0 z-10 bg-white pt-6">
        <h1 className="text-2xl font-bold text-center mb-6">
          {formData.pageName}
        </h1>
        <p className="text-center mb-6 text-gray-600">
          {formData.pageDescription}
        </p>

        {/* Tab navigation */}
        <div className="flex space-x-4 mb-6 border-b">
          {formData.tabs.map((tab, index) => (
            <button
              key={tab.tabId}
              className={`py-2 px-4 text-lg font-medium ${
                activeTab === index
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600"
              } hover:text-blue-600`}
              onClick={() => setActiveTab(index)} // Set active tab on click
            >
              {tab.tabName}
            </button>
          ))}
        </div>
      </div>

      {/* Render active tab's sections and fields */}
      <div className="px-6">
        {formData.tabs[activeTab].sections.map((section) => (
          <div
            key={section.sectionId}
            className="mb-6 border p-4 rounded-lg shadow-md bg-neutral-50"
          >
            <h3 className="text-lg font-semibold text-gray-700">
              {section.sectionName}
            </h3>
            <p className="text-gray-500 mb-4">{section.sectionDescription}</p>
            <div className="space-y-4">
              {section.fields.map((field) => (
                <div key={field.fieldId} className="flex flex-col space-y-2">
                  <label className="font-medium text-gray-700">
                    {field.fieldName}
                  </label>
                  {renderField(field)}{" "}
                  {/* Render each field based on its type */}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Form;
