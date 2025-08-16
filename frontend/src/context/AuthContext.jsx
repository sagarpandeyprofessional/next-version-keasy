// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../api/supabase-client";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null); // { id, email }
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize session & profile
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user) await fetchUserProfile(session.user.id);
      setLoading(false);

      // Listen to auth state changes
      supabase.auth.onAuthStateChange((_event, newSession) => {
        setSession(newSession);
        if (newSession?.user) fetchUserProfile(newSession.user.id);
        else {
          setUser(null);
          setProfile(null);
          localStorage.removeItem("user");
          localStorage.removeItem("profile");
        }
      });
    };
    init();
  }, []);

  // Fetch profile and set user object
  const fetchUserProfile = async (uid) => {
    const currentSession = await supabase.auth.getSession();
    const email = currentSession.data.session?.user?.email || null;
    setUser({ id: uid, email });

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", uid)
      .single();

    if (!profileError && profileData) {
      setProfile(profileData);
      localStorage.setItem("user", JSON.stringify({ id: uid, email }));
      localStorage.setItem("profile", JSON.stringify(profileData));
    } else {
      setProfile(null);
      localStorage.removeItem("profile");
    }
  };

  // Sign up: create Supabase user + profiles table entry
  const signUp = async ({ username, email, password }) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    // Insert profile linked by user_id
    await supabase.from("profiles").insert({
      user_id: data.user.id,
      username,
    });
  };

  // Sign in: now using only email + password
  const signIn = async ({ email, password }) => {
    const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) throw signInError;

    // Load profile into context
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", sessionData.user.id)
      .single();

    if (!profileError && profileData) setProfile(profileData);

    setUser({ id: sessionData.user.id, email });
    setSession(sessionData);

    localStorage.setItem("user", JSON.stringify({ id: sessionData.user.id, email }));
    if (profileData) localStorage.setItem("profile", JSON.stringify(profileData));
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
    localStorage.removeItem("user");
    localStorage.removeItem("profile");
  };

  return (
    <AuthContext.Provider
      value={{ session, user, profile, loading, signUp, signIn, signOut, fetchUserProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);