// Centralised shared text blocks for redistribution workspaces
// Keeping raw HTML strings so event pages stay lightweight.

window.REDIST_SHARED_SNIPPETS = {
  headings: {
    instructions: 'Instructions',
    disclaimer: 'Disclaimer',
    attribution: 'Contributions'
  },
  instructions: [
    '1. Click the Divisions tab up top to view the list of divisions, and their current enrolments',
    '2. Click one of the divisions to select or unselect it',
    '3. Click on any SA1 on the map to transfer it into the selected district',
    '4. Click on any transferred SA1s to return them to their original district',
    '5. Shift-click an SA1 to transfer or return the whole SA2 at once',
    '6. Right-click an SA1 on the map to select the SA1\'s division without transferring it',
    "7. New divisions can be created by clicking the 'New' button next to a group label",
    "8. Clicking a Group Label will collapse that group",
    "9. Right-click a division to edit its name or alter its colour"
  ],
  disclaimer: 'This tool presents raw data provided by official sources. Calculations use ' +
    'published enrolment data; aggregated results are provided without warranty. No guarantee is ' +
    'made that aggregate enrolment calculations will be error-free. The tool is offered as-is, and any usage of the tool is made at the user\'s own risk.',
  attribution: 'Ideas and suggestions welcome - submit an Issue on <a target="_blank" href="https://github.com/auredistribution/auredistribution">GitHub</a>.'
};
