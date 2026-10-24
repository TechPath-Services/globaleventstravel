"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui.store";
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Tags,
  Image,
  Mountain,
  Compass,
  LayoutTemplate,
  Settings,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  MessagesSquare,
  Mail,
  Inbox,
  Users,
  Megaphone,
  MapPinned,
  SlidersHorizontal,
} from "lucide-react";

interface NavigationItem {
  name: string;
  href?: string;
  icon: any;
  children?: NavigationItem[];
}

interface NavigationSection {
  label?: string;
  items: NavigationItem[];
}

// Navigation organized into logical sections
const navigationSections: NavigationSection[] = [
  {
    // No label for the top section
    items: [
      {
        name: "Overview",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        name: "Treks",
        href: "/dashboard/treks",
        icon: Mountain,
      },
      {
        name: "Expeditions",
        href: "/dashboard/expeditions",
        icon: Compass,
      },
    ],
  },
  {
    label: "Inquiries",
    items: [
      {
        name: "Leads",
        href: "/dashboard/leads",
        icon: Users,
      },
      {
        name: "Contact Messages",
        href: "/dashboard/contacts",
        icon: Mail,
      },
      {
        name: "Email Logs",
        href: "/dashboard/email-logs",
        icon: Inbox,
      },
    ],
  },
  {
    label: "Marketing",
    items: [
      {
        name: "Growth Tools",
        icon: Megaphone,
        children: [
          {
            name: "Departure Cities",
            href: "/dashboard/marketing/cities",
            icon: MapPinned,
          },
          {
            name: "Tool Settings",
            href: "/dashboard/marketing/settings",
            icon: SlidersHorizontal,
          },
        ],
      },
    ],
  },
  {
    label: "Content",
    items: [
      {
        name: "Blog",
        icon: FileText,
        children: [
          {
            name: "Posts",
            href: "/dashboard/blog",
            icon: FileText,
          },
          {
            name: "Categories",
            href: "/dashboard/blog/categories",
            icon: FolderTree,
          },
          {
            name: "Tags",
            href: "/dashboard/blog/tags",
            icon: Tags,
          },
          {
            name: "Authors",
            href: "/dashboard/blog/authors",
            icon: Users,
          },
        ],
      },
      {
        name: "Site Content",
        href: "/dashboard/content",
        icon: LayoutTemplate,
      },
      {
        name: "Media",
        href: "/dashboard/media",
        icon: Image,
      },
    ],
  },
];

// Find parent items that have children
const getParentItemNames = (sections: NavigationSection[]): string[] => {
  const parents: string[] = [];
  sections.forEach((section) => {
    section.items.forEach((item) => {
      if (item.children && item.children.length > 0) {
        parents.push(item.name);
      }
    });
  });
  return parents;
};

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  
  // Get parent items that have children
  const parentNames = useMemo(() => getParentItemNames(navigationSections), []);
  
  // Initialize expanded items - only include actual parent items
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => new Set(parentNames));

  // Helper function to check if an item or any of its children match the current path
  const isActive = (item: NavigationItem): boolean => {
    if (item.href) {
      // Exact match for dashboard overview
      if (item.href === "/dashboard") {
        return pathname === "/dashboard";
      }
      // For other items, check if pathname starts with the href
      // This handles nested routes like /dashboard/blog/[id]
      return pathname === item.href || pathname.startsWith(item.href + "/");
    }
    // For parent items without href, check if any child is active
    return item.children?.some(child => isActive(child)) || false;
  };

  // Auto-expand parents when their children are active
  useEffect(() => {
    const newExpanded = new Set(expandedItems);
    let hasChanges = false;

    navigationSections.forEach((section) => {
      section.items.forEach((item) => {
        if (item.children && item.children.some((child) => isActive(child))) {
          if (!newExpanded.has(item.name)) {
            newExpanded.add(item.name);
            hasChanges = true;
          }
        }
      });
    });

    if (hasChanges) {
      setExpandedItems(newExpanded);
    }
  }, [pathname]);

  const toggleExpanded = (itemName: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemName)) {
      newExpanded.delete(itemName);
    } else {
      newExpanded.add(itemName);
    }
    setExpandedItems(newExpanded);
  };

  // Close sidebar on mobile when clicking a link
  const handleMobileNavClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const active = isActive(item);
    const expanded = expandedItems.has(item.name);
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      // Parent item with children
      return (
        <li key={item.name}>
          <div>
            <button
              onClick={() => toggleExpanded(item.name)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary-600/20 text-primary-400"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white",
                level > 0 && "ml-4"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && (
                <>
                  <span className="flex-1 text-left">{item.name}</span>
                  {expanded ? (
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 flex-shrink-0" />
                  )}
                </>
              )}
            </button>
            {sidebarOpen && expanded && (
              <ul className="mt-1 space-y-1 pl-6">
                {item.children!.map((child) => renderNavigationItem(child, level + 1))}
              </ul>
            )}
          </div>
        </li>
      );
    } else {
      // Leaf item
      return (
        <li key={item.name}>
          <Link
            href={item.href!}
            onClick={handleMobileNavClick}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary-600 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white",
              level > 0 && "ml-4"
            )}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span>{item.name}</span>}
          </Link>
        </li>
      );
    }
  };

  const renderSection = (section: NavigationSection, index: number) => (
    <div key={index} className={cn(index > 0 && "mt-6")}>
      {section.label && sidebarOpen && (
        <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
          {section.label}
        </h3>
      )}
      {index > 0 && !sidebarOpen && (
        <div className="mb-2 mx-3 border-t border-gray-800" />
      )}
      <ul className="space-y-1">
        {section.items.map((item) => renderNavigationItem(item))}
      </ul>
    </div>
  );

  return (
    <>
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-gray-900/50 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
      
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-gray-900 transition-all duration-300",
          // Mobile: slide in/out from left
          "max-lg:translate-x-0 max-lg:w-64",
          !sidebarOpen && "max-lg:-translate-x-full",
          // Desktop: collapse to icon-only mode
          "lg:translate-x-0",
          sidebarOpen ? "lg:w-64" : "lg:w-20"
        )}
      >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-gray-800 px-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
            <Mountain className="h-6 w-6 text-white" />
          </div>
          {sidebarOpen && (
            <span className="text-lg font-semibold text-white">Admin</span>
          )}
        </Link>
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
        >
          <ChevronLeft
            className={cn(
              "h-5 w-5 transition-transform",
              !sidebarOpen && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        {navigationSections.map((section, index) => renderSection(section, index))}
      </nav>

      {/* Settings at bottom */}
      <div className="absolute bottom-4 left-0 right-0 px-3">
        <Link
          href="/dashboard/settings"
          onClick={handleMobileNavClick}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-white",
            pathname.startsWith("/dashboard/settings") && "bg-primary-600 text-white"
          )}
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          {sidebarOpen && <span>Settings</span>}
        </Link>
      </div>
    </aside>
    </>
  );
}


