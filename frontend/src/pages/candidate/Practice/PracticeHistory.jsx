import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, Card, Spinner } from '../../../components/ui';
import api from '../../../api';
import { Calendar, ChevronRight, Target } from 'lucide-react';

export default function PracticeHistory() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await api.get('/candidate/practice/sessions');
        setSessions(res.data);
      } catch (err) {
        console.error('Failed to load practice history:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-12 text-center">
        <div className="rounded-full bg-secondary-100 p-4 dark:bg-secondary-800">
          <Target className="h-8 w-8 text-secondary-500" />
        </div>
        <h3 className="mt-4 text-h4 text-secondary-900 dark:text-white">No Practice History Yet</h3>
        <p className="mt-2 text-body text-secondary-500">
          Start a new session to begin tracking your interview preparation progress.
        </p>
      </Card>
    );
  }

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleNavigate = (session) => {
    const isCompleted = session.status?.toLowerCase() === 'completed';
    const targetUrl = isCompleted 
      ? `/candidate/practice/result/${session.id}` 
      : `/candidate/practice/session/${session.id}`;
    navigate(targetUrl);
  };

  return (
    <div className="space-y-4">
      {sessions.map((session) => {
        const isCompleted = session.status?.toLowerCase() === 'completed';
        
        return (
          <Card 
            key={session.id} 
            className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:border-primary-300 dark:hover:border-primary-700 transition-colors cursor-pointer group"
            onClick={() => handleNavigate(session)}
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-secondary-900 dark:text-white">
                    {session.skillName} Practice
                  </h3>
                  <Badge variant={
                    session.difficulty === 'Beginner' ? 'success' :
                    session.difficulty === 'Intermediate' ? 'warning' : 'danger'
                  }>
                    {session.difficulty}
                  </Badge>
                </div>
                
                <div className="mt-1 flex items-center gap-4 text-sm text-secondary-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(session.startedAt)}
                  </span>
                  <span>
                    {isCompleted ? (
                      <span className="text-primary-600 dark:text-primary-400 font-medium">
                        Score: {session.score}/{session.questionCount}
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        In Progress
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 sm:mt-0 flex items-center self-end sm:self-auto">
              <Button 
                variant="ghost" 
                className="group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigate(session);
                }}
              >
                {isCompleted ? 'View Results' : 'Resume Session'}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
