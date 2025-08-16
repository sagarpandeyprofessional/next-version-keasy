// src/pages/SignIn.jsx
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import styles from './styles/SignIn.module.css';

const SignIn = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signIn({ email, password });
      navigate("/profile");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className={`d-flex flex-column min-vh-100 justify-content-center align-items-center p-3`}>
        <div className="row w-100 max-w-1000 mx-auto">
            {/* Left image - hidden on small */}
            <div className="d-none d-md-flex col-md-6 justify-content-center align-items-center">
            <div className="overflow-hidden rounded" style={{ maxWidth: 400, maxHeight: 400 }}>
                <img
                src="/images/auth-illustration.jpg"
                alt="Authentication illustration"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                loading="eager"
                />
            </div>
            </div>

            {/* Right form */}
            <div className="col-12 col-md-6 d-flex justify-content-center align-items-center">
            <form className="w-100" style={{ maxWidth: 400 }} onSubmit={handleSubmit} noValidate>
                <h2 className="mb-4">Sign in to your account</h2>

                

                <div className="mb-3">
                <label htmlFor="email" className="form-label">
                    Email
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="email"
                    placeholder="Email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`form-control ${styles.input}`}
                />
                </div>

                <div className="mb-3 d-flex justify-content-between align-items-center">
                <label htmlFor="password" className="form-label mb-0">
                    Password
                </label>
                {/* <Link
                    to={'/'}
                    className={styles.forgotLink}
                >
                    Forgot password?
                </Link> */}
                </div>
                <input
                type="password"
                id="password"
                name="password"
                autoComplete="current-password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`form-control ${styles.input}`}
                />

                <button
                type="submit"
                className="btn btn-dark w-100 mt-4"
                >
                Sign in
                </button>

                <div className="mt-3 text-center">
                <p>
                    Don&apos;t have an account?{' '}
                    <Link
                    to={'/sign-up'}
                    className={styles.signupLink}
                    >
                    Sign up
                    </Link>
                </p>
                </div>
            </form>
            </div>
        </div>
        </div>
  );
};

export default SignIn;