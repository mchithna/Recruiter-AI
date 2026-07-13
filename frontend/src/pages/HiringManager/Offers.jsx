import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, FileCheck, Sparkles, ChevronRight, AlertCircle } from 'lucide-react';
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  EmptyState,
} from '../../components/ui';
import StatusBadge from './components/StatusBadge';
import { getAllOffers } from './services/mockData';

const formatDate = (dateString) => {
  if (!dateString) return 'Not set';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
  }).format(new Date(dateString));
};

export function Offers() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadOffers() {
      try {
        setIsLoading(true);
        const data = await getAllOffers();
        if (isActive) {
          // Sort by creation date or ID descending (latest first)
          const sorted = [...data].sort((a, b) => b.id.localeCompare(a.id));
          setOffers(sorted);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to load offers tracker data', error);
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadOffers();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className="relative z-10 space-y-6 animate-slide-up">
      {/* Banner */}
      <section className="glass-card-heavy relative overflow-hidden rounded-3xl border-none p-6">
        <img
          src="/images/card-bg-dashboard.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-15 dark:opacity-35 dark:mix-blend-screen"
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge variant="ai" size="sm" icon={<Sparkles size={12} strokeWidth={1.75} />}>
              Offer Management
            </Badge>
            <h1 className="mt-3 text-h1 text-secondary-900 dark:text-white">Offers Tracker</h1>
            <p className="mt-2 max-w-2xl text-body-sm text-secondary-500 dark:text-secondary-300">
              Track the compensation package details, start dates, and lifecycle statuses of offers you have initiated.
            </p>
          </div>
          <div className="hidden h-24 w-24 items-center justify-center rounded-3xl bg-indigo-500 text-white shadow-glow-primary sm:flex">
            <FileCheck size={42} strokeWidth={1.5} />
          </div>
        </div>
      </section>

      {/* Main Content Table Card */}
      <Card className="glass-card-heavy overflow-hidden border-none p-0">
        <CardHeader className="mb-0 p-6 pb-4">
          <div>
            <CardTitle>Initiated Packages</CardTitle>
            <CardDescription>
              A tracking view of all compensation contracts waiting for Talent Acquisition dispatch or candidate response.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3 p-6 pt-0">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : offers.length === 0 ? (
            <Card className="border-none py-12">
              <EmptyState
                icon={FileCheck}
                title="No offers found"
                description="You haven't initiated any job packages yet. Proceed to a candidate's completed interview feedback loop to start one."
              />
            </Card>
          ) : (
            <Table density="comfortable">
              <TableHeader>
                <TableRow isHeader>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Offered Package</TableHead>
                  <TableHead>Proposed Start Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.map((offer) => (
                  <TableRow
                    key={offer.id}
                    className="cursor-pointer group hover:bg-secondary-50/50 dark:hover:bg-white/5"
                    onClick={() => navigate(`/hiring-manager/applications/${offer.applicationId}/offer`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        navigate(`/hiring-manager/applications/${offer.applicationId}/offer`);
                      }
                    }}
                    role="link"
                    tabIndex={0}
                  >
                    <TableCell className="font-semibold text-secondary-900 dark:text-white">
                      {offer.candidateName}
                    </TableCell>
                    <TableCell className="text-secondary-600 dark:text-secondary-300 font-medium">
                      {offer.salaryCurrency} {offer.offeredSalary.toLocaleString()} / year
                    </TableCell>
                    <TableCell className="text-secondary-600 dark:text-secondary-300">
                      {formatDate(offer.proposedStartDate)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={offer.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <ChevronRight size={16} className="text-secondary-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Offers;
