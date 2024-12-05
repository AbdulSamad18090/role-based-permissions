// app/(routes)/page1-copy/page.jsx

import React from "react";
import Form from "./_components/main/page";

// Fetch function for data
async function fetchData() {
  try {
    const user = {
      userId: 1,
      username: "john_doe",
      role: 1,
    };

    // Fetch Role and its permissions
    const roleRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/role/get/${user.role}`,
      // {
      //   cache: "no-store",
      // }
    );
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

      return filteredPageDetails;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

// Use generateStaticParams to generate dynamic routes
export async function generateStaticParams() {
  // If the page has dynamic parameters, you would return an array of dynamic params
  // For example, if the page needs to be generated for specific roles or ids, you can specify those here.
  return [
    { pageId: "page1-copy" }, // This will trigger the ISR for this specific page
  ];
}

const PageCopy = async () => {
  const formData = await fetchData(); // Fetch the data on the server side

  if (!formData) {
    return <div>Error loading data</div>;
  }

  return (
    <>
      {/* Pass formData as a prop to the Form component */}
      <Form formData={formData} />
    </>
  );
};

export default PageCopy;
