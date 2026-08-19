'use client';

import { useState, useEffect } from 'react';
import { dummyPrompts } from '@/lib/dummy-data';
import { Prompt, TaskType } from '@/types/database';
import LogoutButton from '@/app/components/LogoutButton';

export default function AnnotatePage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [safetyLabel, setSafetyLabel] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Load prompts (for now using dummy data)
    setPrompts(dummyPrompts);
  }, []);

  const currentPrompt = prompts[currentIndex];

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      resetForm();
    }
  };

  const handleNext = () => {
    if (currentIndex < prompts.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetForm();
    }
  };

  const resetForm = () => {
    setSafetyLabel(null);
  };

  const getSafetyOptions = (taskType: TaskType) => {
    switch (taskType) {
      case 'NLU':
        return ['Safe', 'Unsafe'];
      case 'NLR':
        return ['Does not Violate Policy', 'Violates Policy'];
      case 'NLG':
        return ['Answer', 'Refuse'];
      default:
        return [];
    }
  };

  const handleSubmit = async () => {
    if (!safetyLabel) {
      alert('Please select a classification');
      return;
    }

    setSubmitting(true);

    try {
      // TODO: Submit to Supabase
      console.log('Submitting annotation:', {
        promptId: currentPrompt.id,
        safetyLabel
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Move to next prompt or finish
      if (currentIndex < prompts.length - 1) {
        handleNext();
      } else {
        alert('All prompts completed!');
      }
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentPrompt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <p>Loading prompts...</p>
      </div>
    );
  }

  const safetyOptions = getSafetyOptions(currentPrompt.task_type);

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex overflow-hidden">
      {/* Top-right Logout Button */}
      <div className="fixed top-4 right-4 z-50">
        <LogoutButton />
      </div>

      {/* Left Sidebar - Prompt Numbers */}
      <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 overflow-y-auto flex-shrink-0">
        {prompts.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentIndex(index);
              resetForm();
            }}
            className={`w-12 h-12 flex items-center justify-center mb-2 rounded-lg transition-colors ${
              index === currentIndex
                ? 'bg-blue-500 text-white font-bold'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-center p-8 min-h-full">
        <div className="w-full max-w-5xl">
          {/* Navigation Arrows */}
          <div className="flex justify-between mb-4">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === prompts.length - 1}
              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Quiz Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            {/* Context Section */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Context:</h3>
              <div className="space-y-3 text-sm text-gray-800">
                <p>
                  <strong>The nature of the interaction:</strong>{' '}
                  {currentPrompt.context.sender.nature_of_the_interaction}
                </p>
                <p>
                  <strong>The platform type:</strong>{' '}
                  {currentPrompt.context.sender.platform_type}
                </p>
                <p>
                  <strong>The user type:</strong>{' '}
                  {currentPrompt.context.recipient.type}
                </p>
                <p>
                  <strong>The background of the recipient:</strong>{' '}
                  {currentPrompt.context.recipient.background}
                </p>
                <p>
                  <strong>Purpose of the Chatbot:</strong>{' '}
                  {currentPrompt.context.transmission_principle.sender_purpose}
                </p>
                <p>
                  <strong>Confidentiality of the conversation:</strong>{' '}
                  {currentPrompt.context.transmission_principle.confidentiality}
                </p>
              </div>
            </div>

            {/* English and Filipino Side by Side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">English:</h3>
                <p className="text-gray-800 leading-relaxed">{currentPrompt.english_text}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Filipino:</h3>
                <p className="text-gray-800 leading-relaxed">{currentPrompt.filipino_text}</p>
              </div>
            </div>

            {/* Classification Question */}
            <div className="pt-4">
              <h3 className="text-lg font-bold text-red-600 mb-4">
                Classify the Prompt
              </h3>
              
              <div className="flex gap-4 mb-6">
                {safetyOptions.map((option) => (
                  <label key={option} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="safety"
                      checked={safetyLabel === option}
                      onChange={() => setSafetyLabel(option)}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="ml-2 text-gray-900 font-medium">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSubmit}
                disabled={submitting || !safetyLabel}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
