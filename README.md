bombay
======

Bombay Band Management System

A system for managing many of the pickier aspects of running a band.  It should eventually support repertoire,
setlist, membership and calendar management for multiple bands within a single database.

But, really, it's mostly about me learning more Javascript and Node.js stuff.

ToDo:
- Client-side tests.
- Server-side tests for database modifications.
- There needs to be a way for members who are not band admins to propose song choices to the band admin.
- Adding members to a band needs to be a two-step process.  Both the band admin and new member need to be
  involved.

- The setlist management UI is non-existant.
- The calendar handler is non-existant.
- Authentication through Google.
- Integration of Google Calendars.
- Sorting and Filtering on lists.
- Email reports on lists.
- Rename the client side Javascript modules to be camel case instead of 'word'_'word'.
- Simplify some of the UI.
  - Use drag and drop.
  - Allow CSV upload.
  - "Bulk" adds.

- Better handling of boolean fields from the database (system_admin, band_admin);
