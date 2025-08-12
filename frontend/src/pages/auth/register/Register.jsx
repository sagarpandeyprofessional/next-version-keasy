import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Register.module.css';

const Register = () => {


  return (
    <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center p-3">
      <div className="row w-100 max-w-1000 mx-auto">
        {/* Left Image - hidden on small */}
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

        {/* Right Form */}
        <div className="col-12 col-md-6 d-flex justify-content-center align-items-center">
          <form className="w-100" style={{ maxWidth: 400 }} noValidate >
            <h2 className="mb-4">Create an account</h2>

            <div className="mb-3">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                autoComplete="username"
                required
                className={`form-control ${styles.input}`}
              />
              <small className="form-text text-muted">
                Username must be 3-20 characters and can contain letters, numbers, and underscores.
              </small>
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email address</label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                required
                className={`form-control ${styles.input}`}
              />
            </div>

            
            <div className="mb-3">
              <label htmlFor="firstName" className="form-label">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                autoComplete="firstName"
                required
                className={`form-control ${styles.input}`}
              />
            </div>

            
            <div className="mb-3">
              <label htmlFor="lastName" className="form-label">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                autoComplete="lastName"
                required
                className={`form-control ${styles.input}`}
              />
            </div>


            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                autoComplete="new-password"
                required
                className={`form-control ${styles.input}`}
              />
              <small className="form-text text-muted">
                Password must be at least 8 characters long.
              </small>
            </div>

            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                autoComplete="new-password"
                required
                className={`form-control ${styles.input}`}
              />
            </div>

            <button type="submit" className="btn btn-dark w-100 mt-3">
              Sign up
            </button>

            <div className="mt-3 text-center">
              <p>
                Already have an account?{' '}
                <Link
                  to="/login"
                  className={styles.loginLink}
                >
                  Log in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register