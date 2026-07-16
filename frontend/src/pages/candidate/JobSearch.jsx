import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Badge, Button } from '../../components/ui';

export default function JobSearch() {
  const [jobs] = useState([
    { id: 1, title: 'Senior React Developer', company: 'TechCorp', location: 'Remote', employmentType: 'Full-time' },
    { id: 2, title: 'Product Designer', company: 'Innovate.io', location: 'New York, NY', employmentType: 'Contract' },
    { id: 3, title: 'Backend Engineer', company: 'FinTech Solutions', location: 'San Francisco, CA', employmentType: 'Full-time' },
    { id: 4, title: 'DevOps Specialist', company: 'CloudNet', location: 'Remote', employmentType: 'Full-time' },
  ]);

  const handleApply = (id) => {
    alert('Applied to Job ' + id);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="border-b-2 border-primary-100 pb-3">
        <h1 className="text-h2 text-secondary-900">Job Search</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <Card key={job.id} hoverable>
            <CardHeader>
              <div>
                <CardTitle>{job.title}</CardTitle>
                <CardDescription>{job.company} · {job.location}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Badge variant="info">{job.employmentType}</Badge>
            </CardContent>
            <CardFooter>
              <Button variant="primary" onClick={() => handleApply(job.id)}>
                Apply Now
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
