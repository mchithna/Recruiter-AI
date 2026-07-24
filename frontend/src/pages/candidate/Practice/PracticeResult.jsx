import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Spinner, Badge } from '../../../components/ui';
import api from '../../../api';
import { ArrowLeft, CheckCircle2, Target, XCircle } from 'lucide-react';

export default function PracticeResult() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await api.get(`/candidate/practice/sessions/${sessionId}`);
        if (res.data.status !== 'Completed') {
          // If they somehow got here before completing, complete it
          await api.post(`/candidate/practice/sessions/${sessionId}/complete`);
          const refreshRes = await api.get(`/candidate/practice/sessions/${sessionId}`);
          setSession(refreshRes.data);
        } else {
          setSession(res.data);
        }
      } catch (err) {
        console.error('Failed to load session:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, [sessionId]);

  if (loading || !session) {
    return (
      <div className="flex justify-center p-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const scorePercentage = Math.round((session.score / session.questionCount) * 100);
  
  let resultColor = 'text-primary-500';
  let resultBg = 'bg-primary-50 dark:bg-primary-900/20';
  let resultBorder = 'border-primary-200 dark:border-primary-800';
  let feedbackText = 'Good effort!';
  
  if (scorePercentage >= 80) {
    resultColor = 'text-green-500';
    resultBg = 'bg-green-50 dark:bg-green-900/20';
    resultBorder = 'border-green-200 dark:border-green-800';
    feedbackText = 'Excellent performance!';
  } else if (scorePercentage < 50) {
    resultColor = 'text-amber-500';
    resultBg = 'bg-amber-50 dark:bg-amber-900/20';
    resultBorder = 'border-amber-200 dark:border-amber-800';
    feedbackText = 'Keep practicing!';
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-50 dark:bg-slate-900">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          
          <button 
            onClick={() => navigate('/candidate/practice')}
            className="flex items-center text-sm font-medium text-secondary-500 hover:text-secondary-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Practice
          </button>

          <Card className={`p-8 text-center border-2 ${resultBorder} ${resultBg}`}>
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-white dark:bg-secondary-950 shadow-sm mb-4">
              <Target className={`h-10 w-10 ${resultColor}`} />
            </div>
            <h1 className="text-h2 text-secondary-900 dark:text-white mb-2">
              {scorePercentage}% Score
            </h1>
            <p className="text-body font-medium text-secondary-700 dark:text-secondary-300">
              {session.score} out of {session.questionCount} correct
            </p>
            <p className="mt-2 text-sm text-secondary-500 dark:text-secondary-400">
              {feedbackText} You completed this {session.difficulty.toLowerCase()} level practice session.
            </p>
          </Card>

          <div className="space-y-4">
            <h2 className="text-h4 text-secondary-900 dark:text-white mt-8 mb-4">
              Review Questions
            </h2>
            
            {session.questions.map((q, index) => {
              const options = [
                { id: 'A', text: q.optionA },
                { id: 'B', text: q.optionB },
                { id: 'C', text: q.optionC },
                { id: 'D', text: q.optionD }
              ];

              return (
                <Card key={q.id} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary">Question {index + 1}</Badge>
                        {q.isCorrect ? (
                          <Badge variant="success" className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Correct
                          </Badge>
                        ) : (
                          <Badge variant="danger" className="flex items-center gap-1">
                            <XCircle className="h-3 w-3" /> Incorrect
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-4">
                        {q.questionText}
                      </h3>
                      
                      <div className="grid gap-2 mb-4">
                        {options.map(opt => {
                          const isCandidateAnswer = q.candidateAnswer === opt.id;
                          const isCorrectOption = q.correctOption === opt.id;
                          
                          let bgClass = "bg-secondary-50 dark:bg-secondary-800/50";
                          let textClass = "text-secondary-700 dark:text-secondary-300";
                          let borderClass = "border-transparent";

                          if (isCorrectOption) {
                            bgClass = "bg-green-50 dark:bg-green-900/20";
                            textClass = "text-green-800 dark:text-green-300 font-medium";
                            borderClass = "border-green-200 dark:border-green-800/50";
                          } else if (isCandidateAnswer && !q.isCorrect) {
                            bgClass = "bg-red-50 dark:bg-red-900/20";
                            textClass = "text-red-800 dark:text-red-300 font-medium";
                            borderClass = "border-red-200 dark:border-red-800/50";
                          }

                          return (
                            <div 
                              key={opt.id} 
                              className={`flex items-center gap-3 p-3 rounded-lg border ${bgClass} ${borderClass}`}
                            >
                              <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-bold ${
                                isCorrectOption 
                                  ? 'bg-green-500 text-white' 
                                  : (isCandidateAnswer && !q.isCorrect) 
                                    ? 'bg-red-500 text-white' 
                                    : 'bg-white dark:bg-secondary-700 text-secondary-500 shadow-sm'
                              }`}>
                                {opt.id}
                              </div>
                              <span className={`text-sm ${textClass}`}>{opt.text}</span>
                              {isCorrectOption && <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto shrink-0" />}
                              {isCandidateAnswer && !q.isCorrect && <XCircle className="h-4 w-4 text-red-500 ml-auto shrink-0" />}
                            </div>
                          );
                        })}
                      </div>

                      <div className="rounded-lg bg-primary-50 p-4 dark:bg-primary-900/10">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 mb-1">
                          Explanation
                        </h4>
                        <p className="text-sm text-secondary-700 dark:text-secondary-300 leading-relaxed">
                          {q.explanationText}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          
          <div className="flex justify-center pt-8 pb-12">
            <Button size="lg" onClick={() => navigate('/candidate/practice')}>
              Back to Practice Hub
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
