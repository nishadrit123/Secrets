# Secrets
Share your secrets and don't let anybody else know about them.
Register to the site if you are a new user.
You can get signed in by creating a new account or signing in by google.
Google OAuth has been used to achieve this.
This is how OAuth API works:
  1) Your site redirects a user to a specific Google URL that includes the list of requested permissions as URL query parameters.
  2) The user is prompted to consent to the permissions your app requests.
  3) Google redirects your user back to your site and provides an authorization code.

By choosing this option, users dont have to worry about their login passwords.
The matainence is done by the google servers.
Otherwise the users can prefer creating an account.

HTML, CSS, JS and EJS has been used for building frontend.
Node js and express for the backend.
The username and passwords(in encrypted form) are stored in mongoDB database.
