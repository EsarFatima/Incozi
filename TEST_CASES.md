# Test Cases: Incozi Business Services Platform

Based on the structure provided in the test documentation (Test ID, Description, Pre-conditions, Input, Detailed Steps, Expected Results), here are the test cases for the Incozi website modules.

## Summary of Modules
| Module Name | Description | Test Cases |
|-------------|-------------|------------|
| **Module 1: Authentication & User Management** | Login, Registration, Password Reset, Profile | TC-AUTH-01 to TC-AUTH-04 |
| **Module 2: Service Booking & Order Wizard** | Service selection, scheduling, wizard flow | TC-BOOK-01 to TC-BOOK-03 |
| **Module 3: Real-time Chat System** | Messaging, file attachments, notifications | TC-CHAT-01 to TC-CHAT-02 |
| **Module 4: Payments & Checkout** | Cart management, transaction processing | TC-PAY-01 to TC-PAY-02 |
| **Module 5: Admin Dashboard** | Client/Booking management, reports | TC-ADM-01 to TC-ADM-02 |

---

## Module 1: Authentication & User Management

### TC-AUTH-01: User Registration
| Field | Details |
|-------|---------|
| **Identifier** | TC-AUTH-01 |
| **Short Description** | Verify a new user can successfully create an account |
| **Pre-condition(s)** | User is on the registration page and not logged in |
| **Input Data** | Valid name, email, and password |
| **Detailed Steps** | 1. Navigate to Registration page<br>2. Enter valid details in all fields<br>3. Click "Sign Up" button |
| **Expected Result(s)** | User is redirected to the dashboard; account created in Supabase |

### TC-AUTH-02: User Login
| Field | Details |
|-------|---------|
| **Identifier** | TC-AUTH-02 |
| **Short Description** | Verify existing user can login with valid credentials |
| **Pre-condition(s)** | User has a registered account |
| **Input Data** | Correct email and password |
| **Detailed Steps** | 1. Navigate to Login page<br>2. Enter correct credentials<br>3. Click "Login" |
| **Expected Result(s)** | Session established; redirected to personal dashboard |

---

## Module 2: Service Booking & Order Wizard

### TC-BOOK-01: Order Wizard Completion
| Field | Details |
|-------|---------|
| **Identifier** | TC-BOOK-01 |
| **Short Description** | Testing the multi-step order wizard for service procurement |
| **Pre-condition(s)** | User is logged in and has selected a service (e.g., Incorporation) |
| **Input Data** | Required business info in wizard steps |
| **Detailed Steps** | 1. Launch `order-wizard.html`<br>2. Complete Step 1: Business Details<br>3. Complete Step 2: Service Selection<br>4. Submit wizard |
| **Expected Result(s)** | Service added to cart/order history; "Success" message displayed |

---

## Module 3: Real-time Chat System

### TC-CHAT-01: Message Transmission
| Field | Details |
|-------|---------|
| **Identifier** | TC-CHAT-01 |
| **Short Description** | Verify real-time message exchange between client and admin |
| **Pre-condition(s)** | Both Client and Admin are logged in and in a common chat room |
| **Input Data** | Text message: "Hello, I need help with my filing" |
| **Detailed Steps** | 1. Client types message in chat input<br>2. Client clicks "Send"<br>3. Admin views chat window |
| **Expected Result(s)** | Message appears instantly for both parties without page refresh |

---

## Module 4: Payments & Checkout

### TC-PAY-01: Cart Badge Update
| Field | Details |
|-------|---------|
| **Identifier** | TC-PAY-01 |
| **Short Description** | Verify cart badge reflects correctly when items are added |
| **Pre-condition(s)** | Cart is currently empty |
| **Input Data** | Add "Bookkeeping" service |
| **Detailed Steps** | 1. Navigate to Services page<br>2. Click "Add to Cart" on a service<br>3. Observe the header cart icon |
| **Expected Result(s)** | Red badge appears on cart icon showing number "1" |

---

## Module 5: Admin Dashboard

### TC-ADM-01: Booking Management
| Field | Details |
|-------|---------|
| **Identifier** | TC-ADM-01 |
| **Short Description** | Verify Admin can update booking status |
| **Pre-condition(s)** | Admin is logged in; at least one active booking exists |
| **Input Data** | Update status to "Completed" |
| **Detailed Steps** | 1. Go to `admin-bookings.html`<br>2. Select a "Pending" booking<br>3. Change status to "Completed" and save |
| **Expected Result(s)** | Status updated in database; Client receives notification/status change |
