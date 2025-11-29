import React, { useState } from 'react';
import { BookOpen, Check, HelpCircle, Clock, ChevronRight } from 'lucide-react';

// --- Step 1: Input Form ---
export const WizardInput = ({ onNext, initialValues }) => {
  const [formData, setFormData] = useState(initialValues || {
    knownDomain: '',
    targetDomain: '',
    goal: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.knownDomain && formData.targetDomain && formData.goal) {
      onNext(formData);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Configure Your Analysis</h2>
        <p className="text-gray-600">Tell us where you are and where you want to go. We'll find the gaps.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Known Domain (Your Current Expertise)
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
            placeholder="e.g. Frontend Engineering"
            value={formData.knownDomain}
            onChange={(e) => setFormData({...formData, knownDomain: e.target.value})}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Domain (What you want to learn)
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
            placeholder="e.g. System Design"
            value={formData.targetDomain}
            onChange={(e) => setFormData({...formData, targetDomain: e.target.value})}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Focus / Goal
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
            placeholder="e.g. I want to become a Staff Engineer"
            value={formData.goal}
            onChange={(e) => setFormData({...formData, goal: e.target.value})}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <span>Start Analysis</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

// --- Step 2: Diagnostic ---
export const WizardDiagnostic = ({ config, onComplete }) => {
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Mock questions based on generic domains if specific ones aren't provided
  const questions = [
    {
      id: 1,
      text: "Do you understand the trade-offs involved in the CAP theorem?",
      context: "Distributed Systems Core"
    },
    {
      id: 2,
      text: "Have you implemented or designed a sharding strategy for a database?",
      context: "Scalability"
    },
    {
      id: 3,
      text: "Are you familiar with the concept of 'Backpressure' in stream processing?",
      context: "Resilience"
    }
  ];

  const handleAnswer = (answer) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: answer };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      onComplete(newAnswers);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Diagnostic Check</h2>
        <p className="text-gray-600">
          Analyzing gap between <span className="font-semibold text-indigo-600">{config.knownDomain}</span> and <span className="font-semibold text-indigo-600">{config.targetDomain}</span>.
        </p>
      </div>

      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="mb-8">
        <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium mb-4">
          {questions[currentQuestion].context}
        </span>
        <h3 className="text-xl font-medium text-gray-800">
          {questions[currentQuestion].text}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => handleAnswer('yes')}
          className="p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-600 hover:bg-indigo-50 transition-all text-left flex items-center group"
        >
          <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-indigo-600 mr-3 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <span className="font-medium text-gray-700 group-hover:text-indigo-900">Yes, I am confident</span>
        </button>

        <button
          onClick={() => handleAnswer('somewhat')}
          className="p-4 border-2 border-gray-200 rounded-xl hover:border-yellow-600 hover:bg-yellow-50 transition-all text-left flex items-center group"
        >
           <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-yellow-600 mr-3 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <span className="font-medium text-gray-700 group-hover:text-yellow-900">Somewhat / Unsure</span>
        </button>

        <button
          onClick={() => handleAnswer('no')}
          className="p-4 border-2 border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all text-left flex items-center group sm:col-span-2"
        >
           <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-red-500 mr-3 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <span className="font-medium text-gray-700 group-hover:text-red-900">No, this is new to me</span>
        </button>
      </div>
    </div>
  );
};

// --- Step 3: Calendar Plan ---
export const WizardCalendar = ({ config }) => {
  // Mock Schedule Data
  const schedule = [
    { time: "09:00 AM", duration: 1, title: "Distributed Systems Primer", type: "Reading", description: "Introduction to core concepts of distributed computing vs local execution." },
    { time: "10:00 AM", duration: 1, title: "The Google File System Paper", type: "Deep Dive", description: "Bridging Distributed Systems -> Frontend storage concepts. Understanding how massive data is stored." },
    { time: "11:00 AM", duration: 1, title: "Review CAP Theorem Real-world Examples", type: "Case Study", description: "Analysis of outages caused by partition tolerance failures." },
    { time: "01:00 PM", duration: 2, title: "Implement Consistent Hashing", type: "Coding", description: "Hands-on exercise to understand load balancing and sharding." },
    { time: "03:00 PM", duration: 1, title: "Reflection & Notes", type: "Review", description: "Summarize learnings and identify remaining questions." },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      <div className="p-8 border-b border-gray-100 bg-indigo-600 text-white">
        <h2 className="text-2xl font-bold mb-2">Your Knowledge Bridge Plan</h2>
        <p className="text-indigo-100">
          A personalized schedule to help you achieve: <span className="font-semibold text-white">{config.goal}</span>
        </p>
      </div>

      <div className="p-8 bg-gray-50">
        <div className="space-y-4">
          {schedule.map((item, index) => (
            <div key={index} className="flex flex-col sm:flex-row bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              {/* Time Column */}
              <div className="sm:w-32 flex flex-col justify-center sm:border-r border-gray-100 sm:pr-4 mb-2 sm:mb-0">
                <span className="text-gray-900 font-bold">{item.time}</span>
                <span className="text-xs text-gray-500 flex items-center mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  {item.duration} hr{item.duration > 1 ? 's' : ''}
                </span>
              </div>

              {/* Content Column */}
              <div className="flex-grow sm:pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-lg text-gray-800">{item.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium
                    ${item.type === 'Reading' ? 'bg-blue-100 text-blue-800' :
                      item.type === 'Deep Dive' ? 'bg-purple-100 text-purple-800' :
                      item.type === 'Coding' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                    {item.type}
                  </span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
              </div>

              {/* Action Column */}
               <div className="sm:w-10 flex items-center justify-center sm:pl-2">
                 <button className="text-gray-400 hover:text-indigo-600 transition-colors">
                   <BookOpen className="w-5 h-5" />
                 </button>
               </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <button className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center">
            <Check className="w-5 h-5 mr-2" />
            Accept Plan
          </button>
        </div>
      </div>
    </div>
  );
};
