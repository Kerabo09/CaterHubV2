# CaterHub `src` folder map

Find any page by its address (URL) and open the file next to it.

## Public pages (anyone)
| Page | URL | File |
|---|---|---|
| Home | `/` | `public/Home.jsx` |
| Browse caterers (filters, saved, compare tray) | `/caterers` | `public/CatererList.jsx` |
| Caterer profile (tabs, date check, reviews) | `/caterer/:id` | `public/CatererProfile.jsx` |
| Gallery & availability | `/caterer/:id/gallery` | `public/CatererGallery.jsx` |
| Package details (estimate) | `/package/:id` | `public/PackageDetail.jsx` |
| Compare caterers | `/compare` | `public/Compare.jsx` |
| Saved caterers | `/saved` | `public/Saved.jsx` |
| Log in (one login for everyone) | `/login` | `auth/Login.jsx` |
| Create account (customer or caterer owner is chosen here) | `/signup` | `auth/Signup.jsx` |

## Customer pages
| Page | URL | File |
|---|---|---|
| Send an inquiry | `/inquire/:id` | `customer/SendInquiry.jsx` |
| Inquiry sent | `/inquire/sent/:ref` | `customer/InquirySent.jsx` |
| My inquiries | `/my` | `customer/MyInquiries.jsx` |
| Inquiry details | `/my/:ref` | `customer/InquiryDetail.jsx` |
| Notifications | `/notes` | `customer/Notifications.jsx` (list: `shared/NotificationsList.jsx`) |

## Owner workspace (`owner/OwnerLayout.jsx` = sidebar + top bar)
| Page | URL | File |
|---|---|---|
| Overview | `/owner` | `owner/Dashboard.jsx` |
| Inquiries | `/owner/inq` | `owner/Inquiries.jsx` |
| Respond to an inquiry | `/owner/inq/:ref` | `owner/RespondInquiry.jsx` |
| Availability calendar | `/owner/av` | `owner/Availability.jsx` |
| Packages | `/owner/pk` | `owner/Packages.jsx` |
| Add / edit package | `/owner/pk/:id` | `owner/PackageEditor.jsx` |
| Business profile | `/owner/pf` | `owner/BusinessProfile.jsx` |
| Notifications | `/owner/nt` | `owner/OwnerNotifications.jsx` |

## Shared code
| File | What it is |
|---|---|
| `App.jsx` | The list of all pages (routes) |
| `styles.css` | The whole design (colors, fonts, buttons, cards, calendar, owner workspace, mobile) |
| `shared/Header.jsx` | Top menu and footer |
| `shared/lib.jsx` | Helpers (peso, dates, toast, loading, upload, status badge) |
| `shared/saved.js` | Saved caterers and compare list (kept in the browser) |
| `shared/AvailCalendar.jsx` | The availability calendar customers see |
| `shared/supabase.js`, `shared/AuthContext.jsx` | Database connection and login |
