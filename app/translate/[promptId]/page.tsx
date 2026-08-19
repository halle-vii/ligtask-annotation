'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { dummyPrompts } from '@/lib/dummy-data';
import { Prompt } from '@/types/database';

export default function TranslatePage() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [revisedTranslation, setRevisedTranslation] = useState('');
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
      // TODO: Submit to Supabase
      console.log('Submitting evaluation:', {
        promptId: currentPrompt.id,
        isCorrect,
        revisedTranslation: isCorrect ? null : revisedTranslation
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

  const handleCopyFilipino = () => {
    if (currentPrompt) {
      setRevisedTranslation(currentPrompt.filipino_text);
    }
  };

  if (!currentPrompt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <p>Loading prompts...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex">
      {/* Left Sidebar - Prompt Numbers */}
      <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4">
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
      <div className="flex-1 flex items-center justify-center p-8">
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
            {/* English Text */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">English:</h3>
              <p className="text-gray-800 leading-relaxed">{currentPrompt.english_text}</p>
            </div>

            {/* Filipino Text with Copy Button */}
            <div className="bg-blue-50 rounded-xl p-6 relative">
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
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
