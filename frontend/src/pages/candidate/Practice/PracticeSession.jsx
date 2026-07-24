import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Spinner } from '../../../components/ui';
import api from '../../../api';
import { CheckCircle2, ChevronRight, Flag, XCircle, LogOut, Award } from 'lucide-react';

export default function PracticeSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [answerResult, setAnswerResult] = useState(null); // { isCorrect, correctOption, explanationText }
  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState(false);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await api.get(`/candidate/practice/sessions/${sessionId}`);
        const data = res.data;
        if (data.status === 'Completed') {
          navigate(`/candidate/practice/result/${sessionId}`, { replace: true });
          return;
        }
        
        setSession(data);
        
        // Find first unanswered question
        const nextUnanswered = data.questions.findIndex(q => !q.candidateAnswer);
        if (nextUnanswered !== -1) {
          setCurrentQuestionIndex(nextUnanswered);
        } else {
          completeSession();
        }
      } catch (err) {
        console.error('Failed to load session:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, [sessionId, navigate]);

  const completeSession = async () => {
    try {
      await api.post(`/candidate/practice/sessions/${sessionId}/complete`);
      navigate(`/candidate/practice/result/${sessionId}`, { replace: true });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    if (!selectedOption) return;
    
    const question = session.questions[currentQuestionIndex];
    
    setSubmitting(true);
    try {
      const res = await api.post(`/candidate/practice/sessions/${sessionId}/answer`, {
        practiceQuestionId: question.practiceQuestionId,
        candidateAnswer: selectedOption
      });
      
      setAnswerResult(res.data);
      
      // Update session state locally
      const updatedSession = { ...session };
      updatedSession.questions[currentQuestionIndex].candidateAnswer = selectedOption;
      updatedSession.questions[currentQuestionIndex].isCorrect = res.data.isCorrect;
      setSession(updatedSession);
      
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setAnswerResult(null);
    setSelectedOption('');
    setReported(false);
    
    if (currentQuestionIndex < session.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      completeSession();
    }
  };

  const handleReport = async () => {
    const question = session.questions[currentQuestionIndex];
    setReporting(true);
    try {
      await api.post(`/candidate/practice/questions/${question.practiceQuestionId}/report`);
      setReported(true);
    } catch (err) {
      console.error(err);
    } finally {
      setReporting(false);
    }
  };

  if (loading || !session) {
    return (
      <div className="flex justify-center p-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const question = session.questions[currentQuestionIndex];
  if (!question) return null;

  // Correct progressive bar calculation (1-indexed question out of total)
  const currentStep = currentQuestionIndex + 1;
  const progressPercent = Math.round((currentStep / session.questionCount) * 100);
  const isLastQuestion = currentQuestionIndex === session.questionCount - 1;

  const options = [
    { id: 'A', text: question.optionA },
    { id: 'B', text: question.optionB },
    { id: 'C', text: question.optionC },
    { id: 'D', text: question.optionD }
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-50 dark:bg-slate-900">
      {/* Compact Header */}
      <div className="shrink-0 border-b border-secondary-200 bg-white px-4 py-2.5 dark:border-secondary-800 dark:bg-secondary-950 sm:px-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-base font-bold text-secondary-900 dark:text-white leading-tight">
                Practice Session
              </h1>
              <div className="flex items-center gap-2 text-xs text-secondary-500">
                <span>Difficulty: <strong className="text-secondary-700 dark:text-secondary-300">{session.difficulty}</strong></span>
                <span>•</span>
                <span className="text-primary-600 dark:text-primary-400 font-semibold">{progressPercent}% Completed</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-secondary-700 dark:text-secondary-300 bg-secondary-100 dark:bg-secondary-800 px-2.5 py-1 rounded-lg">
              Question {currentStep} of {session.questionCount}
            </span>
            
            {/* End Session Early Button */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={completeSession}
              className="text-xs text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 px-2.5"
              title="End session early and view current score"
            >
              <LogOut className="h-3.5 w-3.5 mr-1" />
              End Session
            </Button>
          </div>
        </div>

        {/* Working Progressive Bar */}
        <div className="mx-auto mt-2 max-w-4xl">
          <div className="w-full bg-secondary-100 dark:bg-secondary-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-primary-500 via-indigo-500 to-purple-600 h-full transition-all duration-500 ease-out rounded-full shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content (Compact, zero scrolling needed) */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
        <div className="mx-auto max-w-4xl">
          <Card className="p-4 sm:p-5 md:p-6">
            
            {/* Question Text & Report Flag */}
            <div className="flex justify-between items-start gap-4 mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-secondary-900 dark:text-white leading-snug">
                {question.questionText}
              </h2>
              <button
                type="button"
                onClick={handleReport}
                disabled={reporting || reported}
                className="shrink-0 text-secondary-400 hover:text-red-500 transition-colors p-1"
                title="Report issue with this question"
              >
                <Flag className={`h-4 w-4 ${reported ? 'text-red-500 fill-red-500' : ''}`} />
              </button>
            </div>
            
            {/* Options List (Compact styling) */}
            <div className="space-y-2">
              {options.map((opt) => {
                const isSelected = selectedOption === opt.id;
                let stateClass = 'border-secondary-200 bg-white hover:border-primary-300 dark:border-secondary-700 dark:bg-secondary-900';
                
                if (answerResult) {
                  const isCorrectAnswer = opt.id === answerResult.correctOption;
                  if (isCorrectAnswer) {
                    stateClass = 'border-green-500 bg-green-50 dark:bg-green-900/20';
                  } else if (isSelected && !answerResult.isCorrect) {
                    stateClass = 'border-red-500 bg-red-50 dark:bg-red-900/20';
                  } else {
                    stateClass = 'border-secondary-200 bg-secondary-50/50 opacity-60 dark:border-secondary-800 dark:bg-secondary-900/50';
                  }
                } else if (isSelected) {
                  stateClass = 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-500';
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={!!answerResult}
                    onClick={() => setSelectedOption(opt.id)}
                    className={`w-full flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all ${stateClass}`}
                  >
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-bold ${
                      answerResult 
                        ? opt.id === answerResult.correctOption
                          ? 'border-green-500 bg-green-500 text-white'
                          : isSelected && !answerResult.isCorrect
                            ? 'border-red-500 bg-red-500 text-white'
                            : 'border-secondary-200 text-secondary-500 dark:border-secondary-700'
                        : isSelected
                          ? 'border-primary-500 bg-primary-500 text-white'
                          : 'border-secondary-200 bg-white text-secondary-500 dark:border-secondary-700 dark:bg-secondary-800'
                    }`}>
                      {opt.id}
                    </div>
                    <span className={`text-sm flex-1 ${
                      answerResult && opt.id === answerResult.correctOption
                        ? 'font-medium text-green-900 dark:text-green-100'
                        : answerResult && isSelected && !answerResult.isCorrect
                          ? 'font-medium text-red-900 dark:text-red-100'
                          : 'text-secondary-700 dark:text-secondary-300'
                    }`}>
                      {opt.text}
                    </span>
                    
                    {answerResult && opt.id === answerResult.correctOption && (
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    )}
                    {answerResult && isSelected && !answerResult.isCorrect && (
                      <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Answer Explanation Box */}
            {answerResult && (
              <div className={`mt-4 rounded-xl p-4 ${
                answerResult.isCorrect 
                  ? 'bg-green-50 border border-green-200 dark:bg-green-900/10 dark:border-green-900/30' 
                  : 'bg-red-50 border border-red-200 dark:bg-red-900/10 dark:border-red-900/30'
              }`}>
                <h4 className={`text-sm font-bold flex items-center gap-1.5 ${
                  answerResult.isCorrect ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'
                }`}>
                  {answerResult.isCorrect ? 'Correct!' : 'Incorrect'}
                </h4>
                <p className="mt-1 text-xs sm:text-sm text-secondary-700 dark:text-secondary-300 leading-relaxed">
                  {answerResult.explanationText}
                </p>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="mt-4 sm:mt-5 flex items-center justify-between pt-3 border-t border-secondary-100 dark:border-secondary-800">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={completeSession}
                className="text-xs text-secondary-500 hover:text-red-600 dark:hover:text-red-400"
              >
                <LogOut className="h-3.5 w-3.5 mr-1" />
                End Early
              </Button>

              {!answerResult ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!selectedOption || submitting}
                  loading={submitting}
                  size="md"
                  className="min-w-[130px]"
                >
                  Submit Answer
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  size="md"
                  className="min-w-[130px]"
                >
                  {isLastQuestion ? 'Complete Session' : 'Next Question'}
                  <ChevronRight className="ml-1.5 h-4 w-4" />
                </Button>
              )}
            </div>

          </Card>
        </div>
      </div>
    </div>
  );
}
