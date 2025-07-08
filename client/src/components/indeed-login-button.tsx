import React from 'react';

// Replace with your actual client_id and redirect_uri
const INDEED_CLIENT_ID = import.meta.env.VITE_INDEED_CLIENT_ID || 'YOUR_CLIENT_ID';
const INDEED_REDIRECT_URI = import.meta.env.VITE_INDEED_REDIRECT_URI || 'YOUR_REDIRECT_URI';
const STATE = 'jobfitai';
const SCOPE = 'email offline_access employer_access';

const indeedAuthUrl = `https://secure.indeed.com/oauth/v2/authorize?client_id=${INDEED_CLIENT_ID}` +
  `&redirect_uri=${encodeURIComponent(INDEED_REDIRECT_URI)}` +
  `&response_type=code&state=${STATE}&scope=${encodeURIComponent(SCOPE)}`;

export function IndeedLoginButton() {
  return (
    <a href={indeedAuthUrl}>
      {/* Replace with Indeed-provided image or use a local asset */}
      <img src="/indeed-button.png" alt="Log in with Indeed" style={{ height: 40 }} />
    </a>
  );
}
