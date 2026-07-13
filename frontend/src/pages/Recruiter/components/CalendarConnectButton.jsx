import { useState } from 'react';
import PropTypes from 'prop-types';
import { CalendarCheck, CalendarPlus, Unplug } from 'lucide-react';
import { Button } from '../../../components/ui';

export function CalendarConnectButton({ provider = 'Google Calendar' }) {
  const [isConnected, setIsConnected] = useState(false);

  if (isConnected) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          leftIcon={<CalendarCheck size={14} strokeWidth={1.75} />}
          disabled
        >
          Connected
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          leftIcon={<Unplug size={14} strokeWidth={1.75} />}
          onClick={() => setIsConnected(false)}
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      leftIcon={<CalendarPlus size={14} strokeWidth={1.75} />}
      onClick={() => setIsConnected(true)}
    >
      Connect {provider}
    </Button>
  );
}

CalendarConnectButton.propTypes = {
  provider: PropTypes.oneOf(['Google Calendar', 'Outlook']),
};

export default CalendarConnectButton;
