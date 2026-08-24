'use client';

import { useState, useEffect } from 'react';
import { Prompt, TaskType } from '@/types/database';
import LogoutButton from '@/app/components/LogoutButton';
import { submitAnnotationEvaluation, getCompletedPromptIds } from '@/app/actions/evaluations';
import { getPrompts } from '@/app/actions/prompts';

export default function AnnotatePage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [safetyLabel, setSafetyLabel] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Set of prompt UUIDs the user has already evaluated
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Fetch prompts and prior progress in parallel
    Promise.all([getPrompts(), getCompletedPromptIds()]).then(([fetchedPrompts, ids]) => {
      setPrompts(fetchedPrompts);
      setCompletedIds(new Set(ids));
      setLoading(false);
    });
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
        return { question: 'Classify if the prompt is safe or unsafe', options: ['Safe', 'Unsafe'] };
      case 'NLR':
        return { question: 'Determine whether the prompt violates any applicable policy', options: ['Does not Violate Policy', 'Violates Policy'] };
      case 'NLG':
        return { question: 'Determine whether the LLM should answer or refuse the prompt', options: ['Answer', 'Refuse'] };
      default:
        return { question: 'Classify the Prompt', options: [] };
    }
  };

  const handleSubmit = async () => {
    if (!safetyLabel) {
      alert('Please select a classification');
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitAnnotationEvaluation({
        promptId: currentPrompt.id,
        safetyLabel,
      });

      if (!result.success) {
        alert(`Failed to save: ${result.error}`);
        return;
      }

      // Mark as completed in sidebar
      setCompletedIds(prev => new Set(prev).add(currentPrompt.id));

      // Advance to next prompt, or stay if at end
      if (currentIndex < prompts.length - 1) {
        handleNext();
      } else {
        resetForm();
      }
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom, #F7F7F7, #1C45D5)' }}>
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading prompts...</p>
        </div>
      </div>
    );
  }

  if (!currentPrompt) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom, #F7F7F7, #1C45D5)' }}>
        <p className="text-gray-600">No prompts available.</p>
      </div>
    );
  }

  const { question, options: safetyOptions } = getSafetyOptions(currentPrompt.task_type);

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'linear-gradient(to bottom, #F7F7F7, #1C45D5)' }}>

      {/* Top Header Bar */}
      <header className="bg-white shadow flex-shrink-0">
        <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Annotator Dashboard</h1>
          <LogoutButton />
        </div>
      </header>

      {/* Below header: sidebar + main content */}
      <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">

        {/* Sidebar – horizontal strip on mobile, vertical column on sm+ */}
        <div className="
          flex flex-row sm:flex-col
          sm:w-16 bg-white border-b sm:border-b-0 sm:border-r border-gray-200
          items-center sm:items-center
          px-2 sm:px-0 py-2 sm:py-4
          overflow-x-auto sm:overflow-x-hidden sm:overflow-y-auto
          flex-shrink-0
          gap-1.5 sm:gap-0
        ">
          {prompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                resetForm();
              }}
              className={`w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 flex items-center justify-center sm:mb-2 rounded-lg transition-colors font-medium text-sm ${
                index === currentIndex
                  ? 'text-white'
                  : completedIds.has(prompt.id)
                  ? 'text-gray-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={
                index === currentIndex
                  ? { backgroundColor: '#1C45D5' }
                  : completedIds.has(prompt.id)
                  ? { backgroundColor: '#B2E3FF' }
                  : undefined
              }
            >
              {index + 1}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-start justify-center p-4 sm:p-6 lg:p-8 min-h-full">
            <div className="w-full max-w-5xl">
            {/* Navigation Arrows */}
            <div className="flex justify-between mb-4">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="p-2 sm:p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Previous prompt"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === prompts.length - 1}
                className="p-2 sm:p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Next prompt"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Quiz Card */}
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
              {/* Context Section */}
              <div className="bg-blue-50 rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-[#1C45D5] mb-3 sm:mb-4">Context:</h3>
                <div className="space-y-2 sm:space-y-3 text-sm text-gray-800">
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

              {/* English and Filipino – stacked on mobile, side-by-side on sm+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-[#DBEAFF] rounded-xl p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">English:</h3>
                  <p className="text-sm sm:text-base text-gray-800 leading-relaxed">{currentPrompt.english_text}</p>
                </div>
                <div className="bg-[#DBEAFF] rounded-xl p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">Filipino:</h3>
                  <p className="text-sm sm:text-base text-gray-800 leading-relaxed">{currentPrompt.filipino_text}</p>
                </div>
              </div>

              {/* Classification Question */}
              <div className="pt-2 sm:pt-4">
                <h3 className="text-base sm:text-lg font-bold text-red-600 mb-3 sm:mb-4">
                  {question}
                </h3>

                {/* Action buttons – full-width on mobile, inline on sm+ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 sm:mb-6">
                  {safetyOptions.map((option) => (
                    <label
                      key={option}
                      className={`flex items-center gap-3 cursor-pointer rounded-xl border-2 px-4 py-3 transition-all ${
                        safetyLabel === option
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="safety"
                        checked={safetyLabel === option}
                        onChange={() => setSafetyLabel(option)}
                        className="w-5 h-5 text-blue-600 flex-shrink-0"
                      />
                      <span className="text-gray-900 font-medium text-sm sm:text-base">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2 sm:pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !safetyLabel}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {submitting ? 'Saving...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
