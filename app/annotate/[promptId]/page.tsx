'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { dummyPrompts } from '@/lib/dummy-data';
import { Prompt, TaskType } from '@/types/database';

export default function AnnotatePromptPage() {
  const router = useRouter();
  const params = useParams();
  const promptId = params.promptId as string;

  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [safetyLabel, setSafetyLabel] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Find the prompt (for now using dummy data)
    const foundPrompt = dummyPrompts.find(p => p.id === promptId);
    setPrompt(foundPrompt || null);
  }, [promptId]);

  const getSafetyOptions = (taskType: TaskType) => {
    switch (taskType) {
      case 'NLU':
        return [
          { value: 'Safe', label: 'Safe', color: 'green' },
          { value: 'Unsafe', label: 'Unsafe', color: 'red' }
        ];
      case 'NLR':
        return [
          { value: 'Does not Violate Policy', label: 'Does not Violate Policy', color: 'green' },
          { value: 'Violates Policy', label: 'Violates Policy', color: 'red' }
        ];
      case 'NLG':
        return [
          { value: 'Answer', label: 'Answer', color: 'green' },
          { value: 'Refuse', label: 'Refuse', color: 'red' }
        ];
      default:
        return [];
    }
  };

  const handleSubmit = async () => {
    if (!safetyLabel) {
      alert('Please select a safety classification');
      return;
    }

    setSubmitting(true);

    try {
      // TODO: Submit to Supabase
      console.log('Submitting annotation:', {
        promptId,
        safetyLabel
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Navigate back to annotate page
      router.push('/annotate');
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!prompt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading prompt...</p>
      </div>
    );
  }

  const safetyOptions = getSafetyOptions(prompt.task_type);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Contextual Safety Evaluation
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Task Type Banner */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-purple-900">
                Task Type: {prompt.task_type}
              </p>
            </div>

            {/* Full Context */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">Context Details</h3>
              <div className="space-y-3 text-sm text-blue-800">
                <div>
                  <p className="font-medium">Sender</p>
                  <p className="mt-1">• Nature: {prompt.context.sender.nature_of_the_interaction}</p>
                  <p>• Platform: {prompt.context.sender.platform_type}</p>
                </div>
                <div>
                  <p className="font-medium">Recipient</p>
                  <p className="mt-1">• Type: {prompt.context.recipient.type}</p>
                  <p>• Background: {prompt.context.recipient.background}</p>
                </div>
                <div>
                  <p className="font-medium">Transmission Principles</p>
                  <p className="mt-1">• Purpose: {prompt.context.transmission_principle.sender_purpose}</p>
                  <p>• Confidentiality: {prompt.context.transmission_principle.confidentiality}</p>
                  <p>• Accountability: {prompt.context.transmission_principle.source_accountability}</p>
                </div>
              </div>
            </div>

            {/* English Text */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                English
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-900">{prompt.english_text}</p>
              </div>
            </div>

            {/* Filipino Text */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Filipino
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-900">{prompt.filipino_text}</p>
              </div>
            </div>

            {/* Safety Classification */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Given the context above, classify this prompt:
              </h3>
              
              <div className="space-y-3">
                {safetyOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSafetyLabel(option.value)}
                    className={`w-full py-4 px-4 border-2 rounded-lg text-left transition-all ${
                      safetyLabel === option.value
                        ? option.color === 'green'
                          ? 'border-green-500 bg-green-50 text-green-900'
                          : 'border-red-500 bg-red-50 text-red-900'
                        : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                    }`}
                  >
                    <span className="font-medium text-lg">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                onClick={handleSubmit}
                disabled={submitting || !safetyLabel}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Classification'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
