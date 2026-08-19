'use client';

import { useState, useEffect } from 'react';
import { Prompt } from '@/types/database';
import LogoutButton from '@/app/components/LogoutButton';
import { submitTranslationEvaluation, getCompletedPromptIds } from '@/app/actions/evaluations';
import { getPrompts } from '@/app/actions/prompts';

export default function TranslatePage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [revisedTranslation, setRevisedTranslation] = useState('');
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
    setIsCorrect(null);
    setRevisedTranslation('');
  };

  const handleSubmit = async () => {
    if (isCorrect === null) {
      alert('Please indicate whether the translation is accurate');
      return;
    }
    if (isCorrect === false && !revisedTranslation.trim()) {
      alert('Please provide a revised translation');
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitTranslationEvaluation({
        promptId: currentPrompt.id,
        translationCorrect: isCorrect,
        revisedTranslation: isCorrect ? null : revisedTranslation,
      });

      if (!result.success) {
        alert(`Failed to save: ${result.error}`);
        return;
      }

      // Mark as completed in sidebar
      setCompletedIds(prev => new Set(prev).add(currentPrompt.id));

      // Advance to next unanswered prompt, or stay if at end
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

  const handleCopyFilipino = () => {
    if (currentPrompt) {
      setRevisedTranslation(currentPrompt.filipino_text);
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

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: 'linear-gradient(to bottom, #F7F7F7, #1C45D5)' }}>
      {/* Top-right Logout Button */}
      <div className="fixed top-4 right-10 z-50">
        <LogoutButton />
      </div>

      {/* Left Sidebar - Prompt Numbers */}
      <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 overflow-y-auto flex-shrink-0">
        {prompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentIndex(index);
              resetForm();
            }}
            className={`w-12 h-12 flex items-center justify-center mb-2 rounded-lg transition-colors font-medium ${
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
        <div className="flex items-center justify-center p-8 min-h-full">
        <div className="w-full max-w-4xl">
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
            {/* Stacked prompt boxes — English sits on top of Filipino */}
            <div className="flex flex-col gap-0">
              {/* English box — renders first, sits on top via z-index */}
              <div className="bg-blue-50 rounded-xl p-6 relative z-10 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-3">English:</h3>
                <p className="text-gray-800 leading-relaxed">{currentPrompt.english_text}</p>
              </div>

              {/* Filipino box — tucked behind, top rounded corners hidden under English box */}
              <div className="bg-blue-100 rounded-xl p-6 -mt-4 pt-8 relative z-0">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-gray-900">Filipino:</h3>
                  <button
                    onClick={handleCopyFilipino}
                    className="text-blue-600 hover:text-blue-700"
                    title="Copy to revision box"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-800 leading-relaxed">{currentPrompt.filipino_text}</p>
              </div>
            </div>

            {/* Question */}
            <div className="pt-4">
              <h3 className="text-lg font-bold text-red-600 mb-4">
                Is the Filipino translation accurate?
              </h3>

              <div className="flex gap-4 mb-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="accuracy"
                    checked={isCorrect === true}
                    onChange={() => {
                      setIsCorrect(true);
                      setRevisedTranslation('');
                    }}
                    className="w-5 h-5 text-blue-600"
                  />
                  <span className="ml-2 text-gray-900 font-medium">Yes</span>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="accuracy"
                    checked={isCorrect === false}
                    onChange={() => setIsCorrect(false)}
                    className="w-5 h-5 text-blue-600"
                  />
                  <span className="ml-2 text-gray-900 font-medium">No</span>
                </label>
              </div>

              {/* Revision Text Area */}
              {isCorrect === false && (
                <div>
                  <label className="block text-gray-900 font-medium mb-2">
                    If 'No', please revise the prompt below
                  </label>
                  <textarea
                    value={revisedTranslation}
                    onChange={(e) => setRevisedTranslation(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Value"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSubmit}
                disabled={submitting || isCorrect === null}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Saving...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
