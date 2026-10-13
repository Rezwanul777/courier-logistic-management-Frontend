/** biome-ignore-all lint/a11y/useSemanticElements: <explanation> */

import type { Metadata } from "next";

import Link from "next/link";
import { redirect } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Search,
  UsersRound,
} from "lucide-react";

import {
  adminUserHref,
  parseAdminUserFilters,
  type AdminUserFilters,
  type AdminUserSearchParams,
} from "@/lib/admin-user-filters";

import {
  getAdminUsers,
  type AdminUser,
  type AdminUserList,
} from "@/lib/server/admin-users";

// ---------------------------------------------
// Page configuration
// ---------------------------------------------

export const metadata: Metadata = {
  title: "User Management | CourierFlow",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<AdminUserSearchParams>;
}

// ---------------------------------------------
// Presentation helpers
// ---------------------------------------------

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unavailable";
  }

  return (
    new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeZone: "UTC",
    }).format(date)
  );
}

function UserRoleBadge({
  role,
}: {
  role: AdminUser["role"];
}) {
  const classes =
    role === "ADMIN"
      ? "bg-violet-50 text-violet-700"
      : role === "COURIER"
        ? "bg-blue-50 text-blue-700"
        : "bg-slate-100 text-slate-700";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${classes}`}
    >
      {role.charAt(0) +
        role.slice(1).toLowerCase()}
    </span>
  );
}

// ---------------------------------------------
// Server-side search and filters
// ---------------------------------------------

function UserFilters({
  filters,
}: {
  filters: AdminUserFilters;
}) {
  const inputClass =
    "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-[#102D46] outline-none focus-visible:border-[#00877B]";

  return (
    <form
      key={JSON.stringify(filters)}
      action="/admin/users"
      method="get"
      role="search"
      className="grid gap-4 border-b border-slate-100 p-5 sm:p-6 md:grid-cols-2 xl:grid-cols-4"
    >
      <div className="space-y-2 md:col-span-2">
        <label
          htmlFor="user-search"
          className="block text-xs font-semibold text-slate-500"
        >
          Search users
        </label>

        <input
          id="user-search"
          name="search"
          type="search"
          maxLength={100}
          defaultValue={filters.search}
          placeholder="Search name, email or phone..."
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="user-role"
          className="block text-xs font-semibold text-slate-500"
        >
          Role
        </label>

        <select
          id="user-role"
          name="role"
          defaultValue={filters.role}
          className={inputClass}
        >
          <option value="ALL">All roles</option>
          <option value="CUSTOMER">Customer</option>
          <option value="COURIER">Courier</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="user-status"
          className="block text-xs font-semibold text-slate-500"
        >
          Account status
        </label>

        <select
          id="user-status"
          name="status"
          defaultValue={filters.status}
          className={inputClass}
        >
          <option value="ALL">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="user-sort-by"
          className="block text-xs font-semibold text-slate-500"
        >
          Sort by
        </label>

        <select
          id="user-sort-by"
          name="sortBy"
          defaultValue={filters.sortBy}
          className={inputClass}
        >
          <option value="createdAt">Joined date</option>
          <option value="name">Name</option>
          <option value="email">Email</option>
        </select>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="user-sort-order"
          className="block text-xs font-semibold text-slate-500"
        >
          Sort direction
        </label>

        <select
          id="user-sort-order"
          name="sortOrder"
          defaultValue={filters.sortOrder}
          className={inputClass}
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>

      <div className="flex flex-wrap items-end gap-3 md:col-span-2">
        <button
          type="submit"
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#00877B] px-5 text-sm font-semibold text-white hover:bg-[#006F66]"
        >
          <Search
            aria-hidden="true"
            className="size-4"
          />
          Apply filters
        </button>

        <Link
          href="/admin/users"
          className="inline-flex h-11 items-center px-2 text-sm font-medium text-slate-500 hover:text-[#00877B] hover:underline"
        >
          Clear filters
        </Link>
      </div>
    </form>
  );
}

// ---------------------------------------------
// Users directory
// ---------------------------------------------

function UsersTable({
  users,
}: {
  users: AdminUser[];
}) {
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center px-6 py-16 text-center">
        <UsersRound
          aria-hidden="true"
          className="size-12 text-slate-400"
        />

        <h2 className="mt-4 text-lg font-semibold text-[#102D46]">
          No matching users
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Try another search, role, or account status.
        </p>

        <Link
          href="/admin/users"
          className="mt-5 text-sm font-semibold text-[#00877B] hover:underline"
        >
          Clear filters
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[870px] text-left text-sm">
        <thead className="bg-slate-50 text-xs text-slate-500">
          <tr>
            <th scope="col" className="px-6 py-4">
              User
            </th>

            <th scope="col" className="px-6 py-4">
              Role
            </th>

            <th scope="col" className="px-6 py-4">
              Status
            </th>

            <th scope="col" className="px-6 py-4">
              Email verification
            </th>

            <th scope="col" className="px-6 py-4">
              Joined
            </th>

            <th scope="col" className="px-6 py-4">
              Action
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {users.map((user) => (
            <tr
              key={user.id}
              className="hover:bg-slate-50/70"
            >
              <td className="px-6 py-5">
                <p className="font-semibold text-[#102D46]">
                  {user.name || `User #${user.id}`}
                </p>

                <p className="mt-1 break-all text-xs text-slate-500">
                  {user.email}
                </p>
              </td>

              <td className="px-6 py-5">
                <UserRoleBadge role={user.role} />
              </td>

              <td className="px-6 py-5">
                <span
                  className={
                    user.isActive
                      ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                      : "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                  }
                >
                  {user.isActive
                    ? "Active"
                    : "Inactive"}
                </span>
              </td>

              <td className="px-6 py-5">
                <span
                  className={
                    user.emailVerified
                      ? "text-emerald-700"
                      : "text-amber-700"
                  }
                >
                  {user.emailVerified
                    ? "Verified"
                    : "Not verified"}
                </span>
              </td>

              <td className="whitespace-nowrap px-6 py-5 text-slate-600">
                {formatDate(user.createdAt)}
              </td>

              <td className="px-6 py-5">
                <Link
                  href={`/admin/users/${user.id}`}
                  prefetch={false}
                  className="inline-flex items-center gap-2 whitespace-nowrap text-xs font-semibold text-[#00877B] hover:underline"
                >
                  View details
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4"
                  />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------
// Pagination
// ---------------------------------------------

function UsersPagination({
  data,
  filters,
}: {
  data: AdminUserList;
  filters: AdminUserFilters;
}) {
  const {
    page,
    limit,
    total,
    totalPages,
  } = data.pagination;

  const first =
    data.items.length > 0
      ? (page - 1) * limit + 1
      : 0;

  const last =
    data.items.length > 0
      ? first + data.items.length - 1
      : 0;

  const linkClass =
    "inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-medium text-[#102D46] hover:bg-slate-50";

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 px-6 py-5">
      <p className="text-sm text-slate-500">
        Showing {first}–{last} of {total}
      </p>

      <nav
        aria-label="Users pagination"
        className="flex items-center gap-3"
      >
        {page > 1 ? (
          <Link
            href={adminUserHref({
              ...filters,
              page: page - 1,
            })}
            prefetch={false}
            className={linkClass}
          >
            <ArrowLeft className="size-4" />
            Previous
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="text-sm text-slate-400"
          >
            Previous
          </span>
        )}

        {page < totalPages ? (
          <Link
            href={adminUserHref({
              ...filters,
              page: page + 1,
            })}
            prefetch={false}
            className={linkClass}
          >
            Next
            <ArrowRight className="size-4" />
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="text-sm text-slate-400"
          >
            Next
          </span>
        )}
      </nav>
    </div>
  );
}

// ---------------------------------------------
// Main page
// ---------------------------------------------

export default async function AdminUsersPage({
  searchParams,
}: PageProps) {
  const filters = parseAdminUserFilters(
    await searchParams,
  );

  const data = await getAdminUsers(filters);

  const lastPage = Math.max(
    1,
    data.pagination.totalPages,
  );

  if (filters.page > lastPage) {
    redirect(
      adminUserHref({
        ...filters,
        page: lastPage,
      }),
    );
  }

  return (
    <div className="space-y-7">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#00877B]">
          Admin workspace
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#102D46]">
          User management
        </h1>

        <p className="mt-3 text-sm leading-7 text-slate-600">
          Search accounts, review user details,
          and manage account access.
        </p>
      </header>

      <section
        aria-label="User directory"
        className="overflow-hidden rounded-xl border border-slate-200 bg-white"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-[#102D46]">
              User directory
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Real registered accounts
            </p>
          </div>

          <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-[#00877B]">
            {data.pagination.total} matching users
          </span>
        </div>

        <UserFilters filters={filters} />

        <UsersTable users={data.items} />

        <UsersPagination
          data={data}
          filters={filters}
        />
      </section>

      <p className="text-xs leading-6 text-slate-500">
        User roles are read-only. Account changes
        require an administrative reason and are
        recorded in the audit log.
      </p>
    </div>
  );
}
