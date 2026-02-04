"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

type AuthUser = {
  id: string;
  email: string | null;
};

type AuthContextType = {
  session: Session | null;
  user: AuthUser | null;
  profile: Record<string, unknown> | null;
  loading: boolean;
  signUp: (args: { username: string; email: string; password: string }) => Promise<void>;
  signIn: (args: { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  fetchUserProfile: (uid: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  handleGoogleAuth: (redirectTo?: string) => Promise<void>;
  createOrUpdateProfile: (profileData: Record<string, unknown>) => Promise<Record<string, unknown>>;
  hasCompletedProfile: () => boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      setSession(currentSession);
      if (currentSession?.user) await fetchUserProfile(currentSession.user.id);
      setLoading(false);

      supabase.auth.onAuthStateChange((_event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          fetchUserProfile(newSession.user.id);
        } else {
          setUser(null);
          setProfile(null);
          localStorage.removeItem("user");
          localStorage.removeItem("profile");
        }
      });
    };

    init();
  }, []);

  const fetchUserProfile = async (uid: string) => {
    const currentSession = await supabase.auth.getSession();
    const email = currentSession.data.session?.user?.email || null;
    setUser({ id: uid, email });

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", uid)
      .single();

    if (!profileError && profileData) {
      setProfile(profileData as Record<string, unknown>);
      localStorage.setItem("user", JSON.stringify({ id: uid, email }));
      localStorage.setItem("profile", JSON.stringify(profileData));
    } else {
      setProfile(null);
      localStorage.removeItem("profile");
    }
  };

  const signUp = async ({ username, email, password }: { username: string; email: string; password: string }) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    await supabase.from("profiles").insert({
      user_id: data.user?.id,
      username,
    });
  };

  const signIn = async ({ email, password }: { email: string; password: string }) => {
    const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) throw signInError;

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", sessionData.user.id)
      .single();

    if (!profileError && profileData) setProfile(profileData as Record<string, unknown>);

    setUser({ id: sessionData.user.id, email });
    setSession(sessionData as unknown as Session);

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

  const refreshSession = async () => {
    const {
      data: { session: currentSession },
      error,
    } = await supabase.auth.getSession();
    if (error) throw error;
    setSession(currentSession);
    if (currentSession?.user) {
      await fetchUserProfile(currentSession.user.id);
    } else {
      setUser(null);
      setProfile(null);
      localStorage.removeItem("user");
      localStorage.removeItem("profile");
    }
  };

  const handleGoogleAuth = async (redirectTo = "/") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}${redirectTo}`,
      },
    });

    if (error) throw error;
  };

  const createOrUpdateProfile = async (profileData: Record<string, unknown>) => {
    if (!session?.user) throw new Error("No user logged in");

    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        user_id: session.user.id,
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    const safeData = data as Record<string, unknown>;
    setProfile(safeData);
    localStorage.setItem("profile", JSON.stringify(safeData));
    return safeData;
  };

  const hasCompletedProfile = () => {
    return Boolean(profile && (profile as Record<string, unknown>).username);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        fetchUserProfile,
        refreshSession,
        handleGoogleAuth,
        createOrUpdateProfile,
        hasCompletedProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
