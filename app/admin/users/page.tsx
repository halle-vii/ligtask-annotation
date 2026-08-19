'use client';

import Link from 'next/link';

export default function AdminUsersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <Link href="/admin" className="mr-4 text-gray-600 hover:text-gray-900">
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              User Management
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              + Create User
            </button>
          </div>

          <div className="p-6">
            <p className="text-gray-600 text-center py-8">
              User management coming soon. This will allow admins to:
            </p>
            <ul className="text-gray-600 space-y-2 max-w-md mx-auto">
              <li>• Create new user accounts</li>
              <li>• Assign roles (Admin, Translator, Annotator)</li>
              <li>• Edit user information</li>
              <li>• Activate/deactivate accounts</li>
              <li>• View user activity and progress</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
