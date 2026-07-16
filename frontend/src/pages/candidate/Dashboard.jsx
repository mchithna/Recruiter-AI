import React, { useState } from 'react';
import { 
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, 
  StatusBadge, Avatar, Button, DropdownMenu, DropdownMenuItem
} from '../../components/ui';
import { Eye, Trash2, MoreHorizontal } from 'lucide-react';

export default function CandidateDashboard() {
  const [applications] = useState([
    { id: 1, jobTitle: 'Senior React Developer', companyName: 'TechCorp', appliedDate: '2023-10-01', status: 'interview_scheduled' },
    { id: 2, jobTitle: 'Product Designer', companyName: 'Innovate.io', appliedDate: '2023-10-05', status: 'under_review' },
    { id: 3, jobTitle: 'Backend Engineer', companyName: 'FinTech Solutions', appliedDate: '2023-10-10', status: 'applied' },
    { id: 4, jobTitle: 'DevOps Specialist', companyName: 'CloudNet', appliedDate: '2023-10-12', status: 'rejected' },
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="border-b-2 border-primary-100 pb-3">
        <h1 className="text-h2 text-secondary-900">My Applications</h1>
      </div>

      <div className="rounded-xl border border-secondary-200 overflow-hidden bg-white">
        <Table density="comfortable">
          <TableHeader>
            <TableRow isHeader>
              <TableHead>Company</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Applied Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => (
              <TableRow key={app.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar name={app.companyName} size="sm" />
                    <span className="font-semibold text-secondary-900">{app.companyName}</span>
                  </div>
                </TableCell>
                <TableCell>{app.jobTitle}</TableCell>
                <TableCell>{app.appliedDate}</TableCell>
                <TableCell>
                  <StatusBadge status={app.status} type="application" size="sm" />
                </TableCell>
                <TableCell>
                  <DropdownMenu
                    align="right"
                    trigger={
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal size={15} strokeWidth={1.75} />
                      </Button>
                    }
                  >
                    <DropdownMenuItem icon={<Eye size={14} strokeWidth={1.75} />}>
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem icon={<Trash2 size={14} strokeWidth={1.75} />} danger>
                      Withdraw Application
                    </DropdownMenuItem>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
