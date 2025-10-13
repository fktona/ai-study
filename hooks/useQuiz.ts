import { useState, useCallback } from 'react'

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface QuizResult {
  score: number
  totalQuestions: number
  percentage: number
  passed: boolean
  correctAnswers: number
  wrongAnswers: number
  timeSpent: number
  questions: QuizQuestion[]
  userAnswers: number[]
}

export const useQuiz = () => {
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion[]>([])
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null)
  const [isQuizActive, setIsQuizActive] = useState(false)
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null)

  // Sample quiz questions for different topics
  const sampleQuestions: Record<string, QuizQuestion[]> = {
    mathematics: [
      {
        id: 'math-1',
        question: 'What is the derivative of x²?',
        options: ['x', '2x', 'x²', '2x²'],
        correctAnswer: 1,
        explanation: 'The derivative of x² is 2x using the power rule.',
        difficulty: 'easy'
      },
      {
        id: 'math-2',
        question: 'What is the integral of 2x?',
        options: ['x²', 'x² + C', '2x²', 'x² + 2'],
        correctAnswer: 1,
        explanation: 'The integral of 2x is x² + C, where C is the constant of integration.',
        difficulty: 'medium'
      },
      {
        id: 'math-3',
        question: 'What is the limit of (x² - 1)/(x - 1) as x approaches 1?',
        options: ['0', '1', '2', 'undefined'],
        correctAnswer: 2,
        explanation: 'Using L\'Hôpital\'s rule or factoring, the limit is 2.',
        difficulty: 'hard'
      }
    ],
    science: [
      {
        id: 'sci-1',
        question: 'What is the chemical symbol for gold?',
        options: ['Go', 'Gd', 'Au', 'Ag'],
        correctAnswer: 2,
        explanation: 'Au is the chemical symbol for gold, derived from the Latin word "aurum".',
        difficulty: 'easy'
      },
      {
        id: 'sci-2',
        question: 'What is the speed of light in vacuum?',
        options: ['3 × 10⁶ m/s', '3 × 10⁸ m/s', '3 × 10¹⁰ m/s', '3 × 10¹² m/s'],
        correctAnswer: 1,
        explanation: 'The speed of light in vacuum is approximately 3 × 10⁸ meters per second.',
        difficulty: 'medium'
      },
      {
        id: 'sci-3',
        question: 'What is the Heisenberg Uncertainty Principle?',
        options: [
          'Energy cannot be created or destroyed',
          'You cannot simultaneously know the exact position and momentum of a particle',
          'Matter and energy are equivalent',
          'Light behaves as both wave and particle'
        ],
        correctAnswer: 1,
        explanation: 'The Heisenberg Uncertainty Principle states that you cannot simultaneously know the exact position and momentum of a particle.',
        difficulty: 'hard'
      }
    ],
    programming: [
      {
        id: 'prog-1',
        question: 'What is the time complexity of binary search?',
        options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
        correctAnswer: 1,
        explanation: 'Binary search has O(log n) time complexity because it eliminates half of the search space with each comparison.',
        difficulty: 'easy'
      },
      {
        id: 'prog-2',
        question: 'What does "DRY" stand for in programming?',
        options: ['Don\'t Repeat Yourself', 'Data Retrieval Yield', 'Dynamic Runtime Yield', 'Default Return Yield'],
        correctAnswer: 0,
        explanation: 'DRY stands for "Don\'t Repeat Yourself", a principle aimed at reducing repetition of code.',
        difficulty: 'medium'
      },
      {
        id: 'prog-3',
        question: 'What is the difference between "==" and "===" in JavaScript?',
        options: [
          'No difference, they are identical',
          '"==" compares value, "===" compares value and type',
          '"===" compares value, "==" compares value and type',
          'Both compare value and type'
        ],
        correctAnswer: 1,
        explanation: '"==" performs type coercion and compares values, while "===" compares both value and type without coercion.',
        difficulty: 'hard'
      }
    ],
    history: [
      {
        id: 'hist-1',
        question: 'When did World War II end?',
        options: ['1944', '1945', '1946', '1947'],
        correctAnswer: 1,
        explanation: 'World War II ended in 1945 with the surrender of Japan.',
        difficulty: 'easy'
      },
      {
        id: 'hist-2',
        question: 'Who was the first person to walk on the moon?',
        options: ['Buzz Aldrin', 'Neil Armstrong', 'John Glenn', 'Alan Shepard'],
        correctAnswer: 1,
        explanation: 'Neil Armstrong was the first person to walk on the moon on July 20, 1969.',
        difficulty: 'medium'
      },
      {
        id: 'hist-3',
        question: 'What was the main cause of the Great Depression?',
        options: [
          'World War I',
          'Stock market crash of 1929',
          'Dust Bowl',
          'Bank failures'
        ],
        correctAnswer: 1,
        explanation: 'While multiple factors contributed, the stock market crash of 1929 is generally considered the main trigger of the Great Depression.',
        difficulty: 'hard'
      }
    ]
  }

  // Start a new quiz
  const startQuiz = useCallback((topic: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium', questionCount: number = 5) => {
    const availableQuestions = sampleQuestions[topic] || []
    const filteredQuestions = availableQuestions.filter(q => q.difficulty === difficulty)
    
    if (filteredQuestions.length === 0) {
      throw new Error(`No ${difficulty} questions available for ${topic}`)
    }
    
    // Shuffle and select questions
    const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5)
    const selectedQuestions = shuffled.slice(0, Math.min(questionCount, shuffled.length))
    
    setCurrentQuiz(selectedQuestions)
    setUserAnswers(new Array(selectedQuestions.length).fill(null))
    setCurrentQuestionIndex(0)
    setQuizStartTime(new Date())
    setIsQuizActive(true)
    setQuizResult(null)
  }, [])

  // Answer a question
  const answerQuestion = useCallback((answerIndex: number) => {
    if (!isQuizActive || currentQuestionIndex >= currentQuiz.length) return
    
    const newAnswers = [...userAnswers]
    newAnswers[currentQuestionIndex] = answerIndex
    setUserAnswers(newAnswers)
  }, [isQuizActive, currentQuestionIndex, currentQuiz.length, userAnswers])

  // Go to next question
  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < currentQuiz.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }, [currentQuestionIndex, currentQuiz.length])

  // Go to previous question
  const previousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }, [currentQuestionIndex])

  // Submit quiz
  const submitQuiz = useCallback(() => {
    if (!isQuizActive || !quizStartTime) return
    
    const timeSpent = Math.floor((Date.now() - quizStartTime.getTime()) / 1000)
    let correctAnswers = 0
    let wrongAnswers = 0
    
    currentQuiz.forEach((question, index) => {
      if (userAnswers[index] === question.correctAnswer) {
        correctAnswers++
      } else {
        wrongAnswers++
      }
    })
    
    const score = correctAnswers
    const totalQuestions = currentQuiz.length
    const percentage = Math.round((correctAnswers / totalQuestions) * 100)
    const passed = percentage >= 70
    
    const result: QuizResult = {
      score,
      totalQuestions,
      percentage,
      passed,
      correctAnswers,
      wrongAnswers,
      timeSpent,
      questions: currentQuiz,
      userAnswers: userAnswers as number[]
    }
    
    setQuizResult(result)
    setIsQuizActive(false)
    
    return result
  }, [isQuizActive, quizStartTime, currentQuiz, userAnswers])

  // Reset quiz
  const resetQuiz = useCallback(() => {
    setCurrentQuiz([])
    setUserAnswers([])
    setCurrentQuestionIndex(0)
    setQuizStartTime(null)
    setIsQuizActive(false)
    setQuizResult(null)
  }, [])

  // Get current question
  const getCurrentQuestion = useCallback(() => {
    if (!isQuizActive || currentQuestionIndex >= currentQuiz.length) return null
    return currentQuiz[currentQuestionIndex]
  }, [isQuizActive, currentQuestionIndex, currentQuiz])

  // Check if all questions are answered
  const isAllAnswered = useCallback(() => {
    return userAnswers.every(answer => answer !== null)
  }, [userAnswers])

  // Get quiz progress
  const getQuizProgress = useCallback(() => {
    const answered = userAnswers.filter(answer => answer !== null).length
    return {
      current: currentQuestionIndex + 1,
      total: currentQuiz.length,
      answered,
      progress: Math.round((answered / currentQuiz.length) * 100)
    }
  }, [currentQuestionIndex, currentQuiz.length, userAnswers])

  return {
    // Quiz state
    currentQuiz,
    userAnswers,
    currentQuestionIndex,
    quizStartTime,
    isQuizActive,
    quizResult,
    
    // Actions
    startQuiz,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    submitQuiz,
    resetQuiz,
    
    // Utilities
    getCurrentQuestion,
    isAllAnswered,
    getQuizProgress,
    
    // Available topics
    availableTopics: Object.keys(sampleQuestions),
  }
}
