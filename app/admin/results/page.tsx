'use client';

import Link from 'next/link';

export default function AdminResultsPage() {
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
              Evaluation Results
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-600">Total Evaluations</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-600">Translation Revisions</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-600">Safety Annotations</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent Evaluations</h2>
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              Export Results
            </button>
          </div>

          <div className="p-6">
            <p className="text-gray-600 text-center py-8">
              No evaluations yet. Results will appear here as users complete their assignments.
            </p>
          </div>
        </div>

        {/* Inter-Annotator Agreement Section */}
        <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Inter-Annotator Agreement Analysis
            </h2>
          </div>

          <div className="p-6">
            <p className="text-gray-600 mb-4">
              Calculate inter-annotator agreement metrics once multiple annotators have evaluated the same prompts.
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Krippendorff's Alpha calculation</li>
              <li>• Per-prompt agreement scores</li>
              <li>• Annotator consistency metrics</li>
              <li>• Category-specific agreement analysis</li>
            </ul>
            <button 
              disabled 
              className="mt-4 px-4 py-2 bg-gray-300 text-gray-600 rounded-md cursor-not-allowed"
            >
              Calculate Metrics (requires data)
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
