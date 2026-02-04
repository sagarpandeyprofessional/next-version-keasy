## **Authentication Rules & Logic**

### 1. **Username Rules (SignUp only)**

* Can contain **lowercase letters (a–z), numbers (0–9), underscores (\_), and periods (.)** only.
* **No spaces** or special characters other than `_` or `.` allowed.
* Must be **unique**: check availability in the `profiles` table before submission.
* ✅ Example: `john_doe123` → valid | `John Doe!` → invalid

**Logic:**

1. On change, validate format using regex: `/^[a-z0-9._]*$/`.
2. Debounce username input (e.g., 500ms) and check database via Supabase:

   ```js
   .from("profiles").select("id").eq("username", username).single();
   ```
3. Show live feedback: "Available" / "Already taken".

---

### 2. **Email Rules (SignUp & SignIn)**

* Must match standard email format: `example@domain.com`.
* **No spaces** allowed.

**Logic:**

1. Regex validation: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
2. Regex for no spaces: `/^\S*$/`
3. On submit, block form and show error if invalid:

   ```js
   if (!emailRules(email)) setError("❌ Please enter a valid email without spaces.");
   ```

---

### 3. **Password Rules (SignUp)**

* Minimum **8 characters**.
* Must include at least:

  * **1 uppercase letter**
  * **1 lowercase letter**
  * **1 number**
  * **1 special character** (`!@#$%^&*` etc.)
* **No spaces** allowed

**Logic:**

1. Validate using multiple regex checks:

   ```js
   const minLength = /.{8,}/;
   const upper = /[A-Z]/;
   const lower = /[a-z]/;
   const number = /[0-9]/;
   const special = /[^A-Za-z0-9]/;
   const noSpace = /^\S*$/;
   ```
2. On submit, block if any condition fails and show descriptive error.

**Password Match (Confirm Password)**

* Must match the `password` field exactly.
* Show live feedback while typing.

---

### 4. **Password Rules (SignIn)**

* **No spaces** allowed.
* Optionally, could enforce full rules (min 8 chars, uppercase, lowercase, number, special char) if stricter login validation is desired.

---

### 5. **Form Submission Logic**

#### SignUp Flow:

1. Validate username format → show error if invalid.
2. Validate email → show error if invalid.
3. Validate password → show error if invalid.
4. Validate confirm password matches → show error if mismatch.
5. Validate username availability → show error if taken.
6. Call `signUp({ username, email, password })`.
7. Show success alert: "Account created! Confirmation email sent."
8. Redirect to `/signin`.

#### SignIn Flow:

1. Validate email → show error if invalid.
2. Validate password → show error if contains spaces.
3. Call `signIn({ email, password })`.
4. Show errors from backend if login fails.
5. On success → redirect to `/`.

---

### 6. **UX Notes / Best Practices**

* Use **live feedback** for username availability and password match.
* Debounce database checks to reduce load.
* Use **descriptive error messages** for dev team consistency.
* Maintain **dark/light mode UI** consistent with SignUp page.