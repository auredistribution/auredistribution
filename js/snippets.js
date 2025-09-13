// Centralised shared text blocks for redistribution workspaces
// Keeping raw HTML strings so event pages stay lightweight.

window.REDIST_SHARED_SNIPPETS = {
  headings: {
    instructions: 'Instructions',
    disclaimer: 'Disclaimer',
    attribution: 'Attribution'
  },
  instructions: [
    '1. Click any district in the left panel (within the Divisions tab) to select or unselect it',
    '2. Click on any SA1 on the map to transfer it into the selected district',
    '3. Click on any transferred SA1s to return them to their original district',
    '4. Shift-click can be used to transfer or return whole SA2s',
    "5. New divisions can be created by clicking the 'New' button next to a group label",
  ],
  disclaimer: 'This tool presents raw data provided by official sources. Calculations use ' +
    'published enrolment data; aggregated results are provided without warranty. No guarantee is ' +
    'made that aggregate enrolment calculations will be error-free. The tool is offered as-is, and any usage of the tool is made at the user\'s own risk.',
  attribution: 'The original idea and project was developed by Angas, available <a href="https://auredistribution.neocities.org/" target="_blank" rel="noopener">here</a> and <a href="https://github.com/auredistribution/qld-state-redistribution" target="_blank" rel="noopener">on GitHub</a>.'
};
