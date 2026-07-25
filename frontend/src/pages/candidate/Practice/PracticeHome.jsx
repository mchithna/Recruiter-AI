import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/Tabs';
import PracticeSetup from './PracticeSetup';
import PracticeHistory from './PracticeHistory';

export default function PracticeHome() {
  const [activeTab, setActiveTab] = useState('setup');

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl space-y-8">
          <div>
            <h1 className="text-h2 text-secondary-900 dark:text-white">Interview Practice</h1>
            <p className="mt-2 text-body text-secondary-500 dark:text-secondary-400">
              Sharpen your skills with AI-powered practice questions.
            </p>
          </div>

          <Tabs value={activeTab} onChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="setup">New Practice Session</TabsTrigger>
              <TabsTrigger value="history">Practice History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="setup">
              <PracticeSetup />
            </TabsContent>
            
            <TabsContent value="history">
              <PracticeHistory />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
