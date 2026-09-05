// Google Workspace Helper for Calendar, Gmail and Google Chat

export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/chat.messages.create',
  'https://www.googleapis.com/auth/chat.spaces.readonly'
];

export interface GoogleEventPayload {
  summary: string;
  description: string;
  startDateTime: string; // ISO
  endDateTime: string;   // ISO
  attendeeEmail?: string;
}

export interface GoogleEmailPayload {
  to: string;
  subject: string;
  body: string;
}

export interface GoogleChatMessagePayload {
  text: string;
}

// Global Google GSI token client handler
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}

/**
 * Creates an event in Google Calendar using Google Calendar REST API
 */
export async function createCalendarEvent(token: string, event: GoogleEventPayload) {
  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      summary: event.summary,
      description: event.description,
      start: {
        dateTime: event.startDateTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      },
      end: {
        dateTime: event.endDateTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      },
      attendees: event.attendeeEmail ? [{ email: event.attendeeEmail }] : [],
      reminders: {
        useDefault: true,
      },
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Error al crear evento: ${res.statusText}`);
  }

  return await res.json();
}

/**
 * Sends an email using Gmail REST API (users.messages.send)
 */
export async function sendGmailMessage(token: string, email: GoogleEmailPayload) {
  // Construct RFC 2822 message
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(email.subject)))}?=`;
  const messageParts = [
    `To: ${email.to}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${utf8Subject}`,
    '',
    email.body,
  ];
  const message = messageParts.join('\r\n');

  // URL-safe base64
  const encodedMessage = btoa(unescape(encodeURIComponent(message)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: encodedMessage,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Error al enviar email: ${res.statusText}`);
  }

  return await res.json();
}

/**
 * List spaces user has access to or post message
 */
export async function listChatSpaces(token: string) {
  const res = await fetch('https://chat.googleapis.com/v1/spaces', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Error al listar espacios de Chat: ${res.statusText}`);
  }
  return await res.json();
}

/**
 * Posts a message to a Google Chat space
 */
export async function sendChatMessage(token: string, spaceName: string, text: string) {
  const res = await fetch(`https://chat.googleapis.com/v1/${spaceName}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Error al enviar mensaje a Chat: ${res.statusText}`);
  }

  return await res.json();
}

/**
 * Get user profile info using access token
 */
export async function fetchGoogleUserProfile(token: string) {
  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) return null;
  return await res.json();
}
