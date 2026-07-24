import PropTypes from 'prop-types';
import { Download, ExternalLink } from 'lucide-react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '../../../components/ui';

const formatDateRange = (startDate, endDate, isCurrent) => {
  const start = startDate ? new Date(startDate).getFullYear() : 'Unknown';
  const end = isCurrent ? 'Present' : endDate ? new Date(endDate).getFullYear() : 'Unknown';

  return `${start} - ${end}`;
};

export function CandidateProfileView({ candidateProfile }) {
  if (!candidateProfile) {
    return (
      <Card>
        <CardContent className="text-body-md text-secondary-500">
          No candidate profile is available.
        </CardContent>
      </Card>
    );
  }

  const {
    firstName,
    lastName,
    email,
    summaryText,
    portfolioUrl,
    linkedinUrl,
    githubUrl,
    locationCity,
    locationCountry,
    yearsOfExperience,
    resumeUrl,
    education = [],
    workExperience = [],
    skills = [],
  } = candidateProfile;

  const fullName = [firstName, lastName].filter(Boolean).join(' ');
  const location = [locationCity, locationCountry].filter(Boolean).join(', ');

  const openResume = () => {
    if (resumeUrl) {
      window.open(resumeUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card className="space-y-6">
      <CardHeader className="mb-0 flex-col gap-3 sm:flex-row">
        <div>
          <CardTitle>{fullName || 'Candidate Profile'}</CardTitle>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-body-sm text-secondary-500">
            <span>{email}</span>
            {location && <span>{location}</span>}
            {Number.isFinite(yearsOfExperience) && (
              <span>{yearsOfExperience} years experience</span>
            )}
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          leftIcon={<Download size={14} strokeWidth={1.75} />}
          disabled={!resumeUrl}
          onClick={openResume}
          className="w-full sm:w-auto justify-center"
        >
          Resume
        </Button>
      </CardHeader>

      {summaryText && (
        <section>
          <h4 className="text-body-lg font-semibold text-secondary-900">Summary</h4>
          <p className="mt-2 text-body-md leading-relaxed text-secondary-600">{summaryText}</p>
        </section>
      )}

      {(portfolioUrl || linkedinUrl || githubUrl) && (
        <section>
          <h4 className="text-body-lg font-semibold text-secondary-900">Links</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              ['Portfolio', portfolioUrl],
              ['LinkedIn', linkedinUrl],
              ['GitHub', githubUrl],
            ]
              .filter(([, url]) => Boolean(url))
              .map(([label, url]) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-body-sm font-semibold text-primary-700 hover:text-primary-800"
                >
                  {label}
                  <ExternalLink size={13} strokeWidth={1.75} />
                </a>
              ))}
          </div>
        </section>
      )}

      {workExperience.length > 0 && (
        <section>
          <h4 className="text-body-lg font-semibold text-secondary-900">Work Experience</h4>
          <div className="mt-3 space-y-4">
            {workExperience.map((experience) => (
              <article
                key={`${experience.companyName}-${experience.jobTitle}-${experience.startDate}`}
                className="border-l-2 border-primary-100 pl-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h5 className="text-body-md font-semibold text-secondary-900">
                    {experience.jobTitle}
                  </h5>
                  <span className="text-caption font-semibold text-secondary-500">
                    {formatDateRange(experience.startDate, experience.endDate, experience.isCurrent)}
                  </span>
                </div>
                <p className="text-body-sm text-secondary-600">
                  {experience.companyName}
                  {experience.location ? `, ${experience.location}` : ''}
                </p>
                {experience.description && (
                  <p className="mt-2 text-body-sm leading-relaxed text-secondary-600">
                    {experience.description}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {education.length > 0 && (
        <section>
          <h4 className="text-body-lg font-semibold text-secondary-900">Education</h4>
          <div className="mt-3 space-y-3">
            {education.map((item) => (
              <article
                key={`${item.institutionName}-${item.degree}-${item.startDate}`}
                className="rounded-card border border-secondary-100 p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h5 className="text-body-md font-semibold text-secondary-900">
                    {item.degree} in {item.fieldOfStudy}
                  </h5>
                  <span className="text-caption font-semibold text-secondary-500">
                    {formatDateRange(item.startDate, item.endDate, item.isCurrent)}
                  </span>
                </div>
                <p className="text-body-sm text-secondary-600">{item.institutionName}</p>
                {item.grade && <p className="mt-1 text-caption text-secondary-500">{item.grade}</p>}
              </article>
            ))}
          </div>
        </section>
      )}

      {skills.length > 0 && (
        <section>
          <h4 className="text-body-lg font-semibold text-secondary-900">Skills</h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={`${skill.name}-${skill.proficiencyLevel}`}
                className="inline-flex items-center gap-2 rounded-full bg-secondary-50 px-3 py-1.5 text-body-sm text-secondary-700"
              >
                <span className="font-semibold">{skill.name}</span>
                <span>{skill.proficiencyLevel}</span>
                {Number.isFinite(skill.yearsOfExperience) && (
                  <span className="text-secondary-500">{skill.yearsOfExperience} yrs</span>
                )}
                {skill.extractedByAi && (
                  <Badge variant="ai" size="sm">
                    AI
                  </Badge>
                )}
              </span>
            ))}
          </div>
        </section>
      )}
    </Card>
  );
}

CandidateProfileView.propTypes = {
  candidateProfile: PropTypes.shape({
    userId: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string,
    summaryText: PropTypes.string,
    portfolioUrl: PropTypes.string,
    linkedinUrl: PropTypes.string,
    githubUrl: PropTypes.string,
    locationCity: PropTypes.string,
    locationCountry: PropTypes.string,
    yearsOfExperience: PropTypes.number,
    resumeUrl: PropTypes.string,
    education: PropTypes.arrayOf(
      PropTypes.shape({
        institutionName: PropTypes.string,
        degree: PropTypes.string,
        fieldOfStudy: PropTypes.string,
        startDate: PropTypes.string,
        endDate: PropTypes.string,
        isCurrent: PropTypes.bool,
        grade: PropTypes.string,
      })
    ),
    workExperience: PropTypes.arrayOf(
      PropTypes.shape({
        companyName: PropTypes.string,
        jobTitle: PropTypes.string,
        location: PropTypes.string,
        startDate: PropTypes.string,
        endDate: PropTypes.string,
        isCurrent: PropTypes.bool,
        description: PropTypes.string,
      })
    ),
    skills: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        proficiencyLevel: PropTypes.string,
        yearsOfExperience: PropTypes.number,
        extractedByAi: PropTypes.bool,
      })
    ),
  }),
};

CandidateProfileView.defaultProps = {
  candidateProfile: null,
};

export default CandidateProfileView;
