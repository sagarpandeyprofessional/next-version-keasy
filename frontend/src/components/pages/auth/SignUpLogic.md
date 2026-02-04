## **User Registration Rules**

### **1. Username Rules**

* Must only contain:

  * Lowercase letters (`a-z`)
  * Numbers (`0-9`)
  * Underscores (`_`) or periods (`.`)
* No spaces or special characters other than `_` and `.` allowed.
* **Uniqueness:** Checked live against the `profiles` table in Supabase.
* **Example valid usernames:** `john_doe`, `user123`, `alex.smith`
* **Example invalid usernames:** `JohnDoe` (uppercase), `user!23` (special character `!`), `my name` (space)

---

### **2. Email Rules**

* Must be a valid email format: `local-part@domain.com`.
* No spaces allowed.
* **Uniqueness:** Checked only on signup via Supabase Auth — duplicate emails are rejected by the backend.
* **Example valid emails:** `example@gmail.com`, `user.name@company.co`
* **Example invalid emails:** `user@@gmail.com`, `user name@gmail.com`, `username@gmail`

---

### **3. Password Rules**

* Minimum length: **8 characters**
* Must contain at least:

  * **1 uppercase letter** (`A-Z`)
  * **1 lowercase letter** (`a-z`)
  * **1 number** (`0-9`)
  * **1 special character** (`!@#$%^&*()_+`, etc.)
* No spaces allowed.
* **Example valid password:** `Abc123$!`
* **Example invalid passwords:** `password123` (no uppercase, no special character), `Abc 123!` (contains space)

---

### **4. Confirm Password**

* Must **exactly match** the `password` field.
* Checked live on the frontend for user feedback.

---

### **5. Frontend Validations**

* Username uniqueness is checked **live with debounce** against the `profiles` table.
* Password confirmation is checked **live as the user types**.
* Email format is validated on the frontend.
* Error messages displayed inline with specific guidance.

---

### **6. Backend Validation / Supabase**

* Email uniqueness enforced via **Supabase Auth signup** (prevents duplicate accounts).
* Signup API (`signUp`) validates email, password, and username.
* Backend errors are propagated to the frontend as alert messages.
