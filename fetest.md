# RoamNest Frontend Test Notes

## 0. How Do I Test The Frontend Immediately Manually?

### Prerequisites

1. Start PostgreSQL and make sure the RoamNest database exists.
2. Apply or verify the RBAC/database setup from:

```text
backend/src/main/resources/sql/rbac_setup.sql
```

3. Start the backend:

```bash
cd backend
mvn spring-boot:run
```

4. Confirm the backend is running at:

```text
http://localhost:8080
```

5. Start the frontend in a second terminal:

```bash
cd frontend
npm run dev
```

6. Open:

```text
http://localhost:5173
```

### Fast Manual Demo Flow

1. Open `http://localhost:5173`.
2. Click **Create an account**.
3. Create an owner account:
   - Role: `OWNER`
   - Fill full name, username, password, phone, address.
4. After signup, confirm you land on `/home`.
5. Click **Create Listing**.
6. Fill the property form:
   - title
   - description
   - location
   - address
   - price per night
   - max guests
   - available checked
7. Submit the listing.
8. Confirm you are redirected to the property detail page.
9. Logout.
10. Create or login as a `USER`.
11. Go to **Search & Filter** or `/properties`.
12. Confirm the owner-created property appears.
13. Click the property card.
14. On the property detail page, fill:
   - check-in date
   - check-out date
   - guests
15. Click **Send Booking Request**.
16. Confirm you are redirected to `/trips`.
17. Confirm the booking appears with `PENDING` status.
18. Logout.
19. Login as the owner account.
20. Open **Booking Requests**.
21. Confirm the request appears with:
   - property title
   - dates
   - guest count
   - anonymous guest reference
   - fairness/privacy notice
22. Add an optional note.
23. Approve the booking.
24. Logout.
25. Login again as the user.
26. Open **Trips**.
27. Confirm the booking status is now `APPROVED`.
28. Open **Messages**.
29. Select the approved booking.
30. Send a message.
31. Logout.
32. Login as owner.
33. Open **Messages**.
34. Confirm the approved booking conversation appears.
35. Reply to the user.
36. Login as user again and confirm the reply appears.
37. From the approved trip, submit a review.
38. Open the property detail page and confirm reviews/rating data appears.
39. Login as admin.
40. Open the admin dashboard and confirm:
   - summary cards load
   - users table loads
   - properties table loads
   - bookings table loads
   - booking status filter works

### Useful Demo Accounts

If seed accounts already exist, try:

```text
admin / admin
owner / owner
user / user
```

If they do not exist, create owner/user accounts through signup. Admin may still need to exist in the database depending on your seed data.

### Quick Verification Commands

Frontend production build:

```bash
cd frontend
npm run build
```

Backend tests:

```bash
cd backend
mvn test
```

## 1. What Was Implemented In This Iteration

- Added `/signup` with full signup form for `USER` and `OWNER`.
- Wired signup to `POST /api/auth/signup`, session storage, and app login state.
- Added `/owner/properties/new` so owners can create listings.
- Wired create listing to `POST /api/properties`.
- Added `/properties/:propertyId` property detail page.
- Added backend `GET /api/properties/{propertyId}`.
- Added property reviews display on the detail page.
- Added booking request form on property detail for `USER`.
- Wired booking creation to `POST /api/bookings`.
- Made home and search property cards clickable.
- Replaced disabled property booking button with **View & Book**.
- Replaced mock Trips UI with real booking data.
- Added backend `GET /api/bookings/me`.
- Trips now shows pending, approved, rejected, and cancelled booking status.
- Added review submission UI from approved trips.
- Wired review submission to `POST /api/bookings/{bookingId}/review`.
- Replaced mock Messages UI with backend-backed messaging.
- Messages now uses approved bookings as conversations.
- Wired messages to:
  - `GET /api/bookings/{bookingId}/messages`
  - `POST /api/bookings/{bookingId}/messages`
- Enabled `/messages` for both `USER` and `OWNER`.
- Added owner messaging entry point from home.
- Improved property search with clickable cards, clear filters, active filter chips, and loading placeholders.
- Improved owner booking queue with:
  - reject confirmation
  - disabled action buttons while working
  - requested date display
  - more prominent fairness/privacy badge
- Verified:
  - `npm run build` passes
  - `mvn test` passes
  - edited files had no linter errors

## 2. What Is Left According To The Document

- Add a dedicated owner property management page.
- Optionally add `GET /api/properties/owner` for owner dashboard/property management.
- Improve Home navigation further:
  - owner property management shortcut
  - richer property cards
  - better responsive layout
- Improve Admin dashboard polish:
  - richer fairness review section
  - recent rejected bookings panel
  - stronger empty/error states
  - more mobile-friendly tables
- Improve property search UI further:
  - nicer unique image placeholders
  - sticky filter bar
  - better skeleton cards
  - more Airbnb-like layout polish
- Add stronger review eligibility rules in the UI if needed:
  - prevent duplicate review attempts visually
  - only show review after completed stay if the backend enforces that later
- Add better message UX:
  - refresh/poll messages
  - show last message preview from backend
  - show send failures inline per thread
  - support deep-linking to a booking conversation
- Add cancellation flow if backend supports cancelled bookings later.
- Add demo seed data or a repeatable seed script for:
  - admin account
  - owner account
  - user account
  - sample property
  - sample pending booking
  - sample approved/rejected booking
  - sample review
- Improve mobile responsiveness across newly added pages.
- Replace remaining mock-heavy or low-priority pages if needed, especially `Wishlists` and parts of `Profile`.
