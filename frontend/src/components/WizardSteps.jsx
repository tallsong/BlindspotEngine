import React, { useState, useEffect } from 'react';
import { BookOpen, Check, HelpCircle, Clock, ChevronRight } from 'lucide-react';

// --- Domain Knowledge Definitions ---
const knowledgeDatabase = {
  1: { // CAP Theorem
    unknown: [
      { title: "Distributed Systems Primer", type: "Reading", duration: 1, description: "Introduction to core concepts of distributed computing vs local execution." },
      { title: "CAP Theorem Real-world Examples", type: "Case Study", duration: 1, description: "Analysis of outages caused by partition tolerance failures." }
    ],
    known: [
      { title: "Advanced CAP: PACELC Theorem", type: "Deep Dive", duration: 1, description: "Going beyond CAP: Trade-offs between latency and consistency when no partition exists." }
    ]
  },
  2: { // Sharding
    unknown: [
      { title: "Database Sharding Strategies", type: "Reading", duration: 1, description: "Horizontal vs Vertical scaling. Key-based, Range-based, and Directory-based sharding." },
      { title: "Implement Consistent Hashing", type: "Coding", duration: 2, description: "Hands-on exercise to understand load balancing and sharding." }
    ],
    known: [
      { title: "Vitess Architecture Deep Dive", type: "Deep Dive", duration: 2, description: "Study how Vitess manages sharding for MySQL at scale." }
    ]
  },
  3: { // Backpressure
    unknown: [
      { title: "Understanding Backpressure Patterns", type: "Reading", duration: 1, description: "How systems handle load that exceeds processing capacity. Buffering, Dropping, and Control loops." }
    ],
    known: [
      { title: "Reactive Streams Specification", type: "Deep Dive", duration: 1, description: "Study the standard for asynchronous stream processing with non-blocking back pressure." }
    ]
  },
  4: { // Raft Consensus
    unknown: [
      { title: "The Raft Consensus Algorithm", type: "Reading", duration: 2, description: "Understand Leader Election and Log Replication." }
    ],
    known: [
      { title: "Optimizing Raft Latency", type: "Deep Dive", duration: 1, description: "Pre-vote and read-index optimizations." }
    ]
  },
  5: { // Event Sourcing
    unknown: [
      { title: "Event Sourcing Basics", type: "Reading", duration: 1, description: "Storing state as a sequence of events." }
    ],
    known: [
      { title: "CQRS with Event Sourcing", type: "Deep Dive", duration: 2, description: "Separating read and write models effectively." }
    ]
  },
  6: { // Circuit Breaker
    unknown: [
      { title: "Circuit Breaker Pattern", type: "Reading", duration: 1, description: "Preventing cascading failures in microservices." }
    ],
    known: [
      { title: "Adaptive Concurrency Control", type: "Deep Dive", duration: 1, description: "Dynamic limits instead of static circuit breakers." }
    ]
  },
  7: { // Bloom Filters
    unknown: [
      { title: "Probabilistic Data Structures", type: "Reading", duration: 1, description: "Introduction to Bloom Filters and HyperLogLog." }
    ],
    known: [
      { title: "Cuckoo Filters vs Bloom Filters", type: "Case Study", duration: 1, description: "Analysis of deletion support and space efficiency." }
    ]
  },
  8: { // Two-Phase Commit
    unknown: [
      { title: "Distributed Transactions: 2PC", type: "Reading", duration: 1, description: "The classic commit protocol and its blocking problem." }
    ],
    known: [
      { title: "Sagas Pattern", type: "Coding", duration: 2, description: "Implementing distributed transactions without locking." }
    ]
  },
  9: { // Gossip Protocols
    unknown: [
      { title: "Gossip Protocol Fundamentals", type: "Reading", duration: 1, description: "Epidemic algorithms for state propagation." }
    ],
    known: [
      { title: "SWIM Protocol Analysis", type: "Deep Dive", duration: 1, description: "Scalable Weakly-consistent Infection-style Process Group Membership." }
    ]
  },
  10: { // Vector Clocks
    unknown: [
      { title: "Logical Clocks & Ordering", type: "Reading", duration: 1, description: "Lamport timestamps and Vector clocks for causal ordering." }
    ],
    known: [
      { title: "Conflict Resolution with CRDTs", type: "Coding", duration: 2, description: "Implementing conflict-free replicated data types." }
    ]
  }
};

const questions = [
  { id: 1, text: "Do you understand the trade-offs involved in the CAP theorem?", context: "Distributed Systems Core" },
  { id: 2, text: "Have you implemented or designed a sharding strategy for a database?", context: "Scalability" },
  { id: 3, text: "Are you familiar with the concept of 'Backpressure' in stream processing?", context: "Resilience" },
  { id: 4, text: "Can you explain the Leader Election process in Raft?", context: "Consensus" },
  { id: 5, text: "Have you built a system using Event Sourcing?", context: "Architecture" },
  { id: 6, text: "Do you know when to use a Circuit Breaker pattern?", context: "Resilience" },
  { id: 7, text: "Could you implement a Bloom Filter from scratch?", context: "Data Structures" },
  { id: 8, text: "Do you understand the limitations of Two-Phase Commit (2PC)?", context: "Transactions" },
  { id: 9, text: "Have you worked with Gossip Protocols for cluster membership?", context: "Distributed Algorithms" },
  { id: 10, text: "Can you distinguish between Lamport Timestamps and Vector Clocks?", context: "Time & Ordering" }
];

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

// --- Step 3: Calendar Plan (Google Calendar Style) ---
export const WizardCalendar = ({ config, diagnosticResults }) => {
  const [schedule, setSchedule] = useState([]);
  const [calculatedEndHour, setCalculatedEndHour] = useState(18);

  useEffect(() => {
    // Generate schedule based on answers
    const generatedSchedule = [];
    let currentTime = 9; // Start at 9:00 AM

    const formatTime = (hour) => {
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const h = hour % 12 || 12;
      return `${h.toString().padStart(2, '0')}:00 ${ampm}`;
    };

    // Iterate through answers
    Object.keys(diagnosticResults).forEach(questionId => {
      const answer = diagnosticResults[questionId];
      const knowledge = knowledgeDatabase[questionId];

      if (!knowledge) return;

      let tasksToAdd = [];
      if (answer === 'no' || answer === 'somewhat') {
        tasksToAdd = knowledge.unknown;
      } else {
        tasksToAdd = knowledge.known;
      }

      tasksToAdd.forEach(task => {
        generatedSchedule.push({
          startHour: currentTime, // Store numeric start hour for positioning
          time: formatTime(currentTime),
          duration: task.duration,
          title: task.title,
          type: task.type,
          description: task.description
        });
        currentTime += task.duration;
      });
    });

    // Add a final review session
    generatedSchedule.push({
      startHour: currentTime,
      time: formatTime(currentTime),
      duration: 1,
      title: "Reflection & Notes",
      type: "Review",
      description: "Summarize learnings and identify remaining questions."
    });

    // Calculate required end hour (minimum 18, max extends if needed)
    // currentTime is now the END time of the last task
    const maxHour = Math.max(18, currentTime + 1);
    setCalculatedEndHour(maxHour);

    setSchedule(generatedSchedule);
  }, [diagnosticResults]);

  // Calendar Constants
  const START_HOUR = 8;
  const END_HOUR = calculatedEndHour;
  const PIXELS_PER_HOUR = 80;
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

  // Helper to get color classes based on task type
  const getEventStyle = (type) => {
    switch (type) {
      case 'Reading': return 'bg-blue-100 border-l-4 border-blue-500 text-blue-900';
      case 'Deep Dive': return 'bg-purple-100 border-l-4 border-purple-500 text-purple-900';
      case 'Coding': return 'bg-green-100 border-l-4 border-green-500 text-green-900';
      case 'Case Study': return 'bg-orange-100 border-l-4 border-orange-500 text-orange-900';
      default: return 'bg-gray-100 border-l-4 border-gray-500 text-gray-900';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 flex flex-col h-[800px] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white flex justify-between items-center z-10 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Your Knowledge Bridge Plan</h2>
          <p className="text-sm text-gray-500">Goal: {config.goal}</p>
        </div>
        <div className="flex space-x-2">
            <div className="flex items-center text-xs text-gray-500">
                <div className="w-3 h-3 bg-blue-100 border border-blue-500 rounded mr-1"></div> Reading
            </div>
            <div className="flex items-center text-xs text-gray-500">
                <div className="w-3 h-3 bg-green-100 border border-green-500 rounded mr-1"></div> Coding
            </div>
            <div className="flex items-center text-xs text-gray-500">
                <div className="w-3 h-3 bg-purple-100 border border-purple-500 rounded mr-1"></div> Deep Dive
            </div>
        </div>
      </div>

      {/* Calendar Scroll Area */}
      <div className="flex-grow overflow-y-auto relative">
        <div className="flex" style={{ height: (hours.length) * PIXELS_PER_HOUR + 40 }}>

          {/* Time Sidebar */}
          <div className="w-16 flex-shrink-0 border-r border-gray-200 bg-gray-50 text-xs text-gray-500 pt-2 text-center select-none">
            {hours.map((hour) => (
              <div key={hour} className="relative" style={{ height: PIXELS_PER_HOUR }}>
                <span className="relative -top-2">
                  {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                </span>
              </div>
            ))}
          </div>

          {/* Grid Content */}
          <div className="flex-grow relative bg-white">
            {/* Horizontal Grid Lines */}
            {hours.map((hour) => (
              <div
                key={hour}
                className="border-b border-gray-100 w-full absolute"
                style={{ top: (hour - START_HOUR) * PIXELS_PER_HOUR, height: 1, width: '100%' }}
              ></div>
            ))}

            {/* Current Time Indicator (Mocked at 10:30 AM) */}
             <div
                className="absolute w-full border-t-2 border-red-500 z-10 opacity-70 flex items-center pointer-events-none"
                style={{ top: (10.5 - START_HOUR) * PIXELS_PER_HOUR }}
             >
                <div className="w-2 h-2 bg-red-500 rounded-full -ml-1"></div>
             </div>

            {/* Events */}
            {schedule.map((event, index) => {
              const top = (event.startHour - START_HOUR) * PIXELS_PER_HOUR;
              const height = event.duration * PIXELS_PER_HOUR;

              return (
                <div
                  key={index}
                  className={`absolute left-2 right-4 rounded-md p-2 text-xs cursor-pointer hover:shadow-lg transition-shadow overflow-hidden ${getEventStyle(event.type)}`}
                  style={{
                    top: `${top + 1}px`, // +1 to clear the grid line
                    height: `${height - 2}px`, // -2 to create a gap
                  }}
                  title={event.description}
                >
                  <div className="font-bold truncate text-sm">{event.title}</div>
                  <div className="opacity-80 truncate mb-1">{event.time} - {event.duration}h</div>
                   <div className="line-clamp-2 leading-tight opacity-75">{event.description}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

       <div className="p-4 border-t bg-gray-50 flex justify-center">
          <button className="bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center shadow-lg">
            <Check className="w-5 h-5 mr-2" />
            Accept Plan
          </button>
        </div>
    </div>
  );
};
